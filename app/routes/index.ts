import { Router } from '../../lib/router';

import bodyRouter from './body';
import errorsRouter from './errors';
import methodsRouter from './methods';
import middlewareRouter from './middleware';
import paramsRouter from './params';
import queryRouter from './query';

import type { ICtx } from '../../lib/types';

const apiRouter = new Router('/api');

// Add routes or nested routers here
apiRouter.useRouter(bodyRouter);
apiRouter.useRouter(errorsRouter);
apiRouter.useRouter(methodsRouter);
apiRouter.useRouter(middlewareRouter);
apiRouter.useRouter(paramsRouter);
apiRouter.useRouter(queryRouter);

apiRouter.get('/', (ctx: ICtx) => {
  ctx.res.status(200).json({
    message: 'Hello World',
  });
});

apiRouter.get('/redirect', (ctx: ICtx) => {
  ctx.res.redirect('/api');
});

apiRouter.get('/file', (ctx: ICtx) => {
  ctx.res.sendFile('images/tree.jpeg');
});

apiRouter.get('/download', (ctx: ICtx) => {
  ctx.res.download('images/tree.jpeg');
});

apiRouter.handleError((err, req, res) => {
  res.status(500).json({
    message: err.message,
    location: 'Router Error Handler',
  });
});

export default apiRouter;
