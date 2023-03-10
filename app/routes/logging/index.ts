import { Router } from '../../../lib/router';

import type { ICtx } from '../../../lib/types';

const loggingRouter = new Router('/logging');

loggingRouter.get('/', (ctx: ICtx) => {
  ctx.res.status(200).json({
    message: 'Hello Logging',
  });
});

loggingRouter.post('/', (ctx: ICtx) => {
  ctx.logger.info(ctx.req.body);
  ctx.res.status(201).json({
    message: ctx.req.body,
  });
});

export default loggingRouter;
