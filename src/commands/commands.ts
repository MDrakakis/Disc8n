import fs from "fs";
import path from "path";
import { CommandMap } from "../models/command";
import { logger } from "../utils/logger";

const commandsPath = path.resolve(process.cwd(), "commands.json");

export const COMMANDS: CommandMap = {};

export function loadCommands(): CommandMap {
  logger.debug("Loading commands from commands.json...");

  if (fs.existsSync(commandsPath)) {
    try {
      const data = fs.readFileSync(commandsPath, "utf8");
      const parsed = JSON.parse(data);

      Object.keys(COMMANDS).forEach((k) => delete COMMANDS[k]);
      Object.assign(COMMANDS, parsed);

      logger.debug(`Loaded ${Object.keys(parsed).length} commands`);

      return COMMANDS;
    } catch (error: any) {
      logger.error("Failed to load commands.json:", error.message);
    }
  } else {
    logger.warn("Could not locate commands.json — the bot will start without any commands.");
  }

  return COMMANDS;
}

fs.watchFile(commandsPath, { interval: 2000 }, () => {
  logger.debug("commands.json changed; reloading...");
  loadCommands();
});

loadCommands();
