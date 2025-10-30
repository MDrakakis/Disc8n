import fs from "fs";
import path from "path";
import { config } from "../config";
import { LogLevel } from "../models/config";

if (!fs.existsSync(config.logging.dir)) {
  fs.mkdirSync(config.logging.dir, { recursive: true });
}

const logFilePath = path.join(config.logging.dir, config.logging.file);

function shouldLog(level: LogLevel): boolean {
  const levels = Object.values(LogLevel);
  const currentIndex = levels.indexOf(config.bot.logLevel);
  const levelIndex = levels.indexOf(level);
  return levelIndex >= currentIndex;
}

function writeLog(level: LogLevel, ...args: any[]) {
  const timestamp = new Date().toISOString();
  const prefix = `[${level.toUpperCase()}]`;
  const message = `${timestamp} ${prefix} ${args.join(" ")}\n`;

  fs.appendFileSync(logFilePath, message, { encoding: "utf8" });

  switch (level) {
    case LogLevel.DEBUG:
      console.debug(message.trim());
      break;
    case LogLevel.INFO:
      console.info(message.trim());
      break;
    case LogLevel.WARN:
      console.warn(message.trim());
      break;
    case LogLevel.ERROR:
      console.error(message.trim());
      break;
  }
}

export const logger = {
  debug: (...args: any[]) => shouldLog(LogLevel.DEBUG) && writeLog(LogLevel.DEBUG, ...args),
  info: (...args: any[]) => shouldLog(LogLevel.INFO) && writeLog(LogLevel.INFO, ...args),
  warn: (...args: any[]) => shouldLog(LogLevel.WARN) && writeLog(LogLevel.WARN, ...args),
  error: (...args: any[]) => writeLog(LogLevel.ERROR, ...args),
};
