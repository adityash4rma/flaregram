<p align="center">
  <img alt="npm version" src="https://img.shields.io/npm/v/flaregram?color=ff1743">
  <img alt="GitHub stars" src="https://img.shields.io/github/stars/adityash4rma/flaregram">
  <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/adityash4rma/flaregram?color=ff1743">
  <img alt="license" src="https://img.shields.io/npm/l/flaregram?color=ff1743">
</p>

<p align="center">
  <img src="https://telegra.ph/file/32b8407ce6ba4fe9d8d8c.png" width="400" alt="flaregram">
</p>

<p align="center">
  <b>super-light</b> · <b>blazing-fast</b> · <b>modular</b>
  <br><br>
  A small JavaScript Telegram bot framework for Cloudflare Workers.
</p>

<br>

## Start here

```bash
npx flaregram init my-bot
cd my-bot
npm install
```

Copy `.dev.vars.sample` to `.dev.vars`, add your BotFather token, and start
developing:

```bash
npm run dev:telegram
```

<br>

## Your first plugin

```js
import { app } from 'flaregram';
import { bot } from 'flaregram/bot';

app.on_message('/start', (ctx, worker) => {
  worker.waitUntil(bot.message.sendMessage({
    chat_id: ctx.message.chat.id,
    text: 'Hey, this is a simple message!',
  }));
});
```

Import the file from `src/plugins/index.js`. That is all the framework needs:
write a handler, and Flaregram routes Telegram updates to it.

<br>

## Local development

Flaregram uses Wrangler and Cloudflare Quick Tunnels instead of ngrok. It
starts the Worker, finds the temporary public URL, waits for it to become
reachable, and registers Telegram's webhook automatically.

```bash
npm run dev:telegram
```

[Read the local development guide in the Wiki →](https://github.com/adityash4rma/flaregram/wiki/6.-Testing-And-Deployment)

<br>

## Deploy

```bash
npx wrangler secret put BOT_TOKEN
npx wrangler secret put SECRET_TOKEN
npx wrangler deploy
npx flaregram webhook set --url https://your-worker.workers.dev
```

[Read the deployment guide in the Wiki →](https://github.com/adityash4rma/flaregram/wiki/6.-Testing-And-Deployment)

<br>

## Learn the framework

The Wiki covers installation, plugins, callbacks, environment variables,
webhooks, errors, testing, and deployment.

[Open the Flaregram Wiki →](https://github.com/adityash4rma/flaregram/wiki)

<br>

## Contribute

Found a bug or have an idea? Open an issue or send a pull request. Keep the
runtime small, the plugin API clear, and the docs friendly to someone seeing
Flaregram for the first time.

[Read the contribution and release notes in the Wiki →](https://github.com/adityash4rma/flaregram/wiki/6.-Testing-And-Deployment)

<br>

## License

![AGPLv3](https://www.gnu.org/graphics/agplv3-with-text-162x68.png)

Flaregram is licensed under the GNU Affero General Public License v3.
