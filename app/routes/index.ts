import { Router } from '../lib';

import type { ICtx } from '../lib';

const apiRouter = new Router('/api');

// Add routes or nested routers here

apiRouter.get('/', [], (ctx: ICtx) => {
  ctx.res.status(200).json({
    message: 'Hello World',
  });
});

apiRouter.get('/:hello', [], (ctx: ICtx) => {
  return {
    message: `Hello ${ctx.req.params.hello}`,
  };
});

export default apiRouter;
