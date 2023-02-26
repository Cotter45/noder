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
  method: string;
  paramIndex: number | null;
  paramName: string | null;
  middleware: any[];
  callback: any;

  constructor(
    path: string,
    method: string,
    middleware: any[] = [],
    callback: any,
  ) {
    this.path = path;
    this.method = method;
    this.paramIndex = this.path.includes(':') ? this.path.indexOf(':') : null;
    this.paramName = this.paramIndex
      ? this.path.slice(
          this.paramIndex + 1,
          path.indexOf('/', this.paramIndex) > 0
            ? path.indexOf('/', this.paramIndex)
            : path.length,
        )
      : null;
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
      if (result && !result.statusCode) {
        return result;
      }

      return {
        status: ctx.res.res.statusCode,
        alreadySent: true,
      };
    } catch (e: any) {
      ctx.logger.error(e);
      return new ServerError(ctx.req, ctx.res, e.message);
    }
  }
}