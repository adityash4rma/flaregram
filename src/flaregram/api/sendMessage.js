//// flaregram © 2024 by Aditya Sharma is licensed under GNU AFFERO GENERAL PUBLIC LICENSE (GNU AGPL v3).

import { getEnv } from '../utils/config.js';
import { ErrorStr, colors } from '../utils/strings.js';
import { requestTelegram } from './request.js';

/// --------- Sending Message Function ---------- ///
export async function f_sendMessage(body) {
  try {
  if (!body || typeof body !== 'object') throw new TypeError('sendMessage payload must be an object');
  const env = getEnv();
  let param_chat_id = '';
  let param_text = '';

  if (body.chat_id != undefined) {
    param_chat_id = body.chat_id;
  } else {
    throw new Error(ErrorStr.undefinedParameter + `${colors.yellow}chat_id${colors.white}`);
  };

  if (body.text != undefined) {
    param_text = body.text;
  } else {
    throw new Error(ErrorStr.undefinedParameter + `text`);
  }

  const param_message_thread_id = body.message_thread_id == undefined?'':body.message_thread_id;
  const param_reply_markup = body.reply_markup == undefined?'':body.reply_markup;
  const param_disable_web_page_preview = body.disable_web_page_preview == undefined?false:body.disable_web_page_preview;
  const param_reply_to_message_id = body.reply_to_message_id == undefined?'':body.reply_to_message_id;
  const param_disable_notification = body.disable_notification == undefined?'':body.disable_notification;
  const param_protect_content = body.protect_content == undefined?'False':body.protect_content;
  const param_parse_mode = body.parse_mode == undefined?'Markdown':body.parse_mode;

  const payload = {
    chat_id: param_chat_id,
    message_thread_id: param_message_thread_id,
    text: param_text,
    reply_markup: param_reply_markup,
    disable_web_page_preview: param_disable_web_page_preview,
    reply_to_message_id: param_reply_to_message_id,
    disable_notification: param_disable_notification,
    protect_content: param_protect_content,
    parse_mode: param_parse_mode
  };

  return await requestTelegram(env.BOT_TOKEN, 'sendMessage', payload);
  } catch (error){
    console.error(error);
    return { ok: false, error: error.message };
  }
}

