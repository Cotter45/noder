import { NotFoundError, ServerError } from './errors';
import { executeMiddleware } from './executeMiddleware';
import { Route } from './route';

import type { ICtx, IRequest, IResponse } from './types';

/**
 * Router Class
 * @param path - The path of the router. Can not include parameters
 */
export class Router {
  declare path: string;
  declare middleware: any[];
  declare errorHandler: (err: Error, req: IRequest, res: IResponse) => void;

  declare routers: Map<string, Router>;
  declare getRoutes: Map<string, Route>;
  declare postRoutes: Map<string, Route>;
  declare putRoutes: Map<string, Route>;
  declare patchRoutes: Map<string, Route>;
  declare deleteRoutes: Map<string, Route>;

  constructor(path: string) {
    this.path = path.startsWith('/') ? path : `/${path}`;
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
    this.routers.set(router.path, router);
  }

  /**
   * Handles router level errors
   * @param errorHandler - The error handler you want to use
   * @returns void
   */
  handleError(
    errorHandler: (err: Error, req: IRequest, res: IResponse) => void,
  ) {
    this.errorHandler = errorHandler;
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

    path.includes('/')
      ? this.getRoutes.set(path, new Route(path, 'GET', middleware, callback))
      : this.getRoutes.set(
          '/' + path,
          new Route('/' + path, 'GET', middleware, callback),
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

    path.includes('/')
      ? this.postRoutes.set(path, new Route(path, 'POST', middleware, callback))
      : this.postRoutes.set(
          '/' + path,
          new Route('/' + path, 'POST', middleware, callback),
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

    path.includes('/')
      ? this.putRoutes.set(path, new Route(path, 'PUT', middleware, callback))
      : this.putRoutes.set(
          '/' + path,
          new Route('/' + path, 'PUT', middleware, callback),
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

    path.includes('/')
      ? this.patchRoutes.set(
          path,
          new Route(path, 'PATCH', middleware, callback),
        )
      : this.patchRoutes.set(
          '/' + path,
          new Route('/' + path, 'PATCH', middleware, callback),
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

    path.includes('/')
      ? this.deleteRoutes.set(
          path,
          new Route(path, 'DELETE', middleware, callback),
        )
      : this.deleteRoutes.set(
          '/' + path,
          new Route('/' + path, 'DELETE', middleware, callback),
        );
  }

  async handleMiddleware(
    middleware: any[],
    req: IRequest,
    res: IResponse,
  ): Promise<any> {
    return await executeMiddleware(middleware, req, res);
  }

  private async matchRoute(
    ctx: ICtx,
    methodRouter: Map<string, Route>,
  ): Promise<Route | undefined> {
    const url = ctx.req.url;

    if (!url || url === '/') {
      const root = methodRouter.get('/');
      if (root && root.middleware.length > 0) {
        await this.handleMiddleware(root.middleware, ctx.req, ctx.res);
      }
      return root;
    }

    const segments = ctx.req.segments;
    const joinedSegments = '/' + segments.join('/');

    if (segments.length === 0) {
      const root = methodRouter.get('/');
      if (root && root.middleware.length > 0) {
        await this.handleMiddleware(root.middleware, ctx.req, ctx.res);
      }
      return root;
    }

    for (const [path, route] of methodRouter) {
      if (route.params) {
        const routeSegments = route.segments;

        if (routeSegments.length !== segments.length) {
          continue;
        }

        const params: { [key: string]: string } = {};

        let match = true;
        for (let i = 0; i < routeSegments.length; i++) {
          const routeSegment = routeSegments[i];
          const segment = segments[i];

          if (routeSegment.startsWith(':')) {
            params[routeSegment.slice(1)] = segment;
          } else if (routeSegment !== segment) {
            match = false;
            break;
          }
        }

        if (match) {
          ctx.req.params = params;
          if (route.middleware && route.middleware.length > 0) {
            await this.handleMiddleware(route.middleware, ctx.req, ctx.res);
          }
          return route;
        }
      } else if (path === joinedSegments) {
        if (route.middleware && route.middleware.length > 0) {
          await this.handleMiddleware(route.middleware, ctx.req, ctx.res);
        }
        return route;
      }
    }

    return undefined;
  }

  async execute(ctx: ICtx): Promise<any> {
    let middlewareDone = false;

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
      let result: any;

      const methodMap: { [key: string]: Map<string, Route> } = {
        GET: this.getRoutes,
        POST: this.postRoutes,
        PUT: this.putRoutes,
        PATCH: this.patchRoutes,
        DELETE: this.deleteRoutes,
      };

      const methodRoutes = methodMap[ctx.req.method];
      let route: Route | undefined;

      if (methodRoutes) {
        route = await this.matchRoute(ctx, methodRoutes);

        if (!route) {
          return new NotFoundError(ctx.req, ctx.res);
        }

        result = await route.execute(ctx);
      }

      if (result) {
        return result;
      }
    } catch (e: any) {
      if (this.errorHandler) {
        this.errorHandler(e, ctx.req, ctx.res);
      }
      if (!ctx.res.headersSent) {
        return new ServerError(ctx.req, ctx.res, e.message);
      }
    }
  }
}
