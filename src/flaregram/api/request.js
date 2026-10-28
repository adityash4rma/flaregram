export class TelegramApiError extends Error {
  constructor(message, { method, status, code, description, cause } = {}) {
    super(message, { cause });
    this.name = 'TelegramApiError';
    this.method = method;
    this.status = status;
    this.code = code;
    this.description = description;
  }
}

export async function requestTelegram(token, method, payload = {}, fetchImpl = fetch) {
  if (!token || typeof token !== 'string') {
    throw new TelegramApiError('A Telegram BOT_TOKEN is required', { method });
  }

  let response;
  try {
    const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
    response = await fetchImpl(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      ...(isFormData ? {} : { headers: { 'Content-Type': 'application/json' } }),
      body: isFormData ? payload : JSON.stringify(payload),
    });
  } catch (cause) {
    throw new TelegramApiError(`Telegram ${method} request failed`, { method, cause });
  }

  let data;
  try {
    data = await response.json();
  } catch (cause) {
    throw new TelegramApiError(`Telegram ${method} returned invalid JSON`, {
      method,
      status: response.status,
      cause,
    });
  }

  if (!response.ok || data?.ok === false) {
    throw new TelegramApiError(
      data?.description || `Telegram ${method} failed (${response.status})`,
      {
        method,
        status: response.status,
        code: data?.error_code,
        description: data?.description,
      }
    );
  }

  return data;
}
