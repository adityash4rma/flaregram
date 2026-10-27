import test from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { buildWebhookUrl, createTelegramClient } from '../src/flaregram/webhook.js';
import {
  configureWebhookWithRetry,
  handleTunnelOutput,
  parseTunnelUrl,
  resolveWranglerCommand,
  waitForTunnel,
} from '../src/cli/dev.js';

test('parseTunnelUrl finds a Cloudflared quick tunnel URL', () => {
  assert.equal(
    parseTunnelUrl('INF https://quiet-sun.trycloudflare.com connected'),
    'https://quiet-sun.trycloudflare.com'
  );
});

test('handleTunnelOutput reports a tunnel URL from Cloudflared output', () => {
  let received;
  handleTunnelOutput(
    'INF | https://downloading-weekly-horse-cells.trycloudflare.com |',
    (url) => { received = url; }
  );
  assert.equal(received, 'https://downloading-weekly-horse-cells.trycloudflare.com');
});

test('resolveWranglerCommand avoids spawning Windows .cmd shims directly', () => {
  const command = resolveWranglerCommand('C:/my-bot');
  assert.equal(command.executable, process.execPath);
  assert.deepEqual(command.args, [join('C:/my-bot', 'node_modules', 'wrangler', 'bin', 'wrangler.js')]);
});

test('configureWebhookWithRetry handles temporary Cloudflared DNS propagation', async () => {
  let attempts = 0;
  const client = {
    async setWebhook() {
      attempts += 1;
      if (attempts < 3) throw new Error('Failed to resolve host');
      return { ok: true };
    },
  };

  const result = await configureWebhookWithRetry(client, 'https://example.trycloudflare.com', 'secret', {
    attempts: 3,
    sleep: async () => {},
  });

  assert.deepEqual(result, { ok: true });
  assert.equal(attempts, 3);
});

test('waitForTunnel waits until the public tunnel responds', async () => {
  let probes = 0;
  const response = await waitForTunnel('https://example.trycloudflare.com', {
    attempts: 3,
    sleep: async () => {},
    fetchImpl: async () => {
      probes += 1;
      if (probes < 2) throw new Error('DNS not ready');
      return new Response('ok', { status: 200 });
    },
  });

  assert.equal(response.status, 200);
  assert.equal(probes, 2);
});

test('buildWebhookUrl appends the Worker route exactly once', () => {
  assert.equal(
    buildWebhookUrl('https://example.trycloudflare.com'),
    'https://example.trycloudflare.com/bot'
  );
  assert.equal(
    buildWebhookUrl('https://example.workers.dev/bot'),
    'https://example.workers.dev/bot'
  );
});

test('Telegram client sets a webhook without exposing the token in the payload URL', async () => {
  const requests = [];
  const client = createTelegramClient('secret-token', async (url, options) => {
    requests.push({ url, options });
    return new Response(JSON.stringify({ ok: true, result: true }), { status: 200 });
  });

  const result = await client.setWebhook('https://example.workers.dev/bot', 'header-secret');

  assert.deepEqual(result, { ok: true, result: true });
  assert.equal(requests.length, 1);
  assert.match(requests[0].url, /api\.telegram\.org\/botsecret-token\/setWebhook/);
  assert.equal(requests[0].options.method, 'POST');
  assert.deepEqual(JSON.parse(requests[0].options.body), {
    url: 'https://example.workers.dev/bot',
    secret_token: 'header-secret',
  });
});
