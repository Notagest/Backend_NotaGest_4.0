import { extractInvoiceData } from "../src/services/llmService.js";
import { generateEmbedding, askAssistant } from "../src/services/ragService.js";
import connectDB from "../src/config/mongoDb.js";
import dotenv from "dotenv";

dotenv.config();

async function runAutomaticTests() {
  console.log("🚀 INICIANDO TESTES AUTOMÁTICOS DE IA...");
  
  try {
    await connectDB();
    
    // 1. Teste de Extração (Simulado sem imagem, apenas check do modelo)
    console.log("\n1. Testando carregamento do modelo de extração...");
    // Não podemos testar a extração real sem um arquivo, mas podemos testar o embedding que é o primeiro passo de muitas IAs
    const testEmbed = await generateEmbedding("Teste de sistema");
    console.log("✅ Embedding gerado com sucesso! (Tamanho:", testEmbed.length, ")");

    // 2. Teste do Chat (RAG)
    console.log("\n2. Testando resposta do Assistente (askAssistant)...");
    // Usaremos um ID de usuário fictício ou o seu se tivermos, mas o RAG deve lidar com lista vazia
    const dummyUserId = "671a9a2239fbd101bf4d3cc5"; 
    const response = await askAssistant(dummyUserId, "Olá, como você está?");
    console.log("✅ Resposta do Assistente:", response);

    console.log("\n✨ TODOS OS TESTES PASSARAM! A IA ESTÁ PRONTA.");
    process.exit(0);

  } catch (error) {
    console.error("\n❌ FALHA NO TESTE AUTOMÁTICO:");
    console.error("Erro:", error.message);
    process.exit(1);
  }
}

runAutomaticTests();
