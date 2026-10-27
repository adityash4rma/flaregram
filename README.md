# flaregram

Flaregram is a lightweight Telegram bot framework for Cloudflare Workers. It
lets you keep bot behavior in small plugin files while the framework handles
webhooks, routing, Telegram requests, and Worker execution contexts.

## Create a bot

```bash
npx flaregram init my-bot
cd my-bot
npm install
copy .dev.vars.sample .dev.vars
```

Set `BOT_TOKEN` and `SECRET_TOKEN` in `.dev.vars`. The token comes from
[@BotFather](https://t.me/BotFather).

## Write a plugin

```js
// src/plugins/start.js
import { app } from 'flaregram';
import { bot } from 'flaregram/bot';

app.on_message('/start', (ctx, worker) => {
  worker.waitUntil(bot.message.sendMessage({
    chat_id: ctx.message.chat.id,
    text: 'Hey, this is a simple message!',
  }));
});
```

Import the plugin from `src/plugins/index.js`. Plugins register handlers when
they are imported; no central command switch is needed.

## Local Telegram webhooks

Install [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/),
then run:

```bash
npm run dev:telegram
```

Flaregram starts Wrangler, creates a Cloudflare Quick Tunnel, waits for the
tunnel to become reachable, and configures Telegram with the temporary `/bot`
webhook URL. This replaces ngrok. The URL changes when the tunnel restarts.

For manual control:

```bash
npx flaregram webhook set --url https://your-url.example
npx flaregram webhook info
npx flaregram webhook delete
```

## Deploy

```bash
npx wrangler secret put BOT_TOKEN
npx wrangler secret put SECRET_TOKEN
npx wrangler deploy
npx flaregram webhook set --url https://your-worker.workers.dev
```

Production Workers do not need Cloudflared because their Worker URL is already
public.

## Install in an existing Worker

```bash
npm install flaregram
```

Public entry points are available from `flaregram`, `flaregram/bot`,
`flaregram/client`, and `flaregram/webhook`.

## Development

```bash
npm test
npm run start
```

Flaregram is licensed under the GNU AGPL v3. See [LICENSE](./LICENSE).
