import { Message, EmbedBuilder } from "discord.js";
import { COMMANDS } from "./commands";
import { logger } from "../utils/logger";
import { checkRateLimit, isAuthorized } from "../utils/auth";
import { triggerN8nWorkflow } from "../triggers/n8n";

export async function handleCommand(message: Message, command: string, args: string[]) {
  if (!checkRateLimit(message.author.id)) {
    logger.warn(`[RATE LIMIT] ${message.author.tag} => ${command} ${args.join(" ")}`);
    return message.reply("Rate limit exceeded.");
  }

  const auth = isAuthorized(message);
  if (!auth.authorized) return message.reply(`${auth.reason}`);

  if (command === "help") return sendHelp(message);

  const cmd = COMMANDS[command];
  if (!cmd) {
    logger.warn(`[UNKNOWN COMMAND] ${message.author.tag} => ${command} ${args.join(" ")}`);
    return message.reply(`Unknown command \`${command}\``);
  }

  const processing = await message.reply("Processing...");

  try {
    logger.debug(`[TRIGGER N8N WORKFLOW] ${message.author.tag} => ${command} ${args.join(" ")}`);
    const payload = {
      command,
      args,
      user: {
        id: message.author.id,
        username: message.author.username,
        tag: message.author.tag,
      },
      channel: {
        id: message.channel.id,
        name: message.channel?.toString(),
      },
      timestamp: new Date().toISOString(),
    };

    logger.debug(`Payload: ${JSON.stringify(payload)}`);

    const result = await triggerN8nWorkflow(cmd.webhook, payload);

    logger.debug(`N8n response: ${JSON.stringify(result)}`);

    const embed = new EmbedBuilder()
      .setTimestamp()
      .setFooter({ text: `Requested by ${message.author.tag}` })
      .setColor(result.success ? 0x00ff00 : 0xffa500)
      .setTitle(result.success ? "Success" : "Warning")
      .setDescription(result.data?.message || (result.success ? "Workflow executed." : "Workflow completed with warnings."));

    await processing.edit({ content: null, embeds: [embed] });
  } catch (err: any) {
    const errorDetails = JSON.stringify(err);
    logger.error(`Command failed: ${errorDetails}`);
    const embed = new EmbedBuilder().setColor(0xff0000).setTitle("Command Failed").setDescription(errorDetails).setTimestamp();
    await processing.edit({ content: null, embeds: [embed] });
  }
}

export function sendHelp(message: Message) {
  const embed = new EmbedBuilder().setColor(0x0099ff).setTitle("Commands").setDescription("Available commands").setTimestamp();

  Object.entries(COMMANDS).forEach(([cmd, info]) => {
    let desc = info.description;
    if (info.examples?.length) desc += `\n**Example:** \`${info.examples[0]}\``;
    if (info.requiresConfirmation) desc += "\nRequires confirmation";
    embed.addFields({ name: cmd, value: desc });
  });

  embed.addFields({ name: "help", value: "Show this help message" }, { name: "ping", value: "Ping the bot" });

  message.reply({ embeds: [embed] });
}
