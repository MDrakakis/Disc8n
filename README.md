# Disc8n bot

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![Discord.js](https://img.shields.io/badge/discord.js-v14-blue.svg)

A secure, self-hosted bridge between Discord and n8n workflows. Trigger your n8n automations directly from Discord with proper authentication, rate limiting, and logging.

[Features](#features) • [Quick Start](#quick-start) • [Configuration](#configuration) • [Security](#security) • [Contributing](#contributing)

</div>

---

## Features

- 🔒 **Secure by Design** - n8n stays on your local network, bot bridges securely
- 🎯 **Flexible Commands** - Easy JSON-based command configuration
- 🛡️ **Authorization** - User, role, and channel-based access control
- ⚡ **Rate Limiting** - Built-in protection against spam
- 📊 **Rich Embeds** - Beautiful Discord embed responses
- 🔍 **Comprehensive Logging** - Debug, info, warn, and error levels
- 🐳 **Docker Ready** - Full Docker and docker-compose support
- 🔧 **Easy Configuration** - Environment variable based setup
- 📦 **Extensible** - Simple command addition via JSON

---

## 🔧 Prerequisites

- **Node.js** 18.0.0 or higher
- **Discord Bot Token** (from Discord Developer Portal)
- **n8n** instance (self-hosted or local)
- **Docker** (optional, for containerized deployment)

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/MDrakakis/Disc8n.git
cd Disc8n
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click New Application, give it a name
3. Navigate to Bot → Click Add Bot
4. Under "Privileged Gateway Intents", enable:
   - Message Content Intent
   - Server Members Intent (optional)
5. Click "Reset Token" → **Copy the token** (you'll need this!)
6. Go to "OAuth2" → "URL Generator":
   - **Scopes**: `bot`
   - **Bot Permissions**:
     - Send Messages
     - Read Messages/View Channels
     - Read Message History
     - Embed Links
7. Copy the generated URL and invite the bot to your server

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your values

### 5. Set Up n8n Workflow

1. Add a **Webhook** node:

   - Method: `POST`
   - Path: `ping`
   - Response Mode: "Immediately" or "Using 'Respond to Webhook' Node"

2. Optional: Add a **Respond to Webhook** node:

   ```json
   {
     "success": true,
     "message": "Pong!"
   }
   ```

3. Save and **Activate** the workflow

### 6. Run the bot with Docker Compose

```bash
docker-compose up -d
```

### 7. Test It!

In Discord, type:

```
!help
or
!ping
```

🎉 If you see responses, you're all set! 🎉

---

## Configuration

### Environment Variables

| Variable                | Required | Default           | Description                                                      |
| ----------------------- | -------- | ----------------- | ---------------------------------------------------------------- |
| `DISCORD_TOKEN`         | ✅       | -                 | Your Discord bot token                                           |
| `DISCORD_CLIENT_ID`     | ❌       | -                 | Your Discord application client ID                               |
| `N8N_BASE_URL`          | ✅       | `http://n8n:5678` | Your n8n instance URL (container network URL for Docker Compose) |
| `N8N_TIMEOUT`           | ❌       | `30000`           | Request timeout in milliseconds                                  |
| `N8N_AUTH_HEADER`       | ❌       | -                 | Authorization header for n8n (e.g., `Bearer <token>`)            |
| `COMMAND_PREFIX`        | ❌       | `!`               | Command prefix for text commands                                 |
| `ALLOWED_USERS`         | ❌       | -                 | Comma-separated Discord user IDs allowed to run commands         |
| `ALLOWED_ROLES`         | ❌       | -                 | Comma-separated Discord role IDs allowed to run commands         |
| `ALLOWED_CHANNELS`      | ❌       | -                 | Comma-separated Discord channel IDs allowed to receive commands  |
| `ENABLE_SLASH_COMMANDS` | ❌       | `true`            | Enable or disable Discord slash commands                         |
| `LOG_LEVEL`             | ❌       | `info`            | Logging level (`debug`, `info`, `warn`, `error`)                 |

### Commands Configuration

Edit commands.json to add or modify commands:

```json
{
  "your-command": {
    "webhook": "/webhook/your-endpoint",
    "description": "What this command does",
    "requiresConfirmation": false,
    "examples": ["!your-command arg1"]
  },
  "your-second-command": {
    "webhook": "/webhook/your-second-command",
    "description": "What this command does",
    "requiresConfirmation": false,
    "examples": ["!your-second-command arg1"]
  }
}
```

**Fields:**

- `webhook` - n8n webhook path (e.g., `/webhook/your-endpoint`)
- `description` - Shown in the help command
- `requiresConfirmation` - Display warning badge (not implemented yet)
- `examples` - Example usage shown in help

---

## Usage

### Built-in Commands

- `!help` - Show all available commands
- `!ping` - Ping the webhook to check if it's alive.

### Custom Commands

Defined in `commands.json`.

### Command Payload

When triggered, the bot sends this payload to n8n:

```json
{
  "command": "ping",
  "user": {
    "id": "123456789",
    "username": "username",
    "tag": "username#1234"
  },
  "args": [],
  "channel": {
    "id": "987654321",
    "name": "general"
  },
  "timestamp": "0001-01-01T12:00:00.000Z"
}
```

### n8n Response Format

```json
{
  "success": true,
  "message": "Operation completed successfully!",
  "details": {
    "optional": "additional data"
  }
}
```

## Security

### Important Security Considerations

1. **Use strong Discord tokens** - Regenerate if compromised
2. **Implement user restrictions** - Use `ALLOWED_USERS`, `ALLOWED_ROLES`, or `ALLOWED_CHANNELS`
3. **Review all commands** - Ensure no dangerous operations are exposed
4. **Monitor logs** - Check for suspicious activity
5. **Use HTTPS** - If running bot remotely, use secure connections

### Authorization Levels

The bot supports three levels of authorization:

1. **User Whitelist** - Only specific Discord users

   ```env
   ALLOWED_USERS=123456789,987654321
   ```

2. **Role Whitelist** - Only users with specific roles

   ```env
   ALLOWED_ROLES=admin_role_id,moderator_role_id
   ```

3. **Channel Whitelist** - Only in specific channels
   ```env
   ALLOWED_CHANNELS=channel_id_1,channel_id_2
   ```

### Rate Limiting

- **10 requests per minute** per user
- Automatically resets after 60 seconds
- Returns warning message when exceeded

### How to Get Discord IDs

1. Enable Developer Mode in Discord (Settings → Advanced → Developer Mode)
2. Right-click user/role/channel → Copy ID

---

## Deployment

### Docker Compose (Recommended)

```bash
# Copy and configure environment
cp .env.example .env

# Start services
docker-compose up -d
```

## Troubleshooting

- **Bot doesn't respond** – Check online status, permissions, and Message Content Intent

- **Cannot connect to n8n** – Verify N8N_BASE_URL, container network, and firewall

- **Unknown command** – Check commands.json and prefix

- **Rate limit exceeded** – Wait 60 seconds or adjust limits

- **Webhook not triggering** – Test via curl, ensure workflow is activated, verify path

## Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/new-feature`
3. **Commit your changes**: `git commit -m 'Add new feature'`
4. **Push to branch**: `git push origin feature/new-feature`
5. **Open a Pull Request**

Guidelines: Follow existing code style, comment complex logic, update docs, test thoroughly

---

## License

MIT License - see [LICENSE](LICENSE).

---

## Acknowledgments

- [discord.js](https://discord.js.org/)
- [n8n](https://n8n.io/)
- Contributors and users of this project

---

## Support

- **Issues**: [GitHub Issues](https://github.com/MDrakakis/Disc8n/issues)

---

<div align="center">

Star this repo if you find it helpful!

</div>
