import { Router } from '../../lib/router';

import type { ICtx } from '../../lib/types';

const apiRouter = new Router('/api');

// Add routes or nested routers here

apiRouter.get('/', (ctx: ICtx) => {
  ctx.res.status(200).json({
    message: 'Hello World',
  });
});

apiRouter.get('/:hello', (ctx: ICtx) => {
  return {
    message: `Hello ${ctx.req.params.hello}`,
  };
});

apiRouter.get(
  '/middleware',
  async () => {
    return {
      message: 'Hello Middleware',
    };
  },

  (ctx: ICtx) => {
    ctx.res.status(200).json({
      message: 'Hello Response',
    });
  },
);

export default apiRouter;
