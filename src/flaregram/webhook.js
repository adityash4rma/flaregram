export function buildWebhookUrl(url) {
  const normalized = String(url).replace(/\/+$/, '');
  return normalized.endsWith('/bot') ? normalized : `${normalized}/bot`;
}

export function createTelegramClient(token, fetchImpl = fetch) {
  if (!token || typeof token !== 'string') {
    throw new TypeError('A Telegram BOT_TOKEN is required');
  }

  async function request(method, payload = {}) {
    const response = await fetchImpl(
      `https://api.telegram.org/bot${token}/${method}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    const data = await response.json();
    if (!response.ok || data.ok === false) {
      throw new Error(data.description || `Telegram ${method} failed (${response.status})`);
    }
    return data;
  }

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
