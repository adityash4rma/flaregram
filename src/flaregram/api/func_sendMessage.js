
//// flaregram © 2024 by Aditya Sharma is licensed under Attribution-NonCommercial 4.0 International. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/

//import {BOT_TOKEN} from '../../config.js';
import { colors } from '../../config.js';
import { ErrorStr } from '../utils/strings.js';

/// --------- Sending Message Function ---------- ///
export async function f_sendMessage(body) {
  try {
  const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

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

    console.log(JSON.stringify(payload));
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.error('Error sending message:', response.status, response.statusText);
    throw new Error('Error sending message');
  }

  return response;
  } catch (error){
    console.error(error)
  };

  return response.json()
}

