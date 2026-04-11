import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on("finish", async () => {
    const duration = Date.now() - start;

    await logger.info("HTTP Request", {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      headers: req.headers,
      query: req.query,
      params: req.params,
      body: req.body,
      ip: req.ip
    });
  });

  next();
};