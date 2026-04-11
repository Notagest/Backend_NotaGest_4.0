import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IAuthRequest } from '../interfaces/IAuthRequest.js';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

export const protect = (req: IAuthRequest, res: Response, next: NextFunction) => {
    console.log(`\n Middleware "protect" acionado para: ${req.method} ${req.originalUrl}`); 

    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            if (!token || token === 'null') {
                logger.error('Token nulo ou inválido', {
                    route: req.originalUrl,
                    method: req.method
                });

                return res.status(401).json({ message: 'Não autorizado, token nulo' });
            }

            const secret = process.env.JWT_SECRET as string;

            const decoded = jwt.verify(token, secret) as { id: string; email: string };
    
            req.user = { 
                id: decoded.id, 
                email: decoded.email 
            }; 
   
            next();
        } catch (error: any) {

            logger.error('Falha na verificação do token', {
                message: error.message,
                route: req.originalUrl,
                method: req.method
            });

            return res.status(401).json({ message: `Token inválido: ${error.message}` });
        }
    } else {

        logger.error('Token não fornecido no header', {
            route: req.originalUrl,
            method: req.method
        });

        return res.status(401).json({ message: 'Não autorizado, token não fornecido.' });
    }
};

export default protect;