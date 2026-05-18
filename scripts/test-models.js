import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    console.log("--- LISTANDO MODELOS DISPONÍVEIS ---");
    // Usando fetch direto na API do Google para listar modelos (fonte da verdade absoluta)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    
    if (data.models) {
        console.log("Modelos encontrados:");
        data.models.forEach(m => console.log(`- ${m.name}`));
    } else {
        console.log("Nenhum modelo retornado. Resposta da API:", JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error("❌ ERRO AO LISTAR MODELOS:", error.message);
  }
}

listModels();
