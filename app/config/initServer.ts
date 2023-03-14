import morgan from 'morgan';
import { Server } from '../../lib';
import { initConfig } from './initConfig';

import apiRouter from '../routes';

const config = initConfig();

/**
 * Server setup and configuration
 */
const server = new Server(config);

if (process.env.NODE_ENV !== 'production') {
  server.use(morgan('dev'));
}
// server.staticDir('build');
server.useRouter(apiRouter);

export default server;
