import { Router } from '../../lib/router';

import bodyRouter from './body';
import errorsRouter from './errors';
import loggingRouter from './logging';
import methodsRouter from './methods';
import middlewareRouter from './middleware';
import paramsRouter from './params';
import queryRouter from './query';

import type { ICtx } from '../../lib/types';

const apiRouter = new Router('/api');

// Add routes or nested routers here
apiRouter.useRouter(bodyRouter);
apiRouter.useRouter(errorsRouter);
apiRouter.useRouter(loggingRouter);
apiRouter.useRouter(methodsRouter);
apiRouter.useRouter(middlewareRouter);
apiRouter.useRouter(paramsRouter);
apiRouter.useRouter(queryRouter);

apiRouter.get('/', (ctx: ICtx) => {
  ctx.res.status(200).json({
    message: 'Hello World',
  });
});

export default apiRouter;
