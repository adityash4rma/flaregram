//// flaregram © 2024 by Aditya Sharma is licensed under Attribution-NonCommercial 4.0 International. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/


import { ErrorStr, colors } from '../utils/strings.js';

/// --------- Copy Single Message Function ---------- ///
export async function f_copyMessage(body) {
  try {
  const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}/copyMessage`;

  /// Making mandatory params ///
  let param_chat_id = '';
  let param_from_chat_id = '';
  let param_message_id = '';

  if (body.chat_id != undefined) {
    param_chat_id = body.chat_id;
  } else {
    throw new Error(ErrorStr.undefinedParameter + colors.yellow + `chat_id` + colors.white);
  };

  if (body.from_chat_id != undefined) {
    param_from_chat_id = body.from_chat_id;
  } else {
    throw new Error(ErrorStr.undefinedParameter + colors.yellow + `from_chat_id` + colors.white);
  }

  if (body.message_id != undefined) {
    param_message_id = body.message_id;
  } else {
    throw new Error(ErrorStr.undefinedParameter + colors.yellow + `message_id` + colors.white);
  }

  /// Making optional params
  const param_message_thread_id = body.message_thread_id == undefined?parseInt(body.message_thread_id) : '';
  const param_caption = body.caption == undefined?'':body.caption;
  const param_parse_mode = body.parse_mode == undefined?'':body.parse_mode;
  const param_caption_entities = body.caption_entities == undefined?'':body.caption_entities;
  const param_disable_notification = body.disable_notification == undefined?'False':body.disable_notification;
  const param_protect_content = body.protect_content == undefined?'False':body.protect_content;
  const param_reply_parameters = body.reply_parameters == undefined?'':body.reply_parameters;
  const param_reply_markup = body.reply_markup == undefined?'':body.reply_markup;

  const payload = {
    chat_id: param_chat_id,
    from_chat_id: param_from_chat_id,
    message_id: param_message_id,
    
    caption: param_caption,
    parse_mode: param_parse_mode,
    caption_entities: param_caption_entities,
    message_thread_id: param_message_thread_id,
    disable_notification: param_disable_notification,
    protect_content: param_protect_content,
    reply_parameters: param_reply_parameters,
    reply_markup: param_reply_markup,
  };
    

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  }).then(response => response.json())
  .then(response => {
    if (response.ok == false){
    console.error(ErrorStr.telegramError + colors.yellow + response.description + colors.white)
    console.error(colors.red + `ERROR =>  ` + colors.yellow + `Cannot Copy Message - msg: ${payload.message_id}` + colors.white)
  };
  });

  return response;
  } catch (error){
    console.error(error)
  };
}

