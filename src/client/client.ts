import { Client, GatewayIntentBits } from "discord.js";
import { handleCommand } from "../commands/handler";
import { config } from "../config";
import { logger } from "../utils/logger";

export const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.on("messageCreate", (msg) => {
  if (!msg.content.startsWith(config.bot.prefix) || msg.author.bot) {
    logger.debug(`[IGNORE] ${msg.author.tag} => ${msg.content}`);
    return;
  }

  const args = msg.content.slice(config.bot.prefix.length).trim().split(/ +/);
  const command = args.shift()?.toLowerCase() || "";

  logger.debug(`[COMMAND] ${msg.author.tag} => ${command} ${args.join(" ")}`);

  handleCommand(msg, command, args);
});
