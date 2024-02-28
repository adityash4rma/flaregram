//// flaregram © 2024 by Aditya Sharma is licensed under Attribution-NonCommercial 4.0 International. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/

//import { BOT_TOKEN } from '../../config';
//import { WEBHOOK_URL, secret_token, should_drop_pending_updates } from '../../config';
//import { router } from '../../router';


/// --------- Setting Webhook URL ---------- ///
async function setWebhook(URL, secret_token, should_drop_pending_updates) {
  let token;
  let HOOK_URL = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${URL}`;

    if (secret_token === '') {
      const token = secret_token; 
      HOOK_URL = `${HOOK_URL}&secret_token=${token}`
    } else if (typeof secret_token === "string") {
      const token = secret_token
      HOOK_URL = `${HOOK_URL}&secret_token=${token}`
    };
  
  
  if (should_drop_pending_updates === "True") {
    HOOK_URL = `${HOOK_URL}&drop_pending_updates=${should_drop_pending_updates}`
  } 

  //const response = await fetch(HOOK_URL, { method: 'POST' });
  
/*   await fetch(HOOK_URL, { method: 'POST' })
  .then(async response => {
    const data = await response.json()
    console.log(data)
    return  data;
  }).catch(err => console.error("new error:    "+err)); */
  try {
    const response = await fetch(HOOK_URL, { method: 'POST' });
    const data = await response.json();
    console.log(HOOK_URL);
    return data;
  } catch (err) {
    console.error("new error: " + err);
  }
  
}



export {
  setWebhook
};
