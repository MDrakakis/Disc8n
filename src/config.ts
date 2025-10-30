import "dotenv/config";
import { AppConfig, LogLevel } from "./models/config";
import { logger } from "./utils/logger";
import path from "path";

function getEnvVar(name: string, required: true): string;
function getEnvVar(name: string, required: false): string | undefined;
function getEnvVar(name: string, required = true): string | undefined {
  const value = process.env[name];

  if (required && !value) {
    logger.error(`Missing required environment variable: ${name}`);
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const logLevelEnv = (process.env.LOG_LEVEL || "info").toLowerCase();
if (!Object.values(LogLevel).includes(logLevelEnv as LogLevel)) {
  logger.error(`Invalid LOG_LEVEL: ${logLevelEnv}`);
  throw new Error(`Invalid LOG_LEVEL: ${logLevelEnv}`);
}
const logLevel: LogLevel = logLevelEnv as LogLevel;

const timeoutRaw = process.env.N8N_TIMEOUT;
const timeout = timeoutRaw ? parseInt(timeoutRaw, 10) : 30000;
if (isNaN(timeout) || timeout <= 0) {
  logger.error(`Invalid N8N_TIMEOUT: ${timeoutRaw}`);
  throw new Error(`Invalid N8N_TIMEOUT: ${timeoutRaw}`);
}

function splitEnvList(env?: string): string[] {
  return (
    env
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? []
  );
}

function parseIntEnv(name: string, defaultValue: number): number {
  const raw = process.env[name];
  const parsed = raw ? parseInt(raw, 10) : defaultValue;
  if (isNaN(parsed) || parsed <= 0) {
    logger.error(`Invalid ${name}: ${raw}`);
    throw new Error(`Invalid ${name}: ${raw}`);
  }
  return parsed;
}

export const config: AppConfig = {
  discord: {
    token: getEnvVar("DISCORD_TOKEN", true),
    clientId: getEnvVar("DISCORD_CLIENT_ID", true),
  },
  n8n: {
    baseUrl: getEnvVar("N8N_BASE_URL", true),
    timeout,
    authHeader: getEnvVar("N8N_AUTH_HEADER", false),
  },
  bot: {
    prefix: process.env.COMMAND_PREFIX || "!",
    allowedUsers: splitEnvList(process.env.ALLOWED_USERS),
    allowedRoles: splitEnvList(process.env.ALLOWED_ROLES),
    allowedChannels: splitEnvList(process.env.ALLOWED_CHANNELS),
    enableSlashCommands: process.env.ENABLE_SLASH_COMMANDS !== "false",
    logLevel,
  },
  rateLimit: {
    windowMs: parseIntEnv("RATE_LIMIT_WINDOW_MS", 60000),
    maxRequests: parseIntEnv("RATE_LIMIT_MAX", 10),
  },
  logging: {
    dir: getEnvVar("LOG_DIR", false) || path.resolve(process.cwd(), "logs"),
    file: getEnvVar("LOG_FILE", false) || "bot.log",
  },
};

function logConfig(cfg: AppConfig) {
  const safeConfig = {
    ...cfg,
    discord: { ...cfg.discord, token: "***REDACTED***", clientId: cfg.discord.clientId },
    n8n: { ...cfg.n8n, authHeader: cfg.n8n.authHeader ? "***REDACTED***" : undefined },
  };

  logger.debug("Loaded configuration:\n" + JSON.stringify(safeConfig, null, 2));
}

logConfig(config);
