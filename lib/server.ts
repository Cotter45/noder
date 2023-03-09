import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import logger from 'pino';

import { NotFoundError } from './errors';
import { Request } from './request';
import { Response } from './response';
import { Router } from './router';
import { executeMiddleware } from './executeMiddleware';

import type { ICtx, IRequest, IResponse } from './types';

/**
 * The main server class, adding anything to your config.ctx object will also add it to the ctx object for use within middleware and callbacks.
 * @param config - The server configuration object
 * @param config.port - The port you want to use. Default 8000.
 * @param config.host - The host you want to use. Default 0.0.0.0.
 * @param config.ctx - The context object to be passed to all routes and middleware.
 */
export class Server {
  declare routers: Map<string, Router>;
  declare middleware: any[];
  declare config: { [key: string]: any };
  declare ctx: { [key: string]: any };
  declare logger?: any;
  declare fileServer?: boolean;
  declare static: any;
  declare keepAliveTimeout: number;
  declare headersTimeout: number;
  declare staticFileMap: { [key: string]: string };

  constructor(config: { [key: string]: any } = {}) {
    this.routers = new Map();
    this.middleware = [];
    if (config.ctx) {
      this.ctx = config.ctx;
      delete config.ctx;
    }
    this.config = config;
    if (config.logger) {
      this.logger = logger();
    }
    this.keepAliveTimeout = config.keepAliveTimeout;
    this.headersTimeout = config.headersTimeout;
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
    const filePath = !pathname || pathname === '/' ? '/index.html' : pathname;
    const extname = filePath
      ? String(path.extname(filePath)).toLowerCase()
      : '.html';

    if (!filePath) {
      res.writeHead(404);
      res.end(`Sorry, check with the site admin for error: ${res.statusCode}`);
      res.end();
      return;
    }

    const mimeTypes: { [key: string]: string } = {
      '.aac': 'audio/aac',
      '.abw': 'application/x-abiword',
      '.arc': 'application/x-freearc',
      '.avi': 'video/x-msvideo',
      '.avif': 'image/avif',
      '.azw': 'application/vnd.amazon.ebook',
      '.bin': 'application/octet-stream',
      '.bmp': 'image/bmp',
      '.bz': 'application/x-bzip',
      '.bz2': 'application/x-bzip2',
      '.cda': 'application/x-cdf',
      '.csh': 'application/x-csh',
      '.csv': 'text/csv',
      '.doc': 'application/msword',
      '.docx':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.eot': 'application/vnd.ms-fontobject',
      '.epub': 'application/epub+zip',
      '.gz': 'application/gzip',
      '.gif': 'image/gif',
      '.htm': 'text/html',
      '.html': 'text/html',
      '.ico': 'image/vnd.microsoft.icon',
      '.ics': 'text/calendar',
      '.jar': 'application/java-archive',
      '.jpeg': 'image/jpeg',
      '.jpg': 'image/jpeg',
      '.js': 'text/javascript',
      '.json': 'application/json',
      '.jsonld': 'application/ld+json',
      '.mid': 'audio/midi audio/x-midi',
      '.midi': 'audio/midi audio/x-midi',
      '.mjs': 'text/javascript',
      '.mp3': 'audio/mpeg',
      '.mpeg': 'video/mpeg',
      '.mp4': 'video/mp4',
      '.mpkg': 'application/vnd.apple.installer+xml',
      '.odp': 'application/vnd.oasis.opendocument.presentation',
      '.ods': 'application/vnd.oasis.opendocument.spreadsheet',
      '.odt': 'application/vnd.oasis.opendocument.text',
      '.oga': 'audio/ogg',
      '.ogv': 'video/ogg',
      '.ogx': 'application/ogg',
      '.opus': 'audio/opus',
      '.otf': 'font/otf',
      '.png': 'image/png',
      '.pdf': 'application/pdf',
      '.php': 'application/x-httpd-php',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx':
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.rar': 'application/vnd.rar',
      '.rtf': 'application/rtf',
      '.sh': 'application/x-sh',
      '.svg': 'image/svg+xml',
      '.tar': 'application/x-tar',
      '.tif': 'image/tiff',
      '.tiff': 'image/tiff',
      '.ts': 'video/mp2t',
      '.ttf': 'font/ttf',
      '.txt': 'text/plain',
      '.vsd': 'application/vnd.visio',
      '.wav': 'audio/wav',
      '.weba': 'audio/webm',
      '.webm': 'video/webm',
      '.webp': 'image/webp',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.xhtml': 'application/xhtml+xml',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.xml': 'application/xml',
      '.xul': 'application/vnd.mozilla.xul+xml',
      '.zip': 'application/zip',
      '.3gp': 'video/3gpp',
      '.3g2': 'video/3gpp2',
      '.7z': 'application/x-7z-compressed',
      '.css': 'text/css',
      '.wasm': 'application/wasm',
      '.webmanifest': 'application/manifest+json',
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';
    const file = this.staticFileMap[filePath];

    if (!file) {
      res.writeHead(404);
      res.end(`Sorry, check with the site admin for error: ${res.statusCode}`);
      res.end();
      return;
    }

    fs.readFile(file, (error, content) => {
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
    const server = http.createServer(async (request: any, response: any) => {
      let middlewareDone = false;

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

        const req: IRequest = Request(request);
        req.body = body;
        const res: IResponse = Response(req, response);

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
            if (this.logger) {
              this.logger.info({
                method: request.method,
                url: request.url,
                status: result.status || res.statusCode,
                error: result.errorMessage,
              });
            }
            return;
          }
          middlewareDone = true;
        }

        if (request.method === 'HEAD') {
          response.writeHead(200, request.headers);
          response.end();
          return;
        }

        if (
          this.fileServer &&
          (request.url === '/' || request.url.includes('.'))
        ) {
          this.serveStatic(req, res);
          return;
        }

        const ctx: ICtx = {
          req,
          res,
          config: this.config,
          ...this.ctx,
        };

        this.logger ? (ctx.logger = this.logger) : null;

        const router = this.matchRouters(ctx);
        if (!router) {
          new NotFoundError(req, res);
          return;
        }

        const result = await router.execute(ctx);

        if (result) {
          if (this.logger) {
            this.logger.info({
              path: req.url,
              method: req.method,
              status: res.statusCode,
              requestId: req.requestId,
            });
          }

          if (ctx.res.headersSent) {
            return;
          }

          return ctx.res.status(result.status || 200).json(result);
        }
      } catch (e: any) {
        if (!response.headersSent) {
          response.statusCode = 500;
          response.end('Internal Server Error');
        }

        if (this.logger) {
          this.logger.error(e);
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

    if (this.keepAliveTimeout) {
      server.keepAliveTimeout = this.keepAliveTimeout;
    }

    if (this.headersTimeout) {
      server.headersTimeout = this.headersTimeout;
    }

    return server;
  }
}
