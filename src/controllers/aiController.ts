import { Response } from 'express';
import { IAuthRequest } from '../interfaces/IAuthRequest.js';
import { askAssistant } from '../services/ragService.js';
import { logger } from '../utils/logger.js';

/**
 * @function queryRAG
 * @description Recebe uma pergunta do usuário, busca contexto nas notas fiscais e responde usando Gemini.
 */
export const queryRAG = async (req: IAuthRequest, res: Response) => {
    const { query } = req.body;
    const userId = req.user?.id;

    logger.info('Iniciando consulta inteligente (RAG)', { userId, query });

    if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    if (!query) {
        return res.status(400).json({ message: 'A pergunta (query) é obrigatória.' });
    }

    try {
        const answer = await askAssistant(userId, query);
        logger.info('Consulta inteligente respondida', { userId });
        res.status(200).json({ answer });
    } catch (error: any) {
        logger.error('Erro na consulta inteligente (RAG)', {
            message: error.message,
            stack: error.stack,
            userId,
            query
        });
        res.status(500).json({ 
            message: 'Erro ao processar consulta inteligente.', 
            error: error.message 
        });
    }
};
