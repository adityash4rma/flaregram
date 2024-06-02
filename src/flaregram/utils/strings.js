//// flaregram © 2024 by Aditya Sharma is licensed under GNU AFFERO GENERAL PUBLIC LICENSE (GNU AGPL v3).


//// --- Color codes ---- ////
export const colors = {
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


//// ---- Strings ---- ////

export const status_good = {"Status":"Operational / OK / Good","flaregram":{"Github":"https://github.com/adityash4rma/flaregram","Developer":"https://github.com/adityash4rma"}};

export const status_bad =  {"Status":"Broken / NOT OK / Bad","flaregram":{"Github":"https://github.com/adityash4rma/flaregram","Developer":"https://github.com/adityash4rma"}};

//// ---- Errors ----- ////

export const ErrorStr = { 
    undefinedParameter: `Undefined mandatory parameter => `,
    telegramError: `${colors.red}TELEGRAM ERROR =>${colors.white}  `
};

