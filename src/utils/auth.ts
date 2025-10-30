import { Message } from "discord.js";
import { config } from "../config";
import { logger } from "./logger";

const rateLimits = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(userId: string): boolean {
  logger.debug(`[CHECK RATE LIMIT] ${userId}`);

  const now = Date.now();
  const user = rateLimits.get(userId) || { count: 0, resetTime: now + config.rateLimit.windowMs };

  if (now > user.resetTime) {
    rateLimits.set(userId, { count: 1, resetTime: now + config.rateLimit.windowMs });
    logger.debug(`[RATE LIMIT RESET] ${userId} => count: 1, resetTime: ${new Date(user.resetTime).toISOString()}`);
    return true;
  }

  if (user.count >= config.rateLimit.maxRequests) {
    logger.debug(`[RATE LIMIT EXCEEDED] ${userId} => count: ${user.count}, resetTime: ${new Date(user.resetTime).toISOString()}`);
    return false;
  }

  user.count++;
  rateLimits.set(userId, user);
  logger.debug(`[RATE LIMIT UPDATED] ${userId} => count: ${user.count}, resetTime: ${new Date(user.resetTime).toISOString()}`);
  return true;
}

export function isAuthorized(message: Message): { authorized: boolean; reason?: string } {
  const { allowedUsers, allowedRoles, allowedChannels } = config.bot;
  logger.debug(`[CHECK AUTHORIZATION] User: ${message.author.tag}, Channel: ${message.channel.id}`);

  if (allowedChannels.length && !allowedChannels.includes(message.channel.id)) {
    logger.debug(`[AUTHORIZATION FAILED] Channel not allowed: ${message.channel.id}`);
    return { authorized: false, reason: "Channel not allowed" };
  }

  if (allowedUsers.length && !allowedUsers.includes(message.author.id)) {
    logger.debug(`[AUTHORIZATION FAILED] User not allowed: ${message.author.tag}`);
    return { authorized: false, reason: "User not allowed" };
  }

  if (allowedRoles.length && message.guild) {
    const member = message.guild.members.cache.get(message.author.id);
    const hasRole = member?.roles.cache.some((r) => allowedRoles.includes(r.id));
    if (!hasRole) {
      logger.debug(`[AUTHORIZATION FAILED] Role not allowed: ${message.author.tag}`);
      return { authorized: false, reason: "Role not allowed" };
    }
  }

  logger.debug(`[AUTHORIZATION SUCCESS] ${message.author.tag}`);
  return { authorized: true };
}
