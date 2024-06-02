//// flaregram © 2024 by Aditya Sharma is licensed under GNU AFFERO GENERAL PUBLIC LICENSE (GNU AGPL v3).


import { ErrorStr, colors } from '../utils/strings.js';

/// --------- SAnswer Callback Query Function ---------- ///
export async function f_answerCallbackQuery(body) {
  try {
  const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`;

  /// Making mandatory params ///
  let param_id = '';

  if (body.id != undefined) {
    param_id = body.id;
  } else {
    throw new Error(ErrorStr.undefinedParameter + colors.yellow + `id` + colors.white);
  };


  /// Making optional params
  const param_text = body.text == undefined?'':body.text;
  const param_show_alert = body.show_alert == undefined?'False':body.show_alert;
  const param_cache_time = body.cache_time == undefined?'':body.cache_time;
  const param_url = body.url == undefined?'':body.url; // would only work if the callback comes from a callback_game button.

  const payload = {
    // required
    callback_query_id: param_id,
    //optionals
    text: param_text,
    show_alert: param_show_alert,
    cache_time: param_cache_time,
    url: param_url,
  };
    

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  }).then(response => response.json())
  .then(response => {
    if (response.ok == false){
    console.error(ErrorStr.telegramError + colors.yellow + response.description + colors.white)
    console.error(colors.red + `ERROR =>  ` + colors.yellow + `Cannot perform answerCallbackQuery - ${payload.callback_query_id}` + colors.white)
  };
  });

  return response;
  } catch (error){
    console.error(error)
  };
}