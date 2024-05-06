//// flaregram © 2024 by Aditya Sharma is licensed under Attribution-NonCommercial 4.0 International. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/


/// --------- Setting Webhook URL ---------- ///
async function setWebhook(URL, SECRET_TOKEN, DROP_PENDING_UPDATES) {
  let token;
  let HOOK_URL = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${URL}`;

    if (SECRET_TOKEN === '') {
      const token = SECRET_TOKEN; 
      HOOK_URL = `${HOOK_URL}&secret_token=${token}`
    } else if (typeof SECRET_TOKEN === "string") {
      const token = SECRET_TOKEN
      HOOK_URL = `${HOOK_URL}&secret_token=${token}`
    };
  
  
  if (DROP_PENDING_UPDATES === "True") {
    HOOK_URL = `${HOOK_URL}&drop_pending_updates=${DROP_PENDING_UPDATES}`
  };

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
