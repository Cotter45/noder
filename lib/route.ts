import { ServerError } from './errors';
import { executeMiddleware } from './executeMiddleware';

import type { ICtx, IRequest, IResponse } from './types';

/**
 * Route Class - Created by the Router class
 * @param path - The path of the route.
 * Paths can include one paramater, which is denoted by a colon (:)
 * @param method - The method of the route.
 * Methods can be GET, POST, PUT, DELETE, PATCH
 * @param middleware - An array of middleware functions.
 * Middleware functions are executed in the order they are passed in
 * @param callback - The callback function.
 * Callback functions are executed after all middleware ( if any ) functions have been executed
 */
export class Route {
  path: string;
  segments: string[];
  method: string;
  params?: { [key: string]: number };
  middleware: any[];
  callback: any;

  constructor(
    path: string,
    method: string,
    middleware: any[] = [],
    callback: any,
  ) {
    this.path = path;
    this.segments = path.split('/').filter(Boolean);
    if (path.includes(':')) {
      this.params = {};
      for (let i = 0; i < path.length; i++) {
        if (path[i] === ':') {
          let paramName = '';
          for (let j = i + 1; j < path.length; j++) {
            if (path[j] === '/') {
              break;
            }
            paramName += path[j];
          }
          this.params[paramName] = i;
        }
      }
    }
    this.method = method;
    this.middleware = middleware || [];
    this.callback = callback;
  }

  private async handleMiddleware(
    middleware: any[],
    req: IRequest,
    res: IResponse,
  ): Promise<any> {
    return await executeMiddleware(middleware, req, res);
  }

  async execute(ctx: ICtx) {
    if (this.middleware.length) {
      const middlewareResult = await this.handleMiddleware(
        this.middleware,
        ctx.req,
        ctx.res,
      );

      if (middlewareResult) {
        return middlewareResult;
      }
    }

    try {
      const result = await this.callback(ctx);
      return result;
    } catch (e: any) {
      if (!ctx.res.headersSent) {
        new ServerError(ctx.req, ctx.res, e.message);
      }
    }
  }
}
