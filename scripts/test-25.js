import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test25() {
  try {
    console.log("--- TESTANDO GEMINI 2.5 FLASH ---");
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
    const result = await model.generateContent("Diga '2.5 OK'.");
    console.log("✅ Resposta:", result.response.text());
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro no 2.5:", error.message);
    process.exit(1);
  }
}

test25();
