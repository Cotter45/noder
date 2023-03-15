import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

import { NotFoundError } from './errors';
import { Request } from './request';
import { Response } from './response';
import { Router } from './router';
import { executeMiddleware } from './executeMiddleware';
import { mimeTypes } from './mimeTypes';

import type { ICtx, IRequest, IResponse } from './types';

/**
 * The main server class, adding anything to your config.ctx object will also add it to the ctx object for use within middleware and callbacks.
 * @param config - The server configuration object
 * @param config.fileServer - If you want to use the file server. Default false.
 * @param config.port - The port you want to use. Default 8000.
 * @param config.host - The host you want to use. Default 0.0.0.0.
 * @param config.ctx - The context object to be passed to all routes and middleware.
 */
export class Server {
  declare server: http.Server;
  declare routers: Map<string, Router>;
  declare middleware: any[];
  declare errorHandler: (err: Error, req: IRequest, res: IResponse) => void;

  declare fileServer?: boolean;
  declare static: string;

  declare config: { [key: string]: any };
  declare ctx: { [key: string]: any };
  declare staticFileMap: { [key: string]: string };

  constructor(config: { [key: string]: any } = {}) {
    this.routers = new Map();
    this.middleware = [];
    if (config.ctx) {
      this.ctx = config.ctx;
      delete config.ctx;
    }
    this.config = config;
    if (config.fileServer) {
      this.fileServer = true;
      this.static = 'public';
      this.setUpStaticFileMap();
    }
  }

  /**
   * Lists this directory as a static folder
   * @param dir The name of the static folder, must be inside the 'app' directory
   */
  staticDir = (dir: string) => {
    this.static = dir;
    this.setUpStaticFileMap(dir);
  };

  private setUpStaticFileMap = (dir?: string) => {
    const staticPath = `app/${dir || this.static}`;

    const getFiles = (dir: string) => {
      const files = fs.readdirSync(dir);
      const allFiles: string[] = [];

      files.forEach((file) => {
        const filePath = `${dir}/${file}`;
        const isDirectory = fs.statSync(filePath).isDirectory();

        if (isDirectory) {
          allFiles.push(...getFiles(filePath));
        } else {
          allFiles.push(filePath);
        }
      });

      return allFiles;
    };

    if (fs.existsSync(staticPath)) {
      this.staticFileMap = getFiles(staticPath).reduce(
        (acc: any, file: string) => {
          const filePath = file.replace(staticPath, '');
          acc[filePath] = file;
          return acc;
        },
        {},
      );
    }
  };

  private serveStatic = (
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ) => {
    const pathname = req.url;
    let filePath = !pathname || pathname === '/' ? '/index.html' : pathname;
    let extname = filePath
      ? String(path.extname(filePath)).toLowerCase()
      : '.html';

    if (!extname) {
      filePath = '/index.html';
      extname = '.html';
    }

    if (!filePath) {
      res.writeHead(404);
      res.end(`Sorry, check with the site admin for error: ${res.statusCode}`);
      res.end();
      return;
    }

    const contentType = mimeTypes[extname] || 'application/octet-stream';
    const file = this.staticFileMap[filePath];

    if (!file) {
      res.writeHead(404);
      res.end(`Sorry, check with the site admin for error: ${res.statusCode}`);
      res.end();
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(file).pipe(res);
  };

  /**
   * Adds middleware to the server, will run before any routers
   * @param middleware - The middleware you want to use
   */
  use(middleware: any) {
    this.middleware.push(middleware);
  }

  /**
   * Adds a router to the server
   * @param router - The router you want to use
   * @returns void
   */
  useRouter(router: Router) {
    this.routers.set(router.path, router);
  }

  /**
   * Handles server level errors
   * @param errorHandler - The error handler you want to use
   * @returns void
   */
  handleError(
    errorHandler: (err: Error, req: IRequest, res: IResponse) => void,
  ) {
    this.errorHandler = errorHandler;
  }

  private bodyParser = (req: http.IncomingMessage) => {
    return new Promise((resolve, reject) => {
      try {
        let body = '';

        req.on('data', (chunk: any) => {
          body += chunk.toString();
        });

        req.on('end', async () => {
          const contentType = req.headers['content-type'];

          switch (contentType) {
            case 'application/json':
              resolve(JSON.parse(body));
              break;
            default:
              resolve(body);
          }
        });
      } catch (e) {
        reject(new Error('Internal Server Error'));
      }
    });
  };

  private async handleMiddleware(
    middleware: any[],
    req: IRequest,
    res: IResponse,
  ): Promise<any> {
    return await executeMiddleware(middleware, req, res);
  }

  private matchRouters(ctx: ICtx): Router | undefined {
    if (ctx.req.url.length > 1 && ctx.req.url.endsWith('/')) {
      ctx.req.url = ctx.req.url.slice(0, -1);
    }

    const segments = ctx.req.url.split('/').filter(Boolean);
    let currentRouter: Router | undefined = undefined;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];

      const childRouter: Router | undefined = currentRouter
        ? currentRouter.routers.get(`/${segment}`)
        : this.routers.get(`/${segment}`);

      if (!childRouter) {
        return currentRouter;
      }

      ctx.req.url = ctx.req.url.replace(`/${segments[i]}`, '');
      currentRouter = childRouter;

      if (currentRouter && currentRouter.routers.size === 0) {
        return currentRouter;
      }
    }

