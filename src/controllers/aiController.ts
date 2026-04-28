import { Response } from 'express';
import { IAuthRequest } from '../interfaces/IAuthRequest.js';
import { askAssistant } from '../services/ragService.js';

/**
 * @function queryRAG
 * @description Recebe uma pergunta do usuário, busca contexto nas notas fiscais e responde usando Gemini.
 */
export const queryRAG = async (req: IAuthRequest, res: Response) => {
    const { query } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    if (!query) {
        return res.status(400).json({ message: 'A pergunta (query) é obrigatória.' });
    }

    try {
        const answer = await askAssistant(userId, query);
        res.status(200).json({ answer });
    } catch (error: any) {
        console.error("ERRO queryRAG:", error.message);
        res.status(500).json({ 
            message: 'Erro ao processar consulta inteligente.', 
            error: error.message 
        });
    }
};
