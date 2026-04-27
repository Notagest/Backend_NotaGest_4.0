import express, { Response } from 'express';
import { protect } from '../middleware/auth.js';
import uploadMiddleware from '../middleware/uploads.js';
import { extractInvoiceData } from '../services/llmService.js';
import { IAuthRequest } from '../interfaces/IAuthRequest.js';
import path from 'path';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Inteligência Artificial
 *   description: Integração com LLM (Gemini) para leitura de documentos
 */

/**
 * @swagger
 * /api/ai/extract:
 *   post:
 *     summary: Envia uma Nota Fiscal e o LLM extrai Valor, Data e CNPJ dela.
 *     tags: [Inteligência Artificial]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 */
router.post(
  '/extract',
  protect,
  uploadMiddleware,
  async (req: IAuthRequest, res: Response) => {
    try {
      if (!req.file) {
        console.error('Tentativa de upload falhou: Nenhum arquivo recebido.');
        return res.status(400).json({ message: 'Nenhum arquivo enviado para extração.' });
      }

      const filePath = req.file.path;
      const mimeType = req.file.mimetype;

      const extractedData = await extractInvoiceData(filePath, mimeType);

      // Constrói o caminho relativo para ser compatível com as outras rotas do site
      const relativePath = req.user?.id ? path.join(req.user.id.toString(), req.file.filename).replace(/\\/g, '/') : req.file.filename;

      res.status(200).json({
        message: 'Dados extraídos com sucesso.',
        data: extractedData,
        filePath: relativePath
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message || 'Erro interno na extração.' });
    }
  }
);

export default router;
