import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import logger from 'pino';

import { NotFoundError } from './errors';
import { Request } from './request';
import { Response } from './response';
import { Router } from './router';

import type { IRequest, IResponse } from './types';

/**
 * The main server class
 * @param config - The server configuration object
 * @param config.port - The port you want to use. Default 8000.
 * @param config.host - The host you want to use. Default 0.0.0.0.
 * @param config.db - The database you want to use. No default.
 * @param config.emitter - The event emitter you want to use. No default.
 */
export class Server {
  declare routers: Map<string, Router>;
  declare middleware: any[];
  declare config: { [key: string]: any };
  declare dbPool: any;
  declare logger: any;
  declare static: any;
  declare emitter: any;
  declare keepAliveTimeout: number;
  declare headersTimeout: number;

  constructor(config: { [key: string]: any }) {
    this.routers = new Map();
    this.middleware = [];
    this.config = config;
    this.dbPool = config.db;
    this.static = 'public';
    this.emitter = config.eventEmitter;
    this.logger = logger();
    this.keepAliveTimeout = config.keepAliveTimeout;
    this.headersTimeout = config.headersTimeout;
  }

  /**
   *
   * @param dir The name of the static folder, must be inside the 'app' directory
   */
  staticDir = (dir: string) => {
    this.static = dir;
  };

  private serveStatic = (
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ) => {
    const pathname = req.url;
    const filePath =
      pathname === '/' || pathname === '' ? '/index.html' : pathname;
    const extname = filePath
      ? String(path.extname(filePath)).toLowerCase()
      : '.html';
    const mimeTypes: { [key: string]: string } = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.wav': 'audio/wav',
      '.mp4': 'video/mp4',
      '.woff': 'application/font-woff',
      '.ttf': 'application/font-ttf',
      '.eot': 'application/vnd.ms-fontobject',
      '.otf': 'application/font-otf',
      '.wasm': 'application/wasm',
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(`app/${this.static}${filePath}`, (error, content) => {
      if (error) {
        if (error.code === 'ENOENT') {
          res.writeHead(404);
          res.end(
            `Sorry, check with the site admin for error: ${error.code} ..\n`,
          );
          res.end();
        } else {
          res.writeHead(500);
          res.end(
            `Sorry, check with the site admin for error: ${error.code} ..\n`,
          );
          res.end();
        }
      } else {
        // add headers for cache
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  };

  use(middleware: any) {
    this.middleware.push(middleware);
  }

  useRouter(router: Router) {
    this.routers.set(router.path, router);
  }

  private bodyParser = (req: http.IncomingMessage) => {
    return new Promise((resolve, reject) => {
      try {
        let body = '';

        req.on('data', (chunk: any) => {
          body += chunk.toString();
        });

        req.on('end', () => {
          if (body && req.headers['content-type'] === 'application/json') {
            resolve(JSON.parse(body));
          } else resolve({});
        });
      } catch (e) {
        reject(new Error('Internal Server Error'));
      }
    });
  };

  private async executeMiddleware(
    middleware: any[],
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ): Promise<any> {
    if (!middleware.length) return false;

    function* middlewareGenerator(middleware: any[]) {
      for (const func of middleware) {
        yield func;
      }
    }

    const middlewareIterator = middlewareGenerator(middleware);
    let result: any;

    const next = async () => {
      const nextFunc = middlewareIterator.next();
      if (!nextFunc.value) return false;
      const response = await nextFunc.value(req, res, next);
      if (response) result = response;
      return result;
    };

    try {
      const response = await next();
      if (response) {
        return response;
      }
      return false;
    } catch (e: any) {
      return {
        status: 500,
        message: 'Internal Server Error.',
        errorMessage: e.message,
      };
    }
  }

  /**
   * Required to start the server, will listen on the port and host provided or the dafaults.
   * @param port - Defauls to 8000
   * @param host - Defaults to 0.0.0.0
   */
  async listen(port?: number, host?: string) {
    const server = await http.createServer(
      async (request: any, response: any) => {
        let middlewareDone = false;
        let req: IRequest;
        let res: IResponse;

        try {
          if (request.method === 'OPTIONS') {
            response.writeHead(204, request.headers);
            response.end();
            return;
          }

          const body = await this.bodyParser(request);

          if (!middlewareDone && this.middleware.length) {
            const result: any = await this.executeMiddleware(
              this.middleware,
              request,
              response,
            );
            if (result) {
              response.statusCode = result.status || 500;
              response.end(
                JSON.stringify({
                  message: result.message || 'Internal Server Error.',
                }),
              );
              this.logger.info({
                method: request.method,
                url: request.url,
                status: result.status || response.statusCode,
                error: result.errorMessage,
              });
              return;
            }
            middlewareDone = true;
          }

          if (this.static && request.url && !request.url.includes('/api')) {
            this.serveStatic(request, response);
            return;
          }

          req = Request(request, body);
          res = new Response(req, response);

          const routerPath = req.url.split('/')[1];

          if (this.routers.has('/' + routerPath)) {
            const ctx = {
              req,
              res,
              db: this.dbPool,
              config: this.config,
              logger: this.logger,
              event: this.emitter,
            };

            const router = this.routers.get('/' + routerPath);
            if (router) {
              const result = await router.execute(ctx);
              if (result) {
                this.logger.info({
                  url: req.url,
                  method: req.method,
                  status: result.status,
                  requestId: req.requestId,
                  message: result.message,
                  data: result.data,
                });
                if (result.alreadySent) return;
                return ctx.res.status(result.status || 200).json(result);
              }
            }
          }

          new NotFoundError(req, res);
          this.logger.error({
            method: req.method,
            url: req.url,
            status: 404,
            requestId: req.requestId,
            message: 'Not Found',
          });
          return;
        } catch (e: any) {
          response.statusCode = 500;
          response.end('Internal Server Error');
          this.logger.error(e);
        }
      },
    );

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

    if (this.keepAliveTimeout) {
      server.keepAliveTimeout = this.keepAliveTimeout;
    }

    if (this.headersTimeout) {
      server.headersTimeout = this.headersTimeout;
    }

    return server;
  }
}
