import { Route } from './route';

import type { ICtx } from './types';

export async function executeRoute(ctx: ICtx, router: Map<string, Route>) {
  const getRoute = router.get(ctx.req.url);
  if (getRoute) {
    return await getRoute.execute(ctx);
  }

  for await (const [, route] of router) {
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
        return await route.execute(ctx);
      }
    }
  }
}
