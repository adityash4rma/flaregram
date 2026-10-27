# Flaregram release checklist

Use this checklist before promoting a beta package to a stable release.

## Local checks

- [ ] `npm ci`
- [ ] `npm run check`
- [ ] `npm pack --dry-run`
- [ ] Confirm the package tarball contains no `.dev.vars`, `.env`, tokens, or
      local bot code.

## Real Telegram smoke test

- [ ] Create or select a disposable Telegram bot.
- [ ] Copy `.dev.vars.sample` to `.dev.vars` and set `BOT_TOKEN` and
      `SECRET_TOKEN`.
- [ ] Run `npm run dev:telegram`.
- [ ] Confirm the CLI reports that the webhook was configured.
- [ ] Send `/start` and confirm the sample plugin replies.
- [ ] Send an unknown message and confirm the expected handler behavior.
- [ ] Run `npm run webhook:info` and confirm the URL ends in `/bot`.
- [ ] Stop development and remove the webhook if the bot is disposable.

## Production checks

- [ ] Deploy with `wrangler deploy`.
- [ ] Store `BOT_TOKEN` and `SECRET_TOKEN` as Wrangler secrets.
- [ ] Set the production webhook URL explicitly.
- [ ] Verify `GET /` and a real Telegram update.
- [ ] Confirm no token appears in logs or the Worker bundle.

## Release

- [ ] Review the public API and migration notes.
- [ ] Update the version and changelog.
- [ ] Publish the package with the intended dist-tag.
- [ ] Verify `npm view flaregram version dist-tags`.
- [ ] Create a Git tag matching the published version.
