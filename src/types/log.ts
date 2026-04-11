export type LogLevel = "info" | "error";

export interface LogData {
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  headers?: any;
  query?: any;
  params?: any;
  body?: any;
  ip?: string;
  stack?: string;
  [key: string]: any;
}