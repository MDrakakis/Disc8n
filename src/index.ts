import { client } from "./client/client";
import { logger } from "./utils/logger";
import { config } from "./config";

client.once("clientReady", () => {
  logger.info(`Bot is online and ready! Logged in as '${client.user?.tag}'`);
  logger.info(`N8n url: ${config.n8n.baseUrl}`);
  logger.info(`Command prefix: ${config.bot.prefix}`);
});

process.on("SIGINT", () => {
  logger.info("Shutting down...");
  client.destroy();
  process.exit(0);
});

process.on("SIGTERM", () => {
  logger.info("Shutting down...");
  client.destroy();
  process.exit(0);
});

client.login(config.discord.token).catch((err) => {
  logger.error("Discord login failed:", err);
  process.exit(1);
});
