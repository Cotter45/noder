import { Router } from '../../../lib/router';

import type { ICtx } from '../../../lib/types';

const bodyRouter = new Router('/body');

bodyRouter.get('/', (ctx: ICtx) => {
  ctx.res.status(200).json({
    message: 'Hello Body',
  });
});

bodyRouter.post('/', (ctx: ICtx) => {
  ctx.res.status(201).json({
    message: ctx.req.body,
  });
});

export default bodyRouter;
