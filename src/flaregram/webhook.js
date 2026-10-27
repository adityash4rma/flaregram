export function buildWebhookUrl(url) {
  const normalized = String(url).replace(/\/+$/, '');
  return normalized.endsWith('/bot') ? normalized : `${normalized}/bot`;
}

export function createTelegramClient(token, fetchImpl = fetch) {
  if (!token || typeof token !== 'string') throw new TypeError('A Telegram BOT_TOKEN is required');
  const request = (method, payload = {}) => requestTelegram(token, method, payload, fetchImpl);

  return {
    setWebhook(url, secretToken, options = {}) {
      return request('setWebhook', {
        url: buildWebhookUrl(url),
        ...(secretToken ? { secret_token: secretToken } : {}),
        ...(options.dropPendingUpdates !== undefined
          ? { drop_pending_updates: Boolean(options.dropPendingUpdates) }
          : {}),
      });
    },
    deleteWebhook(dropPendingUpdates = false) {
      return request('deleteWebhook', { drop_pending_updates: Boolean(dropPendingUpdates) });
    },
    getWebhookInfo() {
      return request('getWebhookInfo');
    },
  };
}
import { requestTelegram, TelegramApiError } from './api/request.js';

export { TelegramApiError };
