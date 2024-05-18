//// flaregram © 2024 by Aditya Sharma is licensed under Attribution-NonCommercial 4.0 International. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/


import { ErrorStr, colors } from '../utils/strings.js';

/// --------- Forward Single Message Function ---------- ///
export async function f_forwardMessage(body) {
  try {
  const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}/forwardMessage`;

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
  const param_disable_notification = body.disable_notification == undefined?'False':body.disable_notification;
  const param_protect_content = body.protect_content == undefined?'False':body.protect_content;

  const payload = {
    chat_id: param_chat_id,
    from_chat_id: param_from_chat_id,
    message_id: param_message_id,
    
    message_thread_id: param_message_thread_id,
    disable_notification: param_disable_notification,
    protect_content: param_protect_content,
  };
    

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  }).then(response => response.json())
  .then(response => {
    if (response.ok == false){
    console.error(ErrorStr.telegramError + colors.yellow + response.description + colors.white)
    console.error(colors.red + `ERROR =>  ` + colors.yellow + `Cannot Forward Message - ${payload.message_id} to recipent, ${payload.chat_id}` + colors.white)
  };
  });

  return response;
  } catch (error){
    console.error(error)
  };
}

