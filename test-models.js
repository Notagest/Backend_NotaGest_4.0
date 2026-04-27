import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("Testando gemini-2.5-flash...");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("Diga 'Funciona!'");
    console.log("Resposta Gemini 2.5:", result.response.text());
  } catch (error) {
    console.error("Erro no teste:", error.message);
  }
}
run();
