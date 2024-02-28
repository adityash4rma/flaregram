
//// flaregram © 2024 by Aditya Sharma is licensed under Attribution-NonCommercial 4.0 International. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/


// *BOT TOKEN - Bot Tokens are used to access the bot.
//const BOT_TOKEN = "6292649461:AAHOPkngWisYc8vEn3zNxrPXFmFfIVf9qRo"
//const BOT_TOKEN = BOT_TOKEN;

// *WEBHOOK URL - HTTPS URL to send updates to.
const WEBHOOK_URL = ``

// *DROP PENDING UPDATES - Drop all pending messages in webhook if connection is lost
const should_drop_pending_updates = 'True'


// *SECRET TOKEN - Use and define secret token for webhook. 
// Secret token is useful to ensure that the request comes from a webhook set by you.
// Guidelines for secret token is in README.md
const secret_token = ""


// Color codes
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m",
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
  };


export { 
    //BOT_TOKEN, 
    WEBHOOK_URL, 
    secret_token,
    should_drop_pending_updates,
    colors
};