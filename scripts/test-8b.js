import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test8B() {
  try {
    console.log("--- TESTANDO GEMINI 1.5 FLASH 8B ---");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });
    const result = await model.generateContent("Diga '8B OK'.");
    console.log("✅ Resposta:", result.response.text());
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro no 8B:", error.message);
    process.exit(1);
  }
}

test8B();
