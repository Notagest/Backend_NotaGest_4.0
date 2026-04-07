import axios from "axios";
import { BETTERSTACK_CONFIG } from "../config/betterstack.js";
import { LogLevel, LogData } from "../types/log.js";

const defaultLogData = {
  service: "api-pi",    
  environment: process.env.NODE_ENV || "dev"
};

export const sendLog = async (
  level: LogLevel,
  message: string,
  data: LogData = {}
): Promise<void> => {
  try {
    
    const payload = {
      message,
      level,
      timestamp: new Date().toISOString(),
      ...defaultLogData,
      ...data
    };

    
    if (payload.body && payload.body.password) {
      payload.body.password = "***";
    }

    await axios.post(BETTERSTACK_CONFIG.url, payload, {
      headers: {
        Authorization: `Bearer ${BETTERSTACK_CONFIG.token}`,
        "Content-Type": "application/json"
      }
    });
  } catch (error: any) {
    console.error("Erro ao enviar log:", error.message);
  }
};

export const logger = {
  info: (msg: string, data?: LogData) => sendLog("info", msg, data),
  error: (msg: string, data?: LogData) => sendLog("error", msg, data)
};