import test from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '../src/flaregram/client.js';
import { setEnv } from '../src/flaregram/utils/config.js';
import { f_sendMessage } from '../src/flaregram/api/sendMessage.js';

test('sendMessage does not log the bot token', async () => {
  setEnv({ BOT_TOKEN: 'private-token' });
  const originalFetch = globalThis.fetch;
  const originalLog = console.log;
  const logs = [];
  globalThis.fetch = async () => new Response(JSON.stringify({ ok: true, result: {} }));
  console.log = (...args) => logs.push(args.join(' '));
  try {
    await f_sendMessage({ chat_id: 1, text: 'hello' });
  } finally {
    globalThis.fetch = originalFetch;
    console.log = originalLog;
  }
  assert.equal(logs.some((line) => line.includes('private-token')), false);
});

test('Client dispatches a command plugin with parsed arguments', async () => {
  const app = new Client();
  let received;
  app.on_message('/echo', (ctx) => {
    received = { command: ctx.command, args: ctx.args, chatId: ctx.message.chat.id };
  });

  await app.dispatchUpdate({
    message: { chat: { id: 42 }, text: '/echo hello world' },
  }, {});

  assert.deepEqual(received, {
    command: '/echo',
    args: ['hello', 'world'],
    chatId: 42,
  });
});

test('Client runs a callback prefix plugin', async () => {
  const app = new Client();
  let callbackData;
  app.on_callback_prefix('vote:', (ctx) => {
    callbackData = ctx.callback_query.data;
  });

  await app.dispatchUpdate({ callback_query: { data: 'vote:yes' } }, {});

  assert.equal(callbackData, 'vote:yes');
});
