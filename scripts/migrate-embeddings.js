import FileModel from "../src/models/fileModel.js";
import { generateEmbedding, prepareFileText } from "../src/services/ragService.js";
import connectDB from "../src/config/mongoDb.js";
import dotenv from "dotenv";

dotenv.config();

async function migrateEmbeddings() {
  console.log("🛠️ INICIANDO MIGRAÇÃO DE EMBEDDINGS...");
  
  try {
    await connectDB();
    
    // Busca todos os arquivos que não possuem embeddings ou estão vazios
    const filesToUpdate = await FileModel.find({
      $or: [
        { embeddings: { $exists: false } },
        { embeddings: { $size: 0 } }
      ]
    });

    console.log(`Encontrados ${filesToUpdate.length} arquivos para atualizar.`);

    for (const file of filesToUpdate) {
      try {
        console.log(`Gerando embedding para: ${file.title}...`);
        const textToEmbed = prepareFileText(file);
        const embeddings = await generateEmbedding(textToEmbed);
        
        file.embeddings = embeddings;
        await file.save();
        console.log(`✅ Sucesso: ${file.title}`);
        
        // Pequena espera para não estourar a cota do Google Free Tier
        await new Promise(r => setTimeout(r, 2000));
      } catch (err) {
        console.error(`❌ Erro no arquivo ${file.title}:`, err.message);
      }
    }

    console.log("\n✨ MIGRAÇÃO CONCLUÍDA!");
    process.exit(0);

  } catch (error) {
    console.error("❌ ERRO NA MIGRAÇÃO:", error);
    process.exit(1);
  }
}

migrateEmbeddings();
