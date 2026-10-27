# flaregram roadmap

Current branch: **`main`**. Current npm release: **`1.3.0-beta.5`**.

## Completed

- Plugin-based command and callback dispatch.
- Cloudflare Worker entrypoint and environment-based secrets.
- Public npm package exports and project scaffolding CLI.
- Cloudflared local webhook workflow with URL parsing and readiness retries.
- Webhook management commands: `set`, `info`, and `delete`.
- Secret-safe logging and package contents.
- Node test suite and Wrangler dry-run verification.
- GitHub Actions CI for `main` and `beta`.
- Release smoke-test checklist in `docs/RELEASE_CHECKLIST.md`.

## Stable-release work

- Complete the release checklist with a disposable real Telegram bot.
- Add migration notes for users of the pre-plugin router API.
- Decide which additional Telegram methods belong in the stable contract.
- Add consistent tests for Telegram API failures and malformed webhook input.
- Create a stable `1.3.0` release only after the public API is deliberately
  frozen.

## Deferred by design

- TypeScript declarations.
- Filesystem-based plugin discovery.
- Automatic production webhook changes from inside a Worker request.
- Full Telegram Bot API coverage.

## Compatibility note

`src/flaregram/utils/legacy_router.js` remains available for compatibility,
but new projects should use `app.on_message`, `app.on_callback`, and the
plugin barrel in `src/plugins/index.js`.
