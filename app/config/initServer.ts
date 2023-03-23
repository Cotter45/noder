import morgan from 'morgan';
import { Server } from '../../lib';
import { initConfig } from './initConfig';

import apiRouter from '../routes';

const config = initConfig();

/**
 * Server setup and configuration
 */
const app = new Server(config);

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// server.staticDir('build');
app.useRouter(apiRouter);

app.handleError((err, req, res) => {
  res.status(500).json({
    message: err.message,
    location: 'Server Error Handler',
  });
});

export default app;
