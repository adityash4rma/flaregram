//// flaregram © 2024 by Aditya Sharma is licensed under GNU AFFERO GENERAL PUBLIC LICENSE (GNU AGPL v3).
//
// flaregram Client — event-listener-style command/callback dispatch for
// Telegram bots running on Cloudflare Workers.
//
// Plugins register handlers at module load:
//
//   import { app } from '../flaregram/client';
//   import { bot } from '../flaregram/bot';
//
//   app.on_message('/start', (ctx, worker) => {
//     worker.waitUntil(bot.message.sendMessage({
//       chat_id: ctx.message.chat.id,
//       text: 'Hello!',
//     }));
//   });
//
// Then index.js boots the worker:
//
//   import { app } from './flaregram/client';
//   import './plugins/start';
//   export default {
//     fetch(request, env, ctx) { return app.launch(request, env, ctx); },
//   };

import { EventEmitter } from 'node:events';
import { Router } from './utils/router.js';
import { setEnv, getEnv } from './utils/config.js';
import { setWebhook } from './utils/webhook.js';
import { colors, status_good } from './utils/strings.js';

export { setEnv, getEnv };

export class Client extends EventEmitter {
  constructor() {
    super();
    // command -> array of handlers. Special key '*' = catch-all (no command match).
    this._commandHandlers = new Map();
    // exact callback_data -> array of handlers
    this._callbackHandlers = new Map();
    // [{ prefix, handler }] — runs when callback_data startsWith(prefix)
    this._callbackPrefixHandlers = [];
  }

  on_message(filter, handler) {
    if (typeof filter !== 'string') {
      throw new TypeError('app.on_message: filter must be a command string like "/start" or "*"');
    }
    if (typeof handler !== 'function') {
      throw new TypeError('app.on_message: handler must be a function');
    }
    const list = this._commandHandlers.get(filter) || [];
    list.push(handler);
    this._commandHandlers.set(filter, list);
  }

  on_callback(data, handler) {
    if (typeof data !== 'string') {
      throw new TypeError('app.on_callback: data must be the exact callback_data string');
    }
    const list = this._callbackHandlers.get(data) || [];
    list.push(handler);
    this._callbackHandlers.set(data, list);
  }

  on_callback_prefix(prefix, handler) {
    if (typeof prefix !== 'string') {
      throw new TypeError('app.on_callback_prefix: prefix must be a string');
    }
    this._callbackPrefixHandlers.push({ prefix, handler });
  }

  async _dispatchMessage(ctx, workerCtx) {
    const text = ctx.message.text ?? '';
    const [cmd, ...args] = text.length > 0 ? text.split(/\s+/) : [''];
    ctx.command = cmd;
    ctx.args = args;

    let matched = false;
    const handlers = this._commandHandlers.get(cmd);
    if (handlers) {
      for (const h of handlers) {
        await this._runHandler(h, ctx, workerCtx);
        matched = true;
      }
    }
    if (!matched) {
      const fallback = this._commandHandlers.get('*');
      if (fallback) {
        for (const h of fallback) {
          await this._runHandler(h, ctx, workerCtx);
        }
      }
    }
  }

  async _dispatchCallback(ctx, workerCtx) {
    const data = ctx.callback_query.data ?? '';
    const exact = this._callbackHandlers.get(data);
    if (exact) {
      for (const h of exact) {
        await this._runHandler(h, ctx, workerCtx);
      }
    }
    for (const { prefix, handler } of this._callbackPrefixHandlers) {
      if (data.startsWith(prefix)) {
        await this._runHandler(handler, ctx, workerCtx);
      }
    }
  }

  async _runHandler(handler, ctx, workerCtx) {
    try {
      const result = handler(ctx, workerCtx);
      if (result && typeof result.then === 'function') {
        await result;
      }
    } catch (err) {
      console.error('flaregram handler error:', err);
      this.emit('error', err, ctx);
    }
  }

  async dispatchUpdate(update, workerCtx) {
    if (update.callback_query) {
      await this._dispatchCallback(update, workerCtx);
      return;
    }
    if (update.message) {
      await this._dispatchMessage(update, workerCtx);
      return;
    }
    // edited_message, channel_post, etc. — surface as event for plugins to opt in.
    this.emit('update', update, workerCtx);
  }

  async launch(request, env, workerCtx) {
    setEnv(env);
    return router.route(request, workerCtx);
  }
}

export const app = new Client();
export const router = new Router();

// ----- Built-in routes -----

router.add('GET', '/', () => {
  return new Response(JSON.stringify(status_good), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});

router.add('POST', '/bot', async (request, workerCtx) => {
  try {
    const env = getEnv();
    const incomingSecret = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
    if (env.SECRET_TOKEN && env.SECRET_TOKEN !== incomingSecret) {
      // Secret mismatch — silent fall-through (don't reveal anything).
      return new Response(JSON.stringify(status_good), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    console.log(
      `SERVER: Incoming ${colors.yellow}SECRET_TOKEN${colors.white} verified`
    );
    const update = await request.json();
    await app.dispatchUpdate(update, workerCtx);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error in /bot:', err);
    // Still 200 so Telegram doesn't retry on a handler bug we already logged.
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

router.add('POST', '/set-webhook', async () => {
  const env = getEnv();
  const result = await setWebhook(env.WEBHOOK_URL, env.SECRET_TOKEN, env.DROP_PENDING_UPDATES);
  return new Response(result?.description ?? 'unknown', { status: 200 });
});
