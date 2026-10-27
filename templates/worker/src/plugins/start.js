import { app } from 'flaregram';
import { bot } from 'flaregram/bot';

app.on_message('/start', (ctx, worker) => {
  worker.waitUntil(bot.message.sendMessage({
    chat_id: ctx.message.chat.id,
    text: 'Hey, this is a simple message!',
  }));
});
