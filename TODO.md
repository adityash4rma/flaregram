# flaregram — TODO

Working branch: **`beta`**. Do not commit to `main`. Promotion to `main` is a manual decision.

---

## Done in this round (commit on `beta`)

Bug fixes only — restore working state. No architectural changes.

### API methods — config.json migration + return-path fixes
- [x] **sendMessage.js** — fixed catch fall-through (was returning a `Response` then trying to call `response.json()` on an out-of-scope variable). Catch now returns `{ ok: false, error: error.message }`. Removed the stray `console.log(response.json())` (misuse — `.json()` returns a Promise).
- [x] **forwardMessage.js** / **forwardMessages.js** / **copyMessage.js** / **copyMessages.js** / **answerCallbackQuery.js**
  - Added `import env from '../../config.json'`; replaced bare `${BOT_TOKEN}` with `${env.BOT_TOKEN}` (sendMessage and webhook were already migrated; the rest were not).
  - Swapped the inverted `body.message_thread_id == undefined ? parseInt(...) : ''` ternary (was calling `parseInt(undefined) → NaN`) → now `… ? '' : parseInt(...)`.
  - Added `return response;` inside the second `.then()` so the outer `await` actually receives the parsed body instead of `undefined`.
- [x] **copyMessages.js** specifically:
  - Renamed `f_copyMessage` → `f_copyMessages` (was colliding with the singular file's export name).
  - Fixed the undeclared variable: `body.message_id` / `param_message_id` → `body.message_ids` / `param_message_ids` (and the error string).

### utils/webhook.js
- [x] Dropped the unused `let token;` and the inverted secret-token branches. Replaced with a single guard: only append `&secret_token=...` when `SECRET_TOKEN` is a non-empty string.

### Already correct on beta — no change needed
- `strings.js` — `REPO_VERSION` was removed from `status_good`/`status_bad` here, so the module-load `ReferenceError` from `main` doesn't occur on `beta`.

---

## Still broken / deferred (next rounds)

### 1. `client.js` + `utils/router.js` — the new architecture is incomplete
Beta's commit message acknowledges: _"Know Issues: new Router not working, plugins not working."_

- `Client.launch(request, ctx)` is empty — the entry point that should dispatch to the router never runs anything.
- `addMethodsToDictionary(router)` iterates over **Router.prototype** (`add`, `route`, `notFound`, `constructor`) and registers each as `POST /webhook` — that's not what should happen. It should iterate over the `Client` instance's listeners, or just be deleted in favor of explicit route wiring inside `launch()`.
- `router.add()` registers exact-match `${method} ${pathname}` keys — fine, but no `/bot` and `/set-webhook` routes are wired up anywhere on beta. The legacy router did this; the new one needs equivalent wiring (probably inside `Client.launch()`).
- Decision needed: is `legacy_router.js` kept as a fallback, or removed once the new Router/Client is functional?

### 2. Entry point (`src/index.js`) is gitignored and uncommitted
`wrangler.toml` says `main = "src/index.js"` but the file is in `.gitignore` and not in the repo. A fresh clone cannot run `npm start`. Once the Client/Router architecture is settled, ship a `src/index.sample.js` template that:
1. Imports `app` (Client) and `router` from `flaregram/client.js`.
2. Registers `app.on_message(...)` listeners.
3. Default-exports `{ async fetch(request, env, ctx) { return app.launch(request, ctx); } }`.

### 3. `README.md` is in `.gitignore`
Probably accidental — adding it to gitignore line 11 means README edits never get committed. Decide whether to remove that line (intent: keep README in repo) or leave (intent: README is locally edited only).

### 4. config.json bootstrap
- `import env from '../../config.json'` is hard-coded across `webhook.js` and every `api/*.js`. Fresh clones don't have `config.json` — only `config_sample.json`. The framework won't bundle without it.
- Document in README (or inline): "copy `src/config_sample.json` → `src/config.json` before `npm start`."
- Optional: switch from JSON-file imports back to `wrangler.toml [vars]` + reading `env` from the fetch handler. JSON-import config means the token is bundled into the worker artifact at deploy time, which is fine for a single-developer bot but unusual for shared/templated frameworks.

### 5. Other inconsistencies (low priority)
- `bot.js` doesn't expose `f_copyMessages` — only the singular form. Wire it in if `bot.message.copyMessages` is wanted.
- API methods are inconsistent: `sendMessage` returns parsed JSON; the others return whatever the second `.then()` returns (now fixed to be the parsed JSON, but still inconsistent with `sendMessage`'s explicit catch shape). Consider standardizing return shapes (`{ ok, result, error? }`).
- `f_answerCallbackQuery` comment says "SAnswer" — typo.
- The repeating `body.x == undefined ? default : body.x` pattern is begging for a small `optional(body.x, default)` helper.

---

## Verification checklist

- [ ] `npm start` (= `wrangler dev`) — worker boots without `ReferenceError`. (Only meaningful after the Client/Router work in §1 is complete; for now, just check the modules parse.)
- [ ] `POST /set-webhook` returns Telegram's `Webhook was set` (after Router/Client wiring).
- [ ] Send `/start` to the bot — `bot.message.sendMessage({...})` reaches Telegram and the parsed `{ ok: true, result: {...} }` is returned to the caller.
- [ ] `forwardMessage`, `forwardMessages`, `copyMessage`, `copyMessages`, `answerCallbackQuery` — each returns parsed JSON (not `undefined`) and logs no `parseInt(undefined) → NaN` warnings.
- [ ] Negative path: `bot.message.sendMessage({})` (no chat_id) — logs `Undefined mandatory parameter => chat_id` and returns `{ ok: false, error: ... }` rather than crashing the worker.
