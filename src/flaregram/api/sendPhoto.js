import { getEnv } from '../utils/config.js';
import { requestTelegram } from './request.js';

const PHOTO_OPTIONS = [
  'business_connection_id',
  'message_thread_id',
  'direct_messages_topic_id',
  'ephemeral_message_parameters',
  'caption',
  'parse_mode',
  'caption_entities',
  'show_caption_above_media',
  'has_spoiler',
  'disable_notification',
  'protect_content',
  'allow_paid_broadcast',
  'message_effect_id',
  'suggested_post_parameters',
  'reply_parameters',
  'reply_markup',
];

function isUpload(value) {
  return typeof Blob !== 'undefined' && value instanceof Blob;
}

function buildPhotoPayload(body) {
  const payload = { chat_id: body.chat_id, photo: body.photo };
  for (const key of PHOTO_OPTIONS) {
    if (body[key] !== undefined) payload[key] = body[key];
  }
  return payload;
}

function toFormData(payload) {
  const form = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    if (key === 'photo') form.append(key, value);
    else if (typeof value === 'object') form.append(key, JSON.stringify(value));
    else form.append(key, String(value));
  }
  return form;
}

export async function f_sendPhoto(body) {
  try {
    if (!body || typeof body !== 'object') throw new TypeError('sendPhoto payload must be an object');
    if (body.chat_id === undefined) throw new Error('sendPhoto requires chat_id');
    if (body.photo === undefined) throw new Error('sendPhoto requires photo');

    const payload = buildPhotoPayload(body);
    const requestBody = isUpload(body.photo) ? toFormData(payload) : payload;
    return await requestTelegram(getEnv().BOT_TOKEN, 'sendPhoto', requestBody);
  } catch (error) {
    console.error(error);
    return { ok: false, error: error.message };
  }
}
