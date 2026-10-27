#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { initProject } from './init.js';
import { buildWebhookUrl, createTelegramClient } from '../flaregram/webhook.js';
import {
  configureWebhookWithRetry,
  handleTunnelOutput,
  resolveWranglerCommand,
  waitForTunnel,
} from './dev.js';

function loadEnv() {
  const path = '.dev.vars';
  if (!existsSync(path)) return {};
  return Object.fromEntries(
    readFileSync(path, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.match(/^\s*([A-Z0-9_]+)\s*=\s*["']?([^"']*)["']?\s*$/))
      .filter(Boolean)
      .map(([, key, value]) => [key, value.trim()])
  );
}

function getArg(args, name) {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

async function webhookCommand(args) {
  const env = { ...loadEnv(), ...process.env };
  const client = createTelegramClient(env.BOT_TOKEN);
  const action = args[0];
  if (action === 'set') {
    const url = getArg(args, '--url') || env.WEBHOOK_URL;
    if (!url) throw new Error('Provide --url or WEBHOOK_URL');
    console.log(JSON.stringify(await client.setWebhook(buildWebhookUrl(url), env.SECRET_TOKEN), null, 2));
    return;
  }
  if (action === 'info') {
    console.log(JSON.stringify(await client.getWebhookInfo(), null, 2));
    return;
  }
  if (action === 'delete') {
    console.log(JSON.stringify(await client.deleteWebhook(), null, 2));
    return;
  }
  throw new Error('Usage: flaregram webhook <set|info|delete>');
}

async function devCommand() {
  const wrangler = resolveWranglerCommand();
  const worker = spawn(wrangler.executable, [...wrangler.args, 'dev'], { stdio: 'inherit' });
  const tunnel = spawn('cloudflared', ['tunnel', '--url', 'http://localhost:8787'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  let webhookConfigured = false;
  const onTunnelOutput = (chunk) => {
    output += chunk.toString();
    handleTunnelOutput(output, (tunnelUrl) => {
      if (webhookConfigured) return;
      webhookConfigured = true;
      console.log(`Cloudflare tunnel: ${tunnelUrl}/bot`);
      const env = { ...loadEnv(), ...process.env };
      if (env.BOT_TOKEN) {
        (async () => {
          await waitForTunnel(tunnelUrl);
          await configureWebhookWithRetry(
            createTelegramClient(env.BOT_TOKEN),
            tunnelUrl,
            env.SECRET_TOKEN
          );
          console.log('Telegram webhook configured automatically.');
        })().catch((error) => console.error(`Webhook setup failed: ${error.message}`));
      } else {
        console.log('Set BOT_TOKEN in .dev.vars to configure the Telegram webhook automatically.');
      }
    });
    process.stdout.write(chunk);
  };
  tunnel.stdout.on('data', onTunnelOutput);
  tunnel.stderr.on('data', (chunk) => {
    onTunnelOutput(chunk);
    process.stderr.write(chunk);
  });
  const stop = () => {
    worker.kill();
    tunnel.kill();
  };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  await new Promise((resolve) => worker.once('exit', resolve));
  tunnel.kill();
}

async function main(args) {
  if (args[0] === 'init') {
    initProject(args[1] || 'flaregram-bot');
    console.log(`Created Flaregram project in ${args[1] || 'flaregram-bot'}`);
    return;
  }
  if (args[0] === 'webhook') return webhookCommand(args.slice(1));
  if (args[0] === 'dev') return devCommand();
  throw new Error('Usage: flaregram <init|dev|webhook>');
}

main(process.argv.slice(2)).catch((error) => {
  console.error(`flaregram: ${error.message}`);
  process.exitCode = 1;
});
