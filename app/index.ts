import { Server } from '@cotter45/noderjs';
import { initConfig } from './config';
import apiRouter from './routes';

const config = initConfig();

/**
 * Server setup and configuration
 */
const server = new Server(config);

// server.staticDir('build');

server.useRouter(apiRouter);
server.listen();
