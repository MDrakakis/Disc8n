export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}
export interface BotConfig {
  prefix: string;
  allowedUsers: string[];
  allowedRoles: string[];
  allowedChannels: string[];
  enableSlashCommands: boolean;
  logLevel: LogLevel;
}

export interface DiscordConfig {
  token: string;
  clientId?: string;
}

export interface N8nConfig {
  baseUrl: string;
  timeout: number;
  authHeader?: string;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface LoggingConfig {
  dir: string;
  file: string;
}

export interface AppConfig {
  discord: DiscordConfig;
  n8n: N8nConfig;
  bot: BotConfig;
  rateLimit: RateLimitConfig;
  logging: LoggingConfig;
}
