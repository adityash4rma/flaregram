//// flaregram © 2024 by Aditya Sharma is licensed under GNU AFFERO GENERAL PUBLIC LICENSE (GNU AGPL v3).
//
// Sample entry point. Copy this file to `src/index.js` (gitignored) and edit.
//
// What it shows:
//   1. Section A — minimal usage: /start, /help, echo.
//   2. Section B — richer usage: command-table dispatch, inline keyboard,
//      callback_query handling, message forwarding.
//
// Toggle which section runs by changing one line in `updateHandler` below.
//
// This sample uses `legacy_router.js` because the new Router/Client
// (`flaregram/client.js`) is still incomplete on the beta branch.
// See TODO.md.

import { router } from './flaregram/utils/legacy_router';
import { bot } from './flaregram/bot';

// =============================================================
// Section A — minimal application
// =============================================================
// Stateless. No routing table. Just inspects message.text and replies.

async function handleSimple(message) {
  const chat_id = message.chat.id;
  const text = message.text ?? '';

  if (text === '/start') {
    await bot.message.sendMessage({
      chat_id,
      text: '*Welcome to flaregram!*\nType /help to see what I can do.',
    });
    return;
  }

  if (text === '/help') {
    await bot.message.sendMessage({
      chat_id,
      text: 'Commands:\n/start — say hi\n/echo <msg> — echo back',
    });
    return;
  }

  await bot.message.sendMessage({
    chat_id,
    text: `you said: ${text}`,
  });
}

// =============================================================
// Section B — richer application
// =============================================================
// - Command table: { '/cmd': handler } dispatch on the first whitespace token.
// - Inline keyboard via `reply_markup` (must be a JSON-stringified object).
// - `callback_query` handling: acknowledge the click, then act on `data`.
// - Forwarded-message demo: `/forward <from_chat_id> <message_id>`.
// - Per-handler try/catch in updateHandler so one bad reply doesn't 500
//   the whole webhook (Telegram retries on non-2xx).

const commands = {
  '/start':   cmdStart,
  '/help':    cmdHelp,
  '/menu':    cmdMenu,
  '/echo':    cmdEcho,
  '/forward': cmdForward,
};

async function cmdStart(chat_id) {
  await bot.message.sendMessage({
    chat_id,
    text: '*Welcome.*\n/help — list commands\n/menu — inline keyboard demo',
  });
}

async function cmdHelp(chat_id) {
  const lines = ['*Commands*'];
  for (const name of Object.keys(commands)) lines.push(`• ${name}`);
  await bot.message.sendMessage({ chat_id, text: lines.join('\n') });
}

async function cmdEcho(chat_id, args) {
  const text = args.join(' ') || '(nothing to echo)';
  await bot.message.sendMessage({ chat_id, text: `echo: ${text}` });
}

async function cmdMenu(chat_id) {
  await bot.message.sendMessage({
    chat_id,
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
  });
}

async function cmdForward(chat_id, args) {
  const [from_chat_id, message_id] = args;
  if (!from_chat_id || !message_id) {
    await bot.message.sendMessage({
      chat_id,
      text: 'usage: `/forward <from_chat_id> <message_id>`',
    });
    return;
  }
  await bot.message.forwardMessage({
    chat_id,
    from_chat_id,
    message_id: parseInt(message_id),
  });
}

async function handleCommand(message) {
  const chat_id = message.chat.id;
  const text = message.text ?? '';
  const [cmd, ...args] = text.split(/\s+/);

  const handler = commands[cmd];
  if (!handler) {
    await bot.message.sendMessage({ chat_id, text: `you said: ${text}` });
    return;
  }
  await handler(chat_id, args, message);
}

async function handleCallback(query) {
  // Always acknowledge first — closes the spinner on the button.
  await bot.message.answerCallbackQuery({ id: query.id, text: 'got it' });

  const chat_id = query.message?.chat?.id;
  if (!chat_id) return;

  const [scope, value] = (query.data ?? '').split(':');
  if (scope === 'vote') {
    await bot.message.sendMessage({
      chat_id,
      text: value === 'like' ? '🎉 thanks!' : '😢 noted.',
    });
  } else if (scope === 'info' && value === 'about') {
    await bot.message.sendMessage({
      chat_id,
      text: '*flaregram* — a tiny Cloudflare Workers Telegram bot framework.',
    });
  }
}

// =============================================================
// Top-level dispatcher — called by legacy_router on every /bot POST.
// =============================================================

export async function updateHandler(update) {
  try {
    if (update.callback_query) {
      await handleCallback(update.callback_query);
      return;
    }
    if (update.message) {
      // Pick which section runs:
      await handleCommand(update.message);     // Section B (default)
      // await handleSimple(update.message);   // Section A
      return;
    }
    // Other update kinds (edited_message, channel_post, ...) — ignored.
  } catch (err) {
    // Swallow — Telegram retries non-2xx, which we don't want for handler bugs.
    console.error('updateHandler error:', err);
  }
}

// =============================================================
// Worker entry point.
// =============================================================

export default {
  async fetch(request) {
    return router.handle(request);
  },
};
