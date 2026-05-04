//// flaregram © 2024 by Aditya Sharma is licensed under GNU AFFERO GENERAL PUBLIC LICENSE (GNU AGPL v3).
//
// Sample entry point. Copy to `src/index.js` (gitignored) and edit.
//
// Pattern:
//   - Import `app` from flaregram/client.
//   - Register handlers with `app.on_message(cmd, fn)`,
//     `app.on_callback(data, fn)`, `app.on_callback_prefix(prefix, fn)`.
//   - Each handler receives (ctx, worker):
//       ctx     — the Telegram Update (with `ctx.message`, `ctx.callback_query`)
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
    '/menu  — inline keyboard demo',
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

app.on_message('/menu', (ctx, worker) => {
  worker.waitUntil(bot.message.sendMessage({
    chat_id: ctx.message.chat.id,
    text: 'Pick one:',
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          { text: '👍 Like', callback_data: 'vote:like' },
          { text: '👎 Pass', callback_data: 'vote:pass' },
        ],
        [
          { text: 'About', callback_data: 'info:about' },
        ],
      ],
    }),
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
// Callback queries (inline-keyboard button clicks)
// ============================================================

// Prefix match: any callback_data starting with "vote:" lands here.
app.on_callback_prefix('vote:', (ctx, worker) => {
  const value = ctx.callback_query.data.split(':')[1];
  worker.waitUntil(bot.message.answerCallbackQuery({ id: ctx.callback_query.id }));
  worker.waitUntil(bot.message.sendMessage({
    chat_id: ctx.callback_query.message.chat.id,
    text: value === 'like' ? '🎉 thanks!' : '😢 noted.',
  }));
});

// Exact match: only this exact callback_data fires this handler.
app.on_callback('info:about', (ctx, worker) => {
  worker.waitUntil(bot.message.answerCallbackQuery({ id: ctx.callback_query.id }));
  worker.waitUntil(bot.message.sendMessage({
    chat_id: ctx.callback_query.message.chat.id,
    text: '*flaregram* — a tiny Cloudflare Workers Telegram bot framework.',
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
