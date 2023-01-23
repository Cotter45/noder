import { ServerError } from './errors';
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
  useRouter(path: string, router: Router) {
    path.includes('/')
      ? this.routers.set(this.path + path, router)
      : this.routers.set(this.path + '/' + path, router);

    router.updatePath(this.path + path);
  }

  private updatePath(path: string) {
    this.path = path;
  }

  /**
   * Adds a GET http method route to the router
   * @param path - The path of the route
   * @param middleware - An array of middleware functions
   * @param callback - The callback function
   * @returns - void
   */
  get(path: string, middleware: any[], callback: any) {
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
   * @param middleware - An array of middleware functions
   * @param callback - The callback function
   * @returns - void
   */
  post(path: string, middleware: any[], callback: any) {
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
   * @param middleware - An array of middleware functions
   * @param callback - The callback function
   * @returns - void
   */
  put(path: string, middleware: any[], callback: any) {
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
   * @param middleware - An array of middleware functions
   * @param callback - The callback function
   * @returns - void
   */
  patch(path: string, middleware: any[], callback: any) {
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
   * @param middleware - An array of middleware functions
   * @param callback - The callback function
   * @returns - void
   */
  delete(path: string, middleware: any[], callback: any) {
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

  private async executeMiddleware(
    middleware: any[],
    req: IRequest,
    res: IResponse,
  ): Promise<any> {
    if (!middleware.length) return false;

    function* middlewareGenerator(middleware: any[]) {
      for (const func of middleware) {
        yield func;
      }
    }

    const middlewareIterator = middlewareGenerator(middleware);
    let result: any;

    const next = async () => {
      const nextFunc = middlewareIterator.next();
      if (!nextFunc.value) return false;
      const response = await nextFunc.value(req, res, next);
      if (response) result = response;
      return result;
    };

    try {
      const response = await next();
      if (response) {
        return response;
      }
      return false;
    } catch (e: any) {
      return {
        status: 500,
        body: 'Internal Server Error',
      };
    }
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
      const middlewareResult = await this.executeMiddleware(
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

      switch (ctx.req.method) {
        case 'GET':
          const getRoute = this.getRoutes.get(ctx.req.url);
          if (getRoute) {
            result = await getRoute.execute(ctx);
            break;
          }

          for await (const [, route] of this.getRoutes) {
            if (route.paramIndex) {
              const routePath = route.path.slice(0, route.paramIndex);
              const reqPath = ctx.req.url.slice(0, route.paramIndex);

              if (routePath === reqPath && route.paramName) {
                ctx.req.params[route.paramName] = ctx.req.url.slice(
                  route.paramIndex,
                  ctx.req.url.lastIndexOf('/') > route.paramIndex
                    ? ctx.req.url.lastIndexOf('/')
                    : ctx.req.url.length,
                );
                result = await route.execute(ctx);
                break;
              }
            }
          }
          break;
        case 'POST':
          const postRoute = this.postRoutes.get(ctx.req.url);
          if (postRoute) {
            result = await postRoute.execute(ctx);
            break;
          }

          for await (const [, route] of this.postRoutes) {
            if (route.paramIndex) {
              const routePath = route.path.slice(0, route.paramIndex);
              const reqPath = ctx.req.url.slice(0, route.paramIndex);

              if (routePath === reqPath && route.paramName) {
                ctx.req.params[route.paramName] = ctx.req.url.slice(
                  route.paramIndex,
                  ctx.req.url.lastIndexOf('/') > route.paramIndex
                    ? ctx.req.url.lastIndexOf('/')
                    : ctx.req.url.length,
                );
                result = await route.execute(ctx);
              }
            }
          }
          break;
        case 'PUT':
          const putRoute = this.putRoutes.get(ctx.req.url);
          if (putRoute) {
            result = await putRoute.execute(ctx);
            break;
          }

          for await (const [, route] of this.putRoutes) {
            if (route.paramIndex) {
              const routePath = route.path.slice(0, route.paramIndex);
              const reqPath = ctx.req.url.slice(0, route.paramIndex);

              if (routePath === reqPath && route.paramName) {
                ctx.req.params[route.paramName] = ctx.req.url.slice(
                  route.paramIndex,
                  ctx.req.url.lastIndexOf('/') > route.paramIndex
                    ? ctx.req.url.lastIndexOf('/')
                    : ctx.req.url.length,
                );
                result = await route.execute(ctx);
              }
            }
          }
          break;
        case 'PATCH':
          const patchRoute = this.patchRoutes.get(ctx.req.url);
          if (patchRoute) {
            result = await patchRoute.execute(ctx);
            break;
          }

          for await (const [, route] of this.patchRoutes) {
            if (route.paramIndex) {
              const routePath = route.path.slice(0, route.paramIndex);
              const reqPath = ctx.req.url.slice(0, route.paramIndex);

              if (routePath === reqPath && route.paramName) {
                ctx.req.params[route.paramName] = ctx.req.url.slice(
                  route.paramIndex,
                  ctx.req.url.lastIndexOf('/') > route.paramIndex
                    ? ctx.req.url.lastIndexOf('/')
                    : ctx.req.url.length,
                );
                result = await route.execute(ctx);
              }
            }
          }
          break;
        case 'DELETE':
          const deleteRoute = this.deleteRoutes.get(ctx.req.url);
          if (deleteRoute) {
            result = await deleteRoute.execute(ctx);
            break;
          }

          for await (const [, route] of this.deleteRoutes) {
            if (route.paramIndex) {
              const routePath = route.path.slice(0, route.paramIndex);
              const reqPath = ctx.req.url.slice(0, route.paramIndex);

              if (routePath === reqPath && route.paramName) {
                ctx.req.params[route.paramName] = ctx.req.url.slice(
                  route.paramIndex,
                  ctx.req.url.lastIndexOf('/') > route.paramIndex
                    ? ctx.req.url.lastIndexOf('/')
                    : ctx.req.url.length,
                );
                result = await route.execute(ctx);
              }
            }
          }
          break;
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