    return currentRouter;
  }

  /**
   * Required to start the server, will listen on the port and host provided or the dafaults.
   * @param port - Defauls to 8000
   * @param host - Defaults to 0.0.0.0
   */
  async listen(port?: number, host?: string) {
    if (this.fileServer) {
      const exists = fs.existsSync(path.resolve(`app/${this.static}`));

      if (!exists) {
        process.emitWarning('Uh oh...', {
          code: 'STATIC_DIR_NOT_FOUND',
          detail: `You've specified you want to use the static file server, but the static directory "${this.static}" could not be found.`,
        });
      }
    }

    if (this.fileServer && !this.routers.has('/api')) {
      process.emitWarning('Whoops...', {
        code: 'NO_ROOT_ROUTER',
        detail: `Because you've specified you want to use the static file server, you should add a root router to the server with the path "/api".`,
      });
    }
    const server = http.createServer(async (request: any, response: any) => {
      let middlewareDone = false;
      const req: IRequest = Request(request);
      let res: IResponse = Response(req, response);

      try {
        if (request.method === 'OPTIONS') {
          response.writeHead(204, request.headers);
          response.end();
          return;
        }

        let body: any = {};

        if (request.method !== 'GET' && request.method !== 'HEAD') {
          body = await this.bodyParser(request);
        }
        req.body = body;

        if (this.fileServer) {
          res = Response(req, response, this.staticFileMap);
        } else {
          res = Response(req, response);
        }

        if (!middlewareDone && this.middleware.length) {
          const result: any = await this.handleMiddleware(
            this.middleware,
            req,
            res,
          );
          if (result) {
            res.status(result.status || 500).json({
              message: result.message || 'Internal Server Error.',
            });
            return;
          }
          middlewareDone = true;
        }

        if (request.method === 'HEAD') {
          response.writeHead(200, request.headers);
          response.end();
          return;
        }

        const rootPathname = req.url.split('/')[1];

        if (this.fileServer && !this.routers.has(`/${rootPathname}`)) {
          this.serveStatic(req, res);
          return;
        }

        const ctx: ICtx = {
          req,
          res,
          config: this.config,
          ...this.ctx,
        };

        const router = this.matchRouters(ctx);
        if (!router) {
          new NotFoundError(req, res);
          return;
        }

        const result = await router.execute(ctx);

        if (result) {
          if (ctx.res.headersSent) {
            return;
          }

          return ctx.res.status(result.status || 200).json(result);
        }
      } catch (e: any) {
        if (this.errorHandler) {
          this.errorHandler(e, req, res);
          return;
        }
        if (!response.headersSent) {
          response.statusCode = 500;
          response.end('Internal Server Error');
        }
      }
    });

    server.listen(
      port || this.config.port || 8000,
      host || this.config.host || '0.0.0.0',
      () => {
        console.log(
          '\x1b[33m%s\x1b[0m',
          `Server listening on port ${port || this.config.port || 8000} 🚀`,
        );
      },
    );

    this.server = server;

    process.on('uncaughtException', (err: any) => {
      console.error(err);
    });

    process.on('unhandledRejection', (err: any) => {
      console.error(err);
    });

    process.on('warning', (warning) => {
      if (warning) {
        console.log(warning);
        process.exit(1);
      }
    });

    process.once('SIGTERM', () => {
      this.server.close(() => {
        console.log('Process terminated');
      });
    });

    process.once('SIGINT', () => {
      this.server.close(() => {
        console.log('Process terminated');
      });
    });
  }

  public close() {
    this.server.close();
  }
}
