import axios from "axios";

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
  if (!process.env.BETTERSTACK_TOKEN) {
    return;
  }
  try {

    const log = [
      {
        dt: new Date().toISOString(),
        message,
        level,
        ...defaultLogData,
        ...data
      }
    ];

    await axios.post("https://in.logs.betterstack.com", log, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.BETTERSTACK_TOKEN}`
      }
    });

  } catch (error: any) {
    console.error("Erro ao enviar log:", error.response?.data || error.message);
  }
};

export const logger = {
  info: (msg: string, data?: LogData) => sendLog("info", msg, data),
  error: (msg: string, data?: LogData) => sendLog("error", msg, data)
};