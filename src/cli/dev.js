import { join } from 'node:path';

export function parseTunnelUrl(output) {
  return output.match(/https:\/\/[^\s]+\.trycloudflare\.com/)?.[0];
}

export function resolveWranglerCommand(cwd = process.cwd()) {
  return {
    executable: process.execPath,
    args: [join(cwd, 'node_modules', 'wrangler', 'bin', 'wrangler.js')],
  };
}

export async function configureWebhookWithRetry(client, url, secretToken, options = {}) {
  const attempts = options.attempts ?? 8;
  const sleep = options.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await client.setWebhook(url, secretToken);
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(Math.min(1000 * 2 ** (attempt - 1), 8000));
    }
  }
  throw lastError;
}

export async function waitForTunnel(url, options = {}) {
  const attempts = options.attempts ?? 12;
  const sleep = options.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  const fetchImpl = options.fetchImpl ?? fetch;
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetchImpl(url, { redirect: 'manual' });
      if (response.status < 500) return response;
      lastError = new Error(`Tunnel returned HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    if (attempt < attempts) await sleep(Math.min(1000 * 2 ** (attempt - 1), 8000));
  }
  throw new Error(`Cloudflared tunnel did not become reachable: ${lastError?.message}`);
}

export function handleTunnelOutput(output, onUrl) {
  const url = parseTunnelUrl(output);
  if (url) onUrl(url);
  return url;
}
