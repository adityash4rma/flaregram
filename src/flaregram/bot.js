
//// flaregram © 2024 by Aditya Sharma is licensed under Attribution-NonCommercial 4.0 International. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/

import {f_forwardMessage} from "./api/func_forwardMessage";
import {f_sendMessage} from "./api/func_sendMessage";
import { f_answerCallbackQuery } from "./api/func_answerCallbackQuery";

/// Bot Object for flaregram

export const bot = {
    message: {
        sendMessage: f_sendMessage,
        forwardMessage: f_forwardMessage,
        answerCallbackQuery: f_answerCallbackQuery
    },



};

