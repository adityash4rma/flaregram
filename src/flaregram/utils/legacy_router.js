//// flaregram © 2024 by Aditya Sharma is licensed under GNU AFFERO GENERAL PUBLIC LICENSE (GNU AGPL v3).

import env from '../../config.json'
import { updateHandler } from '../../index';
import { setWebhook } from './webhook';
import {  colors, status_good, status_bad } from './strings.js';

// Create a new router instance
const router = {
  routes: [],
  post(path, handler) {
    this.routes.push({ method: 'POST', path, handler });
  },
  handle(request) {
    const { pathname } = new URL(request.url);
    const route = this.routes.find((route) => route.method === request.method && new RegExp(`^${route.path}$`).test(pathname));
    console.log(route);
    if (route) {
      return route.handler(request);
    } else {
      return new Response(JSON.stringify(status_good), { status: 200 });
    }
  },
};

// Function to process '/bot' route
async function handleBotRequest(update) {
  try {
    const token = update.headers.get('X-Telegram-Bot-Api-Secret-Token');

    //const { method, body } = request;
    const data = await update.json();

    if (env.SECRET_TOKEN == token) {
      console.log(
        `SERVER: Incoming ${colors.yellow}SECRET_TOKEN${colors.white} has been verified [ ${colors.green}${token}${colors.white} ]`
      );

      await updateHandler(data);
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }
  } catch (error) {
    console.error('Error processing update:', error);
    return new Response()
  }
  return new Response(JSON.stringify(status_good), { status: 200 });
}

// Route handler
router.post('/bot', handleBotRequest);

/// ----- Create a route for setting webhook url ---- ///
router.post('/set-webhook', async (request) => {
  const webhookResult = await setWebhook(env.WEBHOOK_URL, env.SECRET_TOKEN, env.DROP_PENDING_UPDATES);
  return new Response(webhookResult.description, { status: 200 });
});

export { router, handleBotRequest };
