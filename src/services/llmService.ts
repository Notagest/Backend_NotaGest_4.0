import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';

const getGenAI = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Chave de API do Gemini não configurada (GEMINI_API_KEY).');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

function fileToGenerativePart(filePath: string, mimeType: string) {
  try {
    return {
      inlineData: {
        data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
        mimeType
      },
    };
  } catch (err) {
    throw new Error("Erro ao ler o arquivo para a IA.");
  }
}

export const extractInvoiceData = async (filePath: string, mimeType: string) => {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Analise o documento anexado (nota fiscal, cupom, recibo ou anotação).
Retorne ESTRITAMENTE um JSON com este formato:
{
  "title": "<Resumo curto ou null>",
  "totalValue": <numero ou null>,
  "emissionDate": "<YYYY-MM-DD ou null>",
  "observation": "<Descrição dos itens ou null>",
  "category": "<Construção ou Reforma>",
  "subcategory": "<Iluminação, Ferragem, Hidráulica, Acabamento, Pintura, Madeiramento ou Outros>",
  "successStatus": "<'FULL' (tudo ok), 'PARTIAL' (faltam dados), 'FAILED' (ilegível/não é nota)>",
  "aiMessage": "<Mensagem amigável explicando o que foi lido ou por que falhou (ex: 'A data estava borrada, mas o valor de R$ 50 foi identificado').>"
}
Não use Markdown, retorne apenas o JSON puro.`;

    const imageParts = [fileToGenerativePart(filePath, mimeType)];
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error: any) {
    // Blindagem contra o crash "null prototype"
    const errorMsg = error.message || "Erro desconhecido na IA";
    console.error("Erro na extração IA (Mensagem):", errorMsg);
    
    if (errorMsg.includes('429') || errorMsg.includes('quota')) {
      throw new Error("Limite de uso da IA atingido (Google). Tente novamente em 1 minuto.");
    }
    
    throw new Error(errorMsg);
  }
};
