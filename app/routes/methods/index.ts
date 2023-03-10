import { Router } from '../../../lib/router';

import type { ICtx } from '../../../lib/types';

const methodsRouter = new Router('/methods');

methodsRouter.get('/', (ctx: ICtx) => {
  ctx.res.status(200).json({
    message: 'Hello Methods',
  });
});

methodsRouter.post('/', (ctx: ICtx) => {
  ctx.res.status(201).json({
    message: ctx.req.body,
  });
});

methodsRouter.put('/:id', (ctx: ICtx) => {
  ctx.res.status(200).json({
    message: {
      id: ctx.req.params.id,
      body: ctx.req.body,
    },
  });
});

methodsRouter.patch('/:id', (ctx: ICtx) => {
  ctx.res.status(200).json({
    message: {
      id: ctx.req.params.id,
      body: ctx.req.body,
    },
  });
});

methodsRouter.delete('/:id', (ctx: ICtx) => {
  ctx.res.status(200).json({
    message: {
      id: ctx.req.params.id,
    },
  });
});

export default methodsRouter;
