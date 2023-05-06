import { Router } from '../../../lib/router';

import type {
  ICtx,
  INextFunction,
  IRequest,
  IResponse,
} from '../../../lib/types';

const middlewareRouter = new Router('/middleware');

const midRouter2 = new Router('/mid2');

midRouter2.get('/', (ctx: ICtx) => {
  ctx.res.status(200).json({
    message: 'Hello Middleware 2',
  });
});

middlewareRouter.use((req: IRequest, res: IResponse, next: INextFunction) => {
  console.log('Middleware Called');
  next();
});

middlewareRouter.useRouter(midRouter2);

middlewareRouter.get('/', (ctx: ICtx) => {
  ctx.res.status(200).json({
    message: 'Hello Middleware',
  });
});

const callNext = (req: IRequest, res: IResponse, next: INextFunction) => {
  next();
};

middlewareRouter.get('/next', callNext, (ctx: ICtx) => {
  ctx.res.status(200).json({
    message: 'Next Called',
  });
});

const earlyReturn = (req: IRequest, res: IResponse) => {
  res.status(200).json({
    message: 'Returned from middleware',
  });
};

middlewareRouter.get('/return', earlyReturn, (ctx: ICtx) => {
  ctx.res.status(200).json({
    message: 'Next Called',
  });
});

export default middlewareRouter;
