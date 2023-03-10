import { Router } from '../../../lib/router';

import type { ICtx } from '../../../lib/types';

const errorsRouter = new Router('/errors');

errorsRouter.get('/', (ctx: ICtx) => {
  ctx.res.status(200).json({
    message: 'Hello Errors',
  });
});

errorsRouter.get('/404', (ctx: ICtx) => {
  ctx.res.status(404).json({
    message: 'Not Found',
  });
});

errorsRouter.get('/throw', () => {
  throw new Error('Error Thrown');
});

export default errorsRouter;
