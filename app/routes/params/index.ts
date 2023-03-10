import { Router } from '../../../lib/router';

import type { ICtx } from '../../../lib/types';

const paramsRouter = new Router('/params');

paramsRouter.get('/', (ctx: ICtx) => {
  ctx.res.status(200).json({
    message: 'Hello Params',
  });
});

paramsRouter.get('/:id', (ctx: ICtx) => {
  ctx.res.status(200).json({
    message: {
      id: ctx.req.params.id,
    },
  });
});

paramsRouter.get('/:id/:name', (ctx: ICtx) => {
  ctx.res.status(200).json({
    message: {
      id: ctx.req.params.id,
      name: ctx.req.params.name,
    },
  });
});

export default paramsRouter;
