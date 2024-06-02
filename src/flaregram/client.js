//// flaregram © 2024 by Aditya Sharma is licensed under GNU AFFERO GENERAL PUBLIC LICENSE (GNU AGPL v3).

import { EventEmitter } from 'node:events';
import { Router } from './utils/router';


export class Client extends EventEmitter {
    constructor() {
      super();
    }
    

    // ::: on_message Event :::
    on_message(filters, requite) {
      if (typeof requite !== 'function') {
        throw new TypeError('The listener must be a function');
      }
      
      // Wrap the listener to include the additional parameters
      const callbackFunction = (...args) => {
        requite(...args);
      };
  
      // Check if the listener has already been added
      if (!this.listeners(filters).includes(callbackFunction)) {
        // Call the original 'on' method with the wrapped listener
        this.on(filters, callbackFunction);
      }
      return new Response('ok', { status: 200 })
    }

    launch(request, ctx) {
      
    }
    
  }

function addMethodsToDictionary(obj) {
    const dictionary = {};
    const properties = Object.getOwnPropertyNames(Object.getPrototypeOf(obj));

    properties.forEach(prop => {
        if (typeof obj[prop] === 'function' && prop !== 'constructor') {
           router.add('POST', "/webhook", obj[prop]);
            
        }
    });

    return dictionary;
}

export const app = new Client();
export const router = new Router();
addMethodsToDictionary(router);


