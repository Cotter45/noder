import { Router } from '../../../lib/router';

import type { ICtx } from '../../../lib/types';

const queryRouter = new Router('/query');

queryRouter.get('/', (ctx: ICtx) => {
  ctx.res.status(200).json({
    message: 'Hello Query',
  });
});

queryRouter.get('/string', (ctx: ICtx) => {
  // /api/query/string?string=test

  ctx.res.status(200).json({
    message: ctx.req.query.string,
  });
});

export default queryRouter;
