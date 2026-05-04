# flaregram — TODO

Working branch: **`beta`**. Promotion to `main` is a manual decision.

---

## Done — Round 2 (event-style dispatch + env migration)

The new Router/Client architecture is now functional, and the `import env from config.json` pattern is gone.

### Event-listener-style command/callback dispatch

```js
import { app } from './flaregram/client';
import { bot } from './flaregram/bot';

app.on_message('/start', (ctx, worker) => {
  worker.waitUntil(bot.message.sendMessage({
    chat_id: ctx.message.chat.id,
    text: 'hello',
  }));
});

app.on_callback_prefix('vote:', (ctx, worker) => { /* ... */ });
app.on_callback('info:about', (ctx, worker) => { /* ... */ });
app.on_message('*', (ctx, worker) => { /* catch-all */ });
```

Plugins register handlers at module load. No more if/else dispatch loop. Built into [src/flaregram/client.js](src/flaregram/client.js):
- `app.on_message(cmd, handler)` — exact first-token match. `'*'` = catch-all.
- `app.on_callback(data, handler)` — exact `callback_data` match.
- `app.on_callback_prefix(prefix, handler)` — runs when `callback_data.startsWith(prefix)`.
- `app.dispatchUpdate(update, workerCtx)` — internal; you don't call this.
- `app.launch(request, env, workerCtx)` — call this from your `fetch`.
- Per-handler `try/catch`: a buggy reply doesn't 500 the webhook (Telegram won't retry).
- `ctx.command` and `ctx.args` are auto-populated for message updates.

### Built-in routes (auto-wired in `client.js`)

- `GET /` — `status_good` JSON
- `POST /bot` — secret-token check → `app.dispatchUpdate(update, workerCtx)`
- `POST /set-webhook` — calls `setWebhook(...)` from env

### env migration: `config.json` → Workers `env`

- New [src/flaregram/utils/config.js](src/flaregram/utils/config.js) — `setEnv` / `getEnv` singleton.
- Every API method (`api/sendMessage.js`, `forwardMessage.js`, `forwardMessages.js`, `copyMessage.js`, `copyMessages.js`, `answerCallbackQuery.js`) and `webhook.js` + `legacy_router.js` now resolve env via `getEnv()` instead of `import env from '../../config.json'`.
- `app.launch(request, env, workerCtx)` calls `setEnv(env)` automatically.
- **Verified the secret no longer lands in the deployed bundle** — `grep` for the token in `wrangler deploy --dry-run` output: 0 matches.

### Config layout

- `wrangler.toml [vars]` — `DROP_PENDING_UPDATES = "True"` (the only non-secret).
- New `.dev.vars.sample` — template for local secrets (`BOT_TOKEN`, `WEBHOOK_URL`, `SECRET_TOKEN`). Copy → `.dev.vars` (gitignored). Wrangler auto-loads it for `wrangler dev`.
- For deploy: `wrangler secret put BOT_TOKEN` (interactive, encrypted, never in code).
- Removed `src/config_sample.json` (replaced by `.dev.vars.sample`).
- `.gitignore` — added `.dev.vars`, added `src/config.json` (defense-in-depth in case a stale copy lingers), removed the `src/config.js` typo line.

### Small followups landed
- `bot.message.copyMessages` is now exposed (was implemented in `api/copyMessages.js` but never wired into `bot.js`).
- Fixed `// SAnswer Callback Query Function` typo → `Answer`.

### Sample / entrypoint

- [src/index.sample.js](src/index.sample.js) rewritten to use the new pattern. Inline samples (commands + callbacks) — copy → `src/index.js` to start.

---

## Verified end-to-end

`wrangler dev` (v4.87.0) with `.dev.vars` providing real `BOT_TOKEN`. All paths returned the expected response and the wrangler log shows the dispatch trace:

| Probe | Result |
|---|---|
| `GET /` | 200 + `status_good` |
| `POST /bot` (correct secret, `/start`) | 200 `{"ok":true}` — `cmdStart` fired, `sendMessage` POST'd to real Telegram with real token |
| `POST /bot` (correct secret, `/echo hello world`) | 200 — `ctx.args = ["hello","world"]`, payload `text: "echo: hello world"` |
| `POST /bot` (correct secret, `callback_query` with `data: "vote:like"`) | 200 — `on_callback_prefix("vote:")` matched, `answerCallbackQuery` + follow-up `sendMessage` both ran |
| `POST /bot` (correct secret, plain text `"hi there"`) | 200 — no command match, caught by `on_message("*")` → "you said: hi there" |
| `POST /bot` (WRONG secret) | 200 + `status_good` (silent fall-through; updateHandler not invoked) |

(The Telegram-side 400 responses are because the test `chat_id: 12345` isn't a real chat for this bot. The framework's outbound URL, payload, and error handling are all correct.)

---

## Still deferred (next rounds)

1. **`legacy_router.js`** — kept for back-compat but no longer the primary path. Decide whether to delete or leave as a fallback.
2. **`client.js` event surface** — `app.emit('error', ...)` + `app.emit('update', ...)` are wired but no plugin yet uses them. If desired, add an `app.on('error', ...)` plugin example.
3. **More API methods** — `editMessageText`, `editMessageReplyMarkup`, `deleteMessage`, `sendPhoto`, `sendDocument` etc. are not wrapped yet.
4. **README / `.gitignore`** — `README.md` is in `.gitignore` (line 13). Edits don't get committed. Decide whether to remove that line.
5. **Wrangler version pin** — `package.json` still pins `wrangler@^3.30.1`, which crashes on Node 24. Local testing has been done with a transient `wrangler@4` install. Bumping the pin is a one-line change.
6. **Plugin loader** — the sample inlines all handlers. If you want a multi-file `src/plugins/` pattern, ship a barrel `src/plugins/index.js` that imports each plugin file and is itself imported from `src/index.js`.
7. **`addMethodsToDictionary`** removed in this round (it was broken). No replacement needed; `client.js` wires routes explicitly.
