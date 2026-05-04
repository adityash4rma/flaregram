//// flaregram © 2024 by Aditya Sharma is licensed under GNU AFFERO GENERAL PUBLIC LICENSE (GNU AGPL v3).
//
// Module-scoped env singleton. The Workers fetch handler receives `env`
// per request; setEnv() stashes it so framework modules can resolve
// BOT_TOKEN / SECRET_TOKEN / etc. without each method taking env as a
// parameter. Replaces the old `import env from '../../config.json'`
// pattern (which baked the token into the deployed worker bundle).

let _env = null;

export function setEnv(env) {
  _env = env;
}

export function getEnv() {
  if (!_env) {
    throw new Error(
      'flaregram: env not initialized. Call setEnv(env) (or app.launch(request, env, ctx)) inside your fetch handler before invoking framework methods.'
    );
  }
  return _env;
}
