import { app } from 'flaregram';
import './plugins/index.js';

export default {
  fetch(request, env, ctx) {
    return app.launch(request, env, ctx);
  },
};
