//// flaregram © 2024 by Aditya Sharma is licensed under GNU AFFERO GENERAL PUBLIC LICENSE (GNU AGPL v3).



export class Router {
    constructor() {
      this.routes = {};
    }
  
    add(method, path, handler) {
      this.routes[`${method} ${path}`] = handler;
    }
  
    async route(request) {
      const { method, url } = request;
      const { pathname } = new URL(url);
      const handler = this.routes[`${method} ${pathname}`] || this.notFound;
      return handler(request);
    }
  
    notFound(request) {
      return new Response('Not Found', { status: 404 });
    }
  }