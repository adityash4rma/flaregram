//// flaregram © 2024 by Aditya Sharma is licensed under GNU AFFERO GENERAL PUBLIC LICENSE (GNU AGPL v3).
import { getEnv } from './config.js';
import { createTelegramClient } from '../webhook.js';

/// --------- Setting Webhook URL ---------- ///
async function setWebhook(URL, SECRET_TOKEN, DROP_PENDING_UPDATES) {
  const env = getEnv();
  return createTelegramClient(env.BOT_TOKEN).setWebhook(URL, SECRET_TOKEN, {
    dropPendingUpdates: DROP_PENDING_UPDATES === 'True' || DROP_PENDING_UPDATES === true,
  });
}



export {
  setWebhook
};
