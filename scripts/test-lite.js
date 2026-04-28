import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testLite() {
  try {
    console.log("--- TESTANDO GEMINI 2.0 FLASH LITE ---");
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash-lite" });
    const result = await model.generateContent("Diga 'Lite OK' se você está funcionando.");
    console.log("✅ Resposta:", result.response.text());
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro no Lite:", error.message);
    process.exit(1);
  }
}

testLite();
