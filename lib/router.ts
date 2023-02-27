import { ServerError } from './errors';
import { executeMiddleware } from './executeMiddleware';
import { executeRoute } from './executeRoute';
import { Route } from './route';

import type { ICtx, IRequest, IResponse } from './types';

/**
 * Router Class
 * @param path - The path of the router. Can not include parameters
 */
export class Router {
  path: string;
  middleware: any[];
  routers: Map<string, Router>;
  getRoutes: Map<string, Route>;
  postRoutes: Map<string, Route>;
  putRoutes: Map<string, Route>;
  patchRoutes: Map<string, Route>;
  deleteRoutes: Map<string, Route>;

  constructor(path: string) {
    this.path = path;
    this.middleware = [];
    this.routers = new Map();
    this.getRoutes = new Map();
    this.postRoutes = new Map();
    this.putRoutes = new Map();
    this.patchRoutes = new Map();
    this.deleteRoutes = new Map();
  }

  /**
   *
   * @param middleware - A middleware function for the router to call on matching routes
   */
  use(middleware: any) {
    this.middleware.push(middleware);
  }

  /**
   * Adds a nested router to the router
   * @param path - The path of the router
   * @param router - The nested router to use
   */
  useRouter(router: Router) {
    router.path.includes('/')
      ? this.routers.set(this.path + router.path, router)
      : this.routers.set(this.path + '/' + router.path, router);

    router.updatePath(this.path + router.path);
  }

  private updatePath(path: string) {
    this.path = path;
  }

  /**
   * Adds a GET http method route to the router
   * @param path - The path of the route
   * @param ...args - Functions to call in order, the last function is the callback
   * @returns - void
   */
  get(path: string, ...args: any) {
    const middleware = args.length > 1 ? args.slice(0, args.length - 1) : [];
    const callback = args.length > 1 ? args[args.length - 1] : args[0];

    if (path === '/') {
      this.getRoutes.set(
        this.path,
        new Route(this.path, 'GET', middleware, callback),
      );
      return;
    }

    path.includes('/')
      ? this.getRoutes.set(
          this.path + path,
          new Route(this.path + path, 'GET', middleware, callback),
        )
      : this.getRoutes.set(
          this.path + '/' + path,
          new Route(this.path + '/' + path, 'GET', middleware, callback),
        );
  }

  /**
   * Adds a POST http method route to the router
   * @param path - The path of the route
   * @param ...args - Functions to call in order, the last function is the callback
   * @returns - void
   */
  post(path: string, ...args: any[]) {
    const middleware = args.length > 1 ? args.slice(0, args.length - 1) : [];
    const callback = args.length > 1 ? args[args.length - 1] : args[0];

    if (path === '/') {
      this.postRoutes.set(
        this.path,
        new Route(this.path, 'POST', middleware, callback),
      );
      return;
    }

    path.includes('/')
      ? this.postRoutes.set(
          this.path + path,
          new Route(this.path + path, 'POST', middleware, callback),
        )
      : this.postRoutes.set(
          this.path + '/' + path,
          new Route(this.path + '/' + path, 'POST', middleware, callback),
        );
  }

  /**
   * Adds a PUT http method route to the router
   * @param path - The path of the route
   * @param ...args - Functions to call in order, the last function is the callback
   * @returns - void
   */
  put(path: string, ...args: any[]) {
    const middleware = args.length > 1 ? args.slice(0, args.length - 1) : [];
    const callback = args.length > 1 ? args[args.length - 1] : args[0];

    if (path === '/') {
      this.putRoutes.set(
        this.path,
        new Route(this.path, 'PUT', middleware, callback),
      );
      return;
    }

    path.includes('/')
      ? this.putRoutes.set(
          this.path + path,
          new Route(this.path + path, 'PUT', middleware, callback),
        )
      : this.putRoutes.set(
          this.path + '/' + path,
          new Route(this.path + '/' + path, 'PUT', middleware, callback),
        );
  }

