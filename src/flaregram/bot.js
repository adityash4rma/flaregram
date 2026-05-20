
//// flaregram © 2024 by Aditya Sharma is licensed under GNU AFFERO GENERAL PUBLIC LICENSE (GNU AGPL v3).

import { f_sendMessage } from "./api/sendMessage";

/// Bot Object for flaregram

export const bot = {
    message: {
        sendMessage: f_sendMessage,
    },
};
