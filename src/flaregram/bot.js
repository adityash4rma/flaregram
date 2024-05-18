
//// flaregram © 2024 by Aditya Sharma is licensed under Attribution-NonCommercial 4.0 International. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/

import { f_forwardMessage } from "./api/forwardMessage";
import { f_forwardMessages } from "./api/forwardMessages";
import { f_sendMessage } from "./api/sendMessage";
import { f_answerCallbackQuery } from "./api/answerCallbackQuery";
import { f_copyMessage } from "./api/copyMessage";

/// Bot Object for flaregram

export const bot = {
    message: {
        sendMessage: f_sendMessage,
        forwardMessage: f_forwardMessage,
        forwardMessages: f_forwardMessages,
        copyMessage: f_copyMessage,
        answerCallbackQuery: f_answerCallbackQuery
    },



};

