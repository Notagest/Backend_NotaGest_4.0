import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';

// Instanciar o SDK
// Verificamos a chave no escopo da requisição para evitar erro na inicialização do modulo se não houver chave ainda (ex: testes)
const getGenAI = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Chave de API do Gemini não configurada (GEMINI_API_KEY).');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

/**
 * Função utilitária para converter arquivo local num formato que o Gemini Aceita
 */
function fileToGenerativePart(filePath: string, mimeType: string) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType
    },
  };
}

export const extractInvoiceData = async (filePath: string, mimeType: string) => {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `Analise o documento anexado, que pode ser uma nota fiscal formal, um cupom, um recibo ou até mesmo uma anotação escrita à mão.
Sua tarefa é extrair o máximo de informação possível e retornar ESTRITAMENTE um objeto JSON.
Se o documento estiver muito rasurado, borrado ou ilegível a ponto de você não ter certeza, avise isso no campo "aiMessage".

Retorne EXATAMENTE este formato JSON:
{
  "title": "<Resumo curto para o título da nota (ex: Compra na Loja X). Se não conseguir identificar, retorne null>",
  "totalValue": <numero decimal com o valor total gasto. Ex: 154.30. Se não achar, retorne null>,
  "emissionDate": "<Data da compra no formato YYYY-MM-DD. Se não achar ou for completamente ilegível, retorne null>",
  "observation": "<Uma descrição detalhada dos itens. Se não achar nada, retorne null>",
  "category": "<Tente inferir: 'Construção' ou 'Reforma'. Se não souber, retorne null>",
  "subcategory": "<Tente inferir: 'Iluminação', 'Ferragem', 'Hidráulica', 'Acabamento', 'Pintura', 'Madeiramento', ou 'Outros'. Se não souber, retorne null>",
  "successStatus": "<'FULL' (todos essenciais encontrados), 'PARTIAL' (faltam dados chave), 'FAILED' (ilegível/não é recibo)>",
  "aiMessage": "<Mensagem amigável para o usuário. Se PARTIAL ou FAILED, peça desculpas com empatia dizendo exatamente o que não conseguiu ler (ex: a data estava borrada, a letra cursiva estava difícil no valor, etc).>"
}
Não inclua nenhum texto extra, apenas o JSON puro, começando em { e terminando em }.`;

  const imageParts = [
    fileToGenerativePart(filePath, mimeType)
  ];

  try {
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    
    // Tratativa caso o modelo teime em retornar o JSON dentro de bloco markdown:
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const data = JSON.parse(cleanText);
    return data;
  } catch (error: any) {
    console.error("Erro na extração LLM:", error.message);
    throw new Error('Falha ao extrair dados da imagem usando Inteligência Artificial.');
  }
};
