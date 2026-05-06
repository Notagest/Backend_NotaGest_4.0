import { GoogleGenerativeAI } from '@google/generative-ai';
import FileModel from '../models/fileModel.js';
import PropertyModel from '../models/propertyModel.js';
import { IFile } from '../interfaces/IFile.js';

console.log('🤖 RAG Service carregado (Modo Gestor de Patrimônio)');

const getGenAI = () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('Chave de API do Gemini não configurada.');
    }
    return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
    try {
        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (error: any) {
        console.error("Erro no Embedding:", error.message);
        throw new Error("Erro na busca inteligente.");
    }
};

export const prepareFileText = (file: Partial<IFile>): string => {
    return `Título: ${file.title}. Valor: R$ ${file.value}. Data: ${file.purchaseDate}. Categoria: ${file.category}. Subcategoria: ${file.subcategory}.`;
};

export const getRelevantFiles = async (userId: string, query: string, limit: number = 15) => {
    try {
        const queryEmbedding = await generateEmbedding(query);
        const files = await FileModel.find({ user: userId }).populate('property');
        
        if (files.length === 0) return [];
        
        const scoredFiles = files.map(file => {
            if (file.embeddings && file.embeddings.length > 0) {
                const similarity = cosineSimilarity(queryEmbedding, file.embeddings);
                return { file, similarity };
            }
            return { file, similarity: 0 };
        });

        return scoredFiles
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit)
            .map(item => item.file);
    } catch (error: any) {
        console.error("Erro na busca:", error.message);
        return await FileModel.find({ user: userId }).populate('property').sort({ createdAt: -1 }).limit(limit);
    }
};

function cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0; let normA = 0; let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export const askAssistant = async (userId: string, userQuery: string) => {
    try {
        // 1. Buscar Notas Fiscais
        const relevantFiles = await getRelevantFiles(userId, userQuery);
        
        // 2. Buscar Imóveis (Cadastro Real)
        const properties = await PropertyModel.find({ user: userId });

        const propertyContext = properties.map(p => 
            `- IMÓVEL: ${p.nome} | TIPO: ${p.tipo} | LOCAL: ${p.rua}, ${p.numero}, ${p.bairro} - ${p.cidade}/${p.estado} (CEP: ${p.cep})`
        ).join('\n');

        const fileContext = relevantFiles.map(f => {
            const propName = (f.property as any)?.nome || 'Não especificado';
            return `- NOTA: ${f.title} | VALOR: R$ ${f.value} | DATA: ${new Date(f.purchaseDate!).toLocaleDateString('pt-BR')} | IMÓVEL: ${propName} | CATEGORIA: ${f.category}`;
        }).join('\n');

        const prompt = `Você é o "Especialista NotaGest".
O usuário perguntou: "${userQuery}"

--- SEUS IMÓVEIS CADASTRADOS ---
${propertyContext || 'Nenhum imóvel cadastrado no sistema ainda.'}

--- SUAS NOTAS FISCAIS ---
${fileContext || 'Nenhuma nota fiscal encontrada.'}

INSTRUÇÕES:
1. Responda baseado nos dados acima. Se o usuário perguntar quais imóveis ele tem, use a lista de "IMÓVEIS CADASTRADOS".
2. Se ele perguntar onde estão as construções, use os endereços da lista de imóveis.
3. Se perguntar gastos de um imóvel específico (ex: Centro), filtre as notas que têm "IMÓVEL: Centro" e some os valores.
4. Gere o relatório completo se solicitado, cruzando as notas com os imóveis.
5. Formate com tópicos, negritos e separe as seções claramente.`;

        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error: any) {
        console.error("Erro no Assistente:", error.message);
        return "Tive um problema ao consolidar os dados. Tente novamente?";
    }
};
