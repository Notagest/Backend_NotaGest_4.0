import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/mongoDb.js';
import setupSwagger from './config/swaggerConfig.js';
import userRoutes from './routes/userRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import uploadFileRoutes from './routes/uploadFileRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { requestLogger } from "./middleware/requestLogger.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";
import { logger } from './utils/logger.js';

dotenv.config();

if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:4000',
    'https://nota-gest.vercel.app'
  ],
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true
}));

app.use(express.json());

// Swagger
setupSwagger(app);

// Logs
app.use(requestLogger);

// Rotas
app.use('/api/users', userRoutes);
app.use('/api/uploads', fileRoutes);
app.use('/api/imoveis', propertyRoutes);
app.use('/api/uploadfile', uploadFileRoutes);
app.use('/api/ai', aiRoutes);

// Servir arquivos da pasta uploads usando process.cwd() para compatibilidade com Jest/ESM
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// erro global
app.use(errorMiddleware);

// 404
app.use((req: Request, res: Response) => {
  logger.info("Rota não encontrada", {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });
  res.status(404).json({ message: "Rota não encontrada" });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
}

export default app;
