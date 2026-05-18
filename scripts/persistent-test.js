import { generateEmbedding, askAssistant } from "../src/services/ragService.js";
import connectDB from "../src/config/mongoDb.js";
import dotenv from "dotenv";

dotenv.config();

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runPersistentTests() {
  console.log("🚀 INICIANDO TESTES PERSISTENTES (COM RETRY)...");
  
  try {
    await connectDB();
    const dummyUserId = "671a9a2239fbd101bf4d3cc5"; 

    // Teste de Embedding
    let embedSuccess = false;
    for (let i = 0; i < 3; i++) {
        try {
            console.log(`\nTentativa ${i+1}: Gerando embedding...`);
            const testEmbed = await generateEmbedding("Teste de estabilidade NotaGest");
            console.log("✅ Embedding gerado! Tamanho:", testEmbed.length);
            embedSuccess = true;
            break;
        } catch (e) {
            console.warn("⚠️ Cota atingida no Embedding, esperando 15s...");
            await sleep(15000);
        }
    }

    if (!embedSuccess) throw new Error("Falha persistente no embedding.");

    // Teste de Chat
    let chatSuccess = false;
    for (let i = 0; i < 3; i++) {
        try {
            console.log(`\nTentativa ${i+1}: Testando Chat IA...`);
            const response = await askAssistant(dummyUserId, "Você consegue me ouvir? Responda 'Sim, estou pronto'.");
            console.log("✅ Resposta da IA:", response);
            chatSuccess = true;
            break;
        } catch (e) {
            console.warn("⚠️ Cota atingida no Chat, esperando 15s...");
            await sleep(15000);
        }
    }

    if (chatSuccess) {
        console.log("\n✨ SUCESSO TOTAL! A IA está respondendo corretamente.");
    } else {
        console.log("\n❌ A IA ainda está sob limite de cota severo.");
    }

    process.exit(0);

  } catch (error) {
    console.error("\n❌ ERRO CRÍTICO NO TESTE:", error.message);
    process.exit(1);
  }
}

runPersistentTests();
