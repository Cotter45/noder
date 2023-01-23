import { Router, NotFoundError, ServerError, Route, Server } from '.';
import { Request } from './request';
import { Response } from './response';
import type { ICtx } from './types';

describe('Router', () => {
  it('should be defined', () => {
    expect(Router).toBeDefined();
  });

  it('should be able to create a router', () => {
    const router = new Router('/');

    expect(router).toBeDefined();
  });

  it('should be able to add a route', () => {
    const router = new Router('/');
    router.get('/test', [], () => {
      return 'test';
    });

    expect(router.getRoutes.size).toBe(1);
  });

  it('should be able to add a router', () => {
    const router = new Router('/');
    const subRouter = new Router('/test');
    router.useRouter('/test', subRouter);

    expect(router.routers.size).toBe(1);
  });

  it('should be able to add middleware', () => {
    const router = new Router('/');
    router.use(() => {
      return 'test';
    });

    expect(router.middleware.length).toBe(1);
  });

  it('should be able to add a route with middleware', () => {
    const router = new Router('/');
    const middleFunc = () => {
      return 'test';
    };

    router.get('/test', [middleFunc], () => {
      return 'test';
    });

    expect(router.getRoutes.size).toBe(1);
  });

  it('a router + route should return data or an error', async () => {
    const router = new Router('/test');

    router.get('/test', [], () => {
      return {
        message: 'Ok',
        data: 'Test',
        status: 200,
      };
    });

    const ctx = {
      req: {
        method: 'GET',
        url: '/test/test',
        requestId: 'Test',
      },
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const result = await router.execute(ctx);

    expect(result).toBeDefined();
    expect(result).toStrictEqual({
      message: 'Ok',
      data: 'Test',
      status: 200,
    });
  });

  it('a router + route should handle trailing slashes', async () => {
    const router = new Router('/test');

    router.get('/test', [], () => {
      return {
        message: 'Ok',
        data: 'Test',
        status: 200,
      };
    });

    const ctx = {
      req: {
        method: 'GET',
        url: '/test/test/',
        requestId: 'Test',
      },
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const result = await router.execute(ctx);

    expect(result).toBeDefined();
    expect(result).toStrictEqual({
      message: 'Ok',
      data: 'Test',
      status: 200,
    });
  });

  it('should return from middleware if that middleware returns a value', async () => {
    const router = new Router('/test');

    router.use(() => {
      return {
        status: 200,
        message: 'Test',
      };
    });

    const ctx = {
      req: {
        method: 'GET',
        url: '/test',
      },
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const result = await router.execute(ctx);

    expect(result).toBeDefined();
    expect(result).toStrictEqual({
      status: 200,
      message: 'Test',
    });
  });

  it('should return params from a route', async () => {
    const router = new Router('/test');
    const id = 10;

    router.get('/:id', [], (ctx: ICtx) => {
      return {
        status: 200,
        message: 'Ok',
        data: ctx.req.params.id,
      };
    });

    const ctx = {
      req: {
        method: 'GET',
        url: `/test/${id}`,
        params: {},
        requestId: 'Test',
      },
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const result = await router.execute(ctx);

    expect(result).toBeDefined();
    expect(result).toStrictEqual({
      status: 200,
      message: 'Ok',
      data: '10',
    });
  });

  it('should return params from a nested route', async () => {
    const router = new Router('/test');
    const subRouter = new Router('/test2');
    const id = 10;

    subRouter.get('/:id', [], (ctx: ICtx) => {
      return {
        status: 200,
        message: 'Ok',
        data: +ctx.req.params.id,
      };
    });

    router.useRouter('/test2', subRouter);

    const ctx = {
      req: {
        method: 'GET',
        url: `/test/test2/${id}`,
        params: {},
        requestId: 'Test',
      },
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const result = await router.execute(ctx);

    expect(result).toBeDefined();
    expect(result).toStrictEqual({
      status: 200,
      message: 'Ok',
      data: 10,
    });
  });

  it('should return params in middle of route', async () => {
    const router = new Router('/test');
    const subRouter = new Router('/test2');
    const id = 10;

    subRouter.get('/:id/test', [], (ctx: ICtx) => {
      return {
        status: 200,
        message: 'Ok',
        data: +ctx.req.params.id,
      };
    });

    router.useRouter('/test2', subRouter);

    const ctx = {
      req: {
        method: 'GET',
        url: `/test/test2/${id}/test`,
        params: {},
        requestId: 'Test',
      },
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const result = await router.execute(ctx);

    expect(result).toBeDefined();
    expect(result).toStrictEqual({
      status: 200,
      message: 'Ok',
      data: 10,
    });
  });
});

describe('Errors', () => {
  describe('NotFoundError', () => {
    it('should return a 404 error', () => {
      const req: any = {};
      const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const error = new NotFoundError(req, res);

      expect(error).toBeInstanceOf(Error);
      expect(error.statusCode).toBe(404);
    });
  });

  describe('InternalServerError', () => {
    it('should return a 500 error', () => {
      const req: any = {};
      const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const error = new ServerError(req, res);

      expect(error).toBeInstanceOf(Error);
      expect(error.statusCode).toBe(500);
    });
  });
});

describe('Request', () => {
  it('should return a request object', () => {
    const req = Request({
      method: 'GET',
      url: '/test',
    } as any);

    expect(req).toBeDefined();
    expect(req.method).toBe('GET');
    expect(req.url).toBe('/test');
    expect(req.query).toEqual({});
    expect(req.body).toStrictEqual({});
    expect(req.requestId).toBeDefined();
  });

  it('should parse query params', () => {
    const req = Request({
      method: 'GET',
      url: '/test?test=1&test2=2',
    } as any);

    expect(req).toBeDefined();
    expect(req.method).toBe('GET');
    expect(req.url).toBe('/test');
    expect(req.query).toEqual({
      test: '1',
      test2: '2',
    });
    expect(req.body).toStrictEqual({});
    expect(req.requestId).toBeDefined();
  });

  it('should parse body params', () => {
    const req = Request(
      {
        method: 'GET',
        url: '/test',
      } as any,
      {
        test: 1,
        test2: 2,
      },
    );

    expect(req).toBeDefined();
    expect(req.method).toBe('GET');
    expect(req.url).toBe('/test');
    expect(req.query).toEqual({});
    expect(req.body).toStrictEqual({
      test: 1,
      test2: 2,
    });
    expect(req.requestId).toBeDefined();
  });

  it('should handle no url', () => {
    const req = Request(
      {
        method: 'GET',
      } as any,
      {
        test: 1,
        test2: 2,
      },
    );

    expect(req).toBeDefined();
    expect(req.method).toBe('GET');
    expect(req.url).toBe('/');
    expect(req.query).toEqual({});
    expect(req.body).toStrictEqual({
      test: 1,
      test2: 2,
    });
    expect(req.requestId).toBeDefined();
  });

  it('should even handle no method', () => {
    const req = Request({} as any, {
      test: 1,
      test2: 2,
    });

    expect(req).toBeDefined();
    expect(req.method).toBe('GET');
    expect(req.url).toBe('/');
    expect(req.query).toEqual({});
    expect(req.body).toStrictEqual({
      test: 1,
      test2: 2,
    });
    expect(req.requestId).toBeDefined();
  });
});

describe('Response', () => {
  it('should return a response object', () => {
    const res = new Response({} as any, {} as any);

    expect(res).toBeDefined();
    expect(res.header).toBeDefined();
    expect(res.status).toBeDefined();
    expect(res.send).toBeDefined();
    expect(res.json).toBeDefined();
  });

  it('should set a header', () => {
    const res = new Response(
      {} as any,
      {
        setHeader: jest.fn(),
      } as any,
    );

    res.header('test', 'test');

    expect(res.header('test', 'test')).toBe(res);
  });

  it('should set a status', () => {
    const res = new Response(
      {} as any,
      {
        setHeader: jest.fn(),
        writeHead: jest.fn(),
      } as any,
    );

    res.status(200);

    expect(res.status(200)).toBe(res);
  });

  it('should send a response', () => {
    const res = new Response(
      {} as any,
      {
        setHeader: jest.fn(),
        writeHead: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
      } as any,
    );

    res.send('test');

    expect(res.send('test'));
  });

  it('should send a json response', () => {
    const res = new Response(
      {} as any,
      {
        setHeader: jest.fn(),
        writeHead: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
      } as any,
    );

    res.json({ test: 'test' });

    expect(res.json({ test: 'test' })).toBe(res);
  });
});

describe('Route', () => {
  it('should return a route object', () => {
    const route = new Route('/test', 'GET', [], () => {
      return 'test';
    });

    expect(route).toBeDefined();
    expect(route.method).toBe('GET');
    expect(route.path).toBe('/test');
    expect(route.callback).toBeDefined();
  });

  it('should return a route object with a path param', () => {
    const route = new Route('/test/:id', 'GET', [], () => {
      return 'test';
    });

    expect(route).toBeDefined();
    expect(route.method).toBe('GET');
    expect(route.path).toBe('/test/:id');
    expect(route.callback).toBeDefined();
  });

  it('should handle middleware', async () => {
    const route = new Route(
      '/test',
      'GET',
      [
        (req: any, res: any, next: any) => {
          next();
        },
      ],
      () => {
        return 'test';
      },
    );

    expect(route).toBeDefined();
    expect(route.method).toBe('GET');
    expect(route.path).toBe('/test');
    expect(route.middleware.length).toBe(1);
    expect(route.callback).toBeDefined();

    const result = await route.execute({} as any);

    expect(result).toBe('test');
  });

  it('should handle returns from middleware', async () => {
    const route = new Route(
      '/test',
      'GET',
      [
        () => {
          return 'middleware test';
        },
      ],
      () => {
        return 'test';
      },
    );

    expect(route).toBeDefined();
    expect(route.method).toBe('GET');
    expect(route.path).toBe('/test');
    expect(route.middleware.length).toBe(1);
    expect(route.callback).toBeDefined();

    const result = await route.execute({} as any);

    expect(result).toBe('middleware test');
  });

  it('should handle errors in middleware', async () => {
    const route = new Route(
      '/test',
      'GET',
      [
        () => {
          throw new Error('test');
        },
      ],
      () => {
        return 'test';
      },
    );

    expect(route).toBeDefined();
    expect(route.method).toBe('GET');
    expect(route.path).toBe('/test');
    expect(route.middleware.length).toBe(1);
    expect(route.callback).toBeDefined();

    const result = await route.execute({
      req: {
        requestId: 'test',
      },
      res: {
        status: () => {
          return {
            json: jest.fn(),
          };
        },
        json: jest.fn(),
      },
    } as any);

    expect(result).toBeInstanceOf(Error);
  });

  it('should handle returns with ctx', async () => {
    const route = new Route(
      '/test',
      'GET',
      [
        (req: any, res: any, next: any) => {
          next();
        },
      ],
      (ctx: any) => {
        ctx.res.json({ test: 'test' });
      },
    );

    expect(route).toBeDefined();
    expect(route.method).toBe('GET');
    expect(route.path).toBe('/test');
    expect(route.middleware.length).toBe(1);
    expect(route.callback).toBeDefined();

    const result = await route.execute({
      req: {},
      res: {
        res: {
          statusCode: '',
        },
        json: jest.fn((data: any) => JSON.stringify(data)),
      },
    } as any);

    expect(result).toStrictEqual({
      alreadySent: true,
      status: '',
    });
  });

  it('should handle errors in route', async () => {
    const route = new Route('/test', 'GET', [], () => {
      throw new Error('test');
    });

    expect(route).toBeDefined();
    expect(route.method).toBe('GET');
    expect(route.path).toBe('/test');
    expect(route.middleware.length).toBe(0);
    expect(route.callback).toBeDefined();

    const result = await route.execute({
      req: {
        requestId: 'test',
      },
      res: {
        status: () => {
          return {
            json: jest.fn(),
          };
        },
        json: jest.fn(),
      },
      logger: {
        error: jest.fn(),
      },
    } as any);

    expect(result).toBeInstanceOf(Error);
  });
});
