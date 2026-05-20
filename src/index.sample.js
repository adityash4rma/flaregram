//// flaregram © 2024 by Aditya Sharma is licensed under GNU AFFERO GENERAL PUBLIC LICENSE (GNU AGPL v3).
//
// Sample entry point. Copy to `src/index.js` (gitignored) and edit.
//
// Pattern:
//   - Import `app` from flaregram/client.
//   - Register handlers with `app.on_message(cmd, fn)`.
//   - Each handler receives (ctx, worker):
//       ctx     — the Telegram Update (with `ctx.message`)
//                 plus convenience props on message updates: ctx.command, ctx.args
//       worker  — the Cloudflare Workers ExecutionContext (use worker.waitUntil
//                 to fire-and-forget API calls)
//   - The default export forwards every request to `app.launch(req, env, ctx)`.
//
// For a multi-file bot, move each handler into `src/plugins/<name>.js` and
// import them from this file (their import side-effects register the handlers).

import { app } from './flaregram/client';
import { bot } from './flaregram/bot';

// ============================================================
// Commands
// ============================================================

app.on_message('/start', (ctx, worker) => {
  worker.waitUntil(bot.message.sendMessage({
    chat_id: ctx.message.chat.id,
    text: '*Welcome to flaregram!*\nType /help to see what I can do.',
  }));
});

app.on_message('/help', (ctx, worker) => {
  const lines = [
    '*Commands*',
    '/start — say hi',
    '/help  — this list',
    '/echo <msg> — echo back',
  ];
  worker.waitUntil(bot.message.sendMessage({
    chat_id: ctx.message.chat.id,
    text: lines.join('\n'),
  }));
});

app.on_message('/echo', (ctx, worker) => {
  const text = ctx.args.join(' ') || '(nothing to echo)';
  worker.waitUntil(bot.message.sendMessage({
    chat_id: ctx.message.chat.id,
    text: `echo: ${text}`,
  }));
});

// Catch-all for messages that didn't match a command.
app.on_message('*', (ctx, worker) => {
  worker.waitUntil(bot.message.sendMessage({
    chat_id: ctx.message.chat.id,
    text: `you said: ${ctx.message.text ?? ''}`,
  }));
});

// ============================================================
// Worker entry point
// ============================================================

export default {
  async fetch(request, env, workerCtx) {
    return app.launch(request, env, workerCtx);
  },
};
