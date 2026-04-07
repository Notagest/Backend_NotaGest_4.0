import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

export const errorMiddleware = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  
  await logger.error("Erro na aplicação", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    headers: req.headers,
    ip: req.ip
  });

 
  res.status(err.status || 500).json({
    error: err.message || "Erro interno do servidor"
  });
};