  /**
   * Adds a PATCH http method route to the router
   * @param path - The path of the route
   * @param ...args - Functions to call in order, the last function is the callback
   * @returns - void
   */
  patch(path: string, ...args: any[]) {
    const middleware = args.length > 1 ? args.slice(0, args.length - 1) : [];
    const callback = args.length > 1 ? args[args.length - 1] : args[0];

    if (path === '/') {
      this.patchRoutes.set(
        this.path,
        new Route(this.path, 'PATCH', middleware, callback),
      );
      return;
    }

    path.includes('/')
      ? this.patchRoutes.set(
          this.path + path,
          new Route(this.path + path, 'PATCH', middleware, callback),
        )
      : this.patchRoutes.set(
          this.path + '/' + path,
          new Route(this.path + '/' + path, 'PATCH', middleware, callback),
        );
  }

  /**
   * Adds a DELETE http method route to the router
   * @param path - The path of the route
   * @param ...args - Functions to call in order, the last function is the callback
   * @returns - void
   */
  delete(path: string, ...args: any[]) {
    const middleware = args.length > 1 ? args.slice(0, args.length - 1) : [];
    const callback = args.length > 1 ? args[args.length - 1] : args[0];

    if (path === '/') {
      this.deleteRoutes.set(
        this.path,
        new Route(this.path, 'DELETE', middleware, callback),
      );
      return;
    }

    path.includes('/')
      ? this.deleteRoutes.set(
          this.path + path,
          new Route(this.path + path, 'DELETE', middleware, callback),
        )
      : this.deleteRoutes.set(
          this.path + '/' + path,
          new Route(this.path + '/' + path, 'DELETE', middleware, callback),
        );
  }

  private async handleMiddleware(
    middleware: any[],
    req: IRequest,
    res: IResponse,
  ): Promise<any> {
    return await executeMiddleware(middleware, req, res);
  }

  async execute(ctx: ICtx, nestedUrl?: string): Promise<any> {
    let middlewareDone = false;

    if (ctx.req.url.endsWith('/')) {
      ctx.req.url = ctx.req.url.slice(0, -1);
    }

    const splitUrl = ctx.req.url.split('/');
    const routerUrl = '/' + splitUrl[1];
    const nestedRouterUrl = '/' + splitUrl[2];

    if (!middlewareDone && this.middleware.length) {
      const middlewareResult = await this.handleMiddleware(
        this.middleware,
        ctx.req,
        ctx.res,
      );

      if (middlewareResult) {
        middlewareDone = true;
        return middlewareResult;
      }
      middlewareDone = true;
    }

    try {
      if (this.routers.has(routerUrl + nestedRouterUrl)) {
        const router = this.routers.get(routerUrl + nestedRouterUrl);
        if (router) {
          return await router.execute(ctx, routerUrl);
        }
      } else if (this.routers.has(routerUrl)) {
        const router = this.routers.get(routerUrl);
        if (router) {
          return await router.execute(ctx);
        }
      }

      let result: any;

      if (nestedUrl) {
        ctx.req.url = ctx.req.url.replace(nestedUrl, '');
      }

      const methodMap: { [key: string]: Map<string, Route> } = {
        GET: this.getRoutes,
        POST: this.postRoutes,
        PUT: this.putRoutes,
        PATCH: this.patchRoutes,
        DELETE: this.deleteRoutes,
      };

      const method = methodMap[ctx.req.method];

      if (method) {
        result = await executeRoute(ctx, method);
      }

      if (result) {
        if (result.length) result = result[0];
        if (result.alreadySent) {
          return {
            status: result.status || 200,
            requestId: ctx.req.requestId,
            alreadySent: result.alreadySent,
          };
        }
        return result;
      }
    } catch (e: any) {
      ctx.logger.error(e);
      return new ServerError(ctx.req, ctx.res, e.message);
    }
  }
}
