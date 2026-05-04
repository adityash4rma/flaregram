//// flaregram © 2024 by Aditya Sharma is licensed under GNU AFFERO GENERAL PUBLIC LICENSE (GNU AGPL v3).

export class Router {
  constructor() {
    this.routes = {};
    this.notFound = (request) => new Response('Not Found', { status: 404 });
  }

  add(method, path, handler) {
    this.routes[`${method} ${path}`] = handler;
  }

  async route(request, workerCtx) {
    const { method, url } = request;
    const { pathname } = new URL(url);
    const handler = this.routes[`${method} ${pathname}`] || this.notFound;
    return handler(request, workerCtx);
  }

  // Back-compat with the legacy router consumers that called router.handle().
  async handle(request, workerCtx) {
    return this.route(request, workerCtx);
  }
}
