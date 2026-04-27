// importação das bibliotecas
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// importação dos arquivos internos
import connectDB from './config/mongoDb.js';
import setupSwagger from './config/swaggerConfig.js';
import userRoutes from './routes/userRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import uploadFileRoutes from './routes/uploadFileRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

// Configurando o dirname para ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://nota-gest.vercel.app'
  ],
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true
}));

app.use(express.json());

// Swagger
setupSwagger(app);

// Rotas
app.use('/api/users', userRoutes);
app.use('/api/uploads', fileRoutes);
app.use('/api/imoveis', propertyRoutes);
app.use('/api/uploadfile', uploadFileRoutes);
app.use('/api/ai', aiRoutes);
// Servir arquivos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 404
app.use((req: Request, res: Response) =>{
    res.status(404).json({message: "Rota não encontrada"});
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
}

export default app;
