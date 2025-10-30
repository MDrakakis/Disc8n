import axios from "axios";
import { logger } from "../utils/logger";
import { N8nResponse } from "../models/n8n";
import { config } from "../config";

export async function triggerN8nWorkflow(webhookPath: string, data: any): Promise<N8nResponse> {
  const url = `${config.n8n.baseUrl}${webhookPath}`;
  logger.debug(`Triggering N8n workflow: ${url}`);

  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (config.n8n.authHeader) {
    logger.debug(`Using N8n auth header: ${config.n8n.authHeader}`);
    headers["Authorization"] = config.n8n.authHeader;
  }

  try {
    const response = await axios.post(url, data, { headers, timeout: config.n8n.timeout, validateStatus: (s) => s < 500 });
    return {
      success: response.status >= 200 && response.status < 300,
      status: response.status,
      data: response.data,
    };
  } catch (err: any) {
    logger.error("n8n request failed:", err);
    throw err;
  }
}

export async function verifyN8nUrl(url: string) {
  try {
    const response = await axios.get(url, { timeout: 5000 });
    logger.info(`N8n URL reachable: ${url} - Status: ${response.status}`);
    return true;
  } catch (err: any) {
    logger.error(`Failed to reach N8n URL: ${url} - ${err.code || err.message}`);
    return false;
  }
}

(async () => {
  const url = process.env.N8N_BASE_URL;

  if (!url) {
    logger.error("N8n base URL not set in environment variables.");
    process.exit(1);
  }

  const ok = await verifyN8nUrl(url);

  if (!ok) {
    logger.error("N8n URL not reachable. Check Docker networking or host.");
    process.exit(1);
  }
})();
