import { Router, NotFoundError, ServerError, Route } from '../lib';
import { Request } from '../lib/request';
import { Response } from '../lib/response';

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
  });

  it('should parse cookies', () => {
    const req = Request(
      {
        method: 'GET',
        url: '/test',
        headers: {
          cookie: 'test=1;test2=2',
        },
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
    expect(req.cookies).toEqual({
      test: '1',
      test2: '2',
    });
  });
});

describe('Response', () => {
  it('should return a response object', () => {
    const res = Response({} as any, {} as any);

    expect(res).toBeDefined();
    expect(res.header).toBeDefined();
    expect(res.status).toBeDefined();
    expect(res.send).toBeDefined();
    expect(res.json).toBeDefined();
  });

  it('should set a header', () => {
    const res = Response({} as any, { setHeader: jest.fn() } as any);

    res.header('test', 'test');

    expect(res.header('test', 'test')).toBe(res);
  });

  it('should set a cookie', () => {
    const res = Response({} as any, { setHeader: jest.fn() } as any);

    res.cookie({
      name: 'test',
      value: 'test',
      options: {
        Path: '/',
        HttpOnly: true,
        Secure: true,
        'Max-Age': 1000,
        SameSite: 'lax',
        SameParty: true,
      },
    });

    expect(
      res.header(
        'Set-Cookie',
        'test=test; Path=%2F; HttpOnly=true; Secure=true; Max-Age=1000; SameSite=lax; SameParty=true',
      ),
    ).toBe(res);

    res.cookie({
      name: 'test2',
      value: 'test2',
      options: {},
    });

    expect(
      res.header(
        'Set-Cookie',
        'test=test; Path=%2F; HttpOnly=true; Secure=true; Max-Age=1000; SameSite=lax; SameParty=true',
      ),
    ).toBe(res);
  });

  it('should clear a cookie', () => {
    const res = Response({} as any, { setHeader: jest.fn() } as any);

    res.clearCookie('test');

    expect(res.clearCookie).toBeDefined();
  });

  it('should set a status', () => {
    const res = Response(
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
    const res = Response(
      {} as any,
      {
        setHeader: jest.fn(),
        writeHead: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
      } as any,
    );

    expect(res.send('test'));
  });

  it('should send a json response', () => {
    const res = Response(
      {} as any,
      {
        setHeader: jest.fn(),
        writeHead: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
      } as any,
    );

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

    const result = await route.execute({
      res: {
        headerSent: false,
      },
    } as any);

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
      req: {},
      res: {
        status: () => {
          return {
            json: jest.fn(),
          };
        },
        json: jest.fn(),
      },
    } as any);

    expect(result.message).toBe('Internal Server Error.');
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
        headerSent: false,
        json: jest.fn((data: any) => JSON.stringify(data)),
      },
    } as any);

    expect(result).toBeUndefined();
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
      req: {},
      res: {
        status: () => {
          return {
            json: jest.fn(),
          };
        },
        headerSent: false,
        json: jest.fn(),
      },
      logger: {
        error: jest.fn(),
      },
    } as any);

    expect(result).toBeUndefined();
  });
});

describe('Router', () => {
  it('should be defined', () => {
    expect(Router).toBeDefined();
  });

  it('should be able to create a router', () => {
    const router = new Router('/');

    expect(router).toBeDefined();
  });

  describe('should be able to add routes', () => {
    describe('GET', () => {
      it('should be able to add a get route', () => {
        const router = new Router('/');
        router.get('/', () => {
          return 'test';
        });

        expect(router.getRoutes.size).toBe(1);
      });

      it('should be able to add a named get route without /', () => {
        const router = new Router('/');
        router.get('test', () => {
          return 'test';
        });

        expect(router.getRoutes.size).toBe(1);
      });

      it('should be able to add a named get route with /', () => {
        const router = new Router('/');
        router.get('/test', () => {
          return 'test';
        });

        expect(router.getRoutes.size).toBe(1);
      });

      it('should be able to execute a get route', async () => {
        const router = new Router('/');
        router.get('/', () => {
          return { test: 'test' };
        });

        expect(router.getRoutes.size).toBe(1);

        const req = {
          url: '/',
          method: 'GET',
        } as any;
        const res = {} as any;

        const result = await router.execute({ req, res } as any);
        expect(result).toEqual({ test: 'test' });
      });

      it('should return 404 if route does not exist', async () => {
        const router = new Router('/');
        router.get('/', () => {
          return { test: 'test' };
        });

        expect(router.getRoutes.size).toBe(1);

        const req = {
          url: '/test',
          method: 'GET',
        } as any;
        const res = {
          status: jest.fn(() => {
            return {
              json: jest.fn(),
            };
          }),
        } as any;

        const result = await router.execute({ req, res } as any);
        expect(result).toBeInstanceOf(Error);
      });

      it('should return 404 if route does not exist with params', async () => {
        const router = new Router('/');
        router.get('/:test', () => {
          return { test: 'test' };
        });

        expect(router.getRoutes.size).toBe(1);

        const req = {
          url: '/test/test',
          method: 'GET',
        } as any;
        const res = {
          status: jest.fn(() => {
            return {
              json: jest.fn(),
            };
          }),
        } as any;

        const result = await router.execute({ req, res } as any);
        expect(result).toBeInstanceOf(Error);
      });
    });

    describe('POST', () => {
      it('should be able to add a post route', () => {
        const router = new Router('/');
        router.post('/', () => {
          return 'test';
        });

        expect(router.postRoutes.size).toBe(1);
      });

      it('should be able to add a named post route without /', () => {
        const router = new Router('/');
        router.post('test', () => {
          return 'test';
        });

        expect(router.postRoutes.size).toBe(1);
      });

      it('should be able to add a named post route with /', () => {
        const router = new Router('/');
        router.post('/test', () => {
          return 'test';
        });

        expect(router.postRoutes.size).toBe(1);
      });
    });

    describe('PUT', () => {
      it('should be able to add a put route', () => {
        const router = new Router('/');
        router.put('/', () => {
          return 'test';
        });

        expect(router.putRoutes.size).toBe(1);
      });

      it('should be able to add a named put route without /', () => {
        const router = new Router('/');
        router.put('test', () => {
          return 'test';
        });

        expect(router.putRoutes.size).toBe(1);
      });

      it('should be able to add a named put route with /', () => {
        const router = new Router('/');
        router.put('/test', () => {
          return 'test';
        });

        expect(router.putRoutes.size).toBe(1);
      });
    });

    describe('PATCH', () => {
      it('should be able to add a patch route', () => {
        const router = new Router('/');
        router.patch('/', () => {
          return 'test';
        });

        expect(router.patchRoutes.size).toBe(1);
      });

      it('should be able to add a named patch route without /', () => {
        const router = new Router('/');
        router.patch('test', () => {
          return 'test';
        });

        expect(router.patchRoutes.size).toBe(1);
      });

      it('should be able to add a named patch route with /', () => {
        const router = new Router('/');
        router.patch('/test', () => {
          return 'test';
        });

        expect(router.patchRoutes.size).toBe(1);
      });
    });

    describe('DELETE', () => {
      it('should be able to add a delete route', () => {
        const router = new Router('/');
        router.delete('/', () => {
          return 'test';
        });

        expect(router.deleteRoutes.size).toBe(1);
      });

      it('should be able to add a named delete route without /', () => {
        const router = new Router('/');
        router.delete('test', () => {
          return 'test';
        });

        expect(router.deleteRoutes.size).toBe(1);
      });

      it('should be able to add a named delete route with /', () => {
        const router = new Router('/');
        router.delete('/test', () => {
          return 'test';
        });

        expect(router.deleteRoutes.size).toBe(1);
      });
    });
  });

  describe('Middleware', () => {
    it('should be able to add middleware', () => {
      const router = new Router('/');
      router.use(() => {
        return 'test';
      });

      expect(router.middleware.length).toBe(1);
    });

    it('should be able to add middleware to a route', () => {
      const router = new Router('/');
      const middleFunc = () => {
        return 'test';
      };

      router.get('/test', [middleFunc], () => {
        return 'test';
      });

      expect(router.getRoutes.size).toBe(1);
    });

    it('should return values from middleware', async () => {
      const router = new Router('/');
      const middleFunc = () => {
        return { test: 'test' };
      };

      router.use(middleFunc);
      expect(router.middleware.length).toBe(1);

      router.get('/test', () => {
        return 'FAIL';
      });

      expect(router.getRoutes.size).toBe(1);
      const route = router.getRoutes.get('/test');
      expect(route).toBeDefined();

      const req = { url: '/test', method: 'GET' } as any;
      const res = {
        json: () => {
          return 'test';
        },
      } as any;

      const result = await router.execute({ req, res } as any);
      expect(result).toEqual({ test: 'test' });
    });

    it('should handle errors in middleware', async () => {
      const router = new Router('/');
      const middleFunc = () => {
        throw new Error('test');
      };

      router.use(middleFunc);
      expect(router.middleware.length).toBe(1);

      router.get('/test', () => {
        return 'FAIL';
      });

      expect(router.getRoutes.size).toBe(1);
      const route = router.getRoutes.get('/test');
      expect(route).toBeDefined();

      const req = { url: '/test', method: 'GET' } as any;
      const res = {
        json: () => {
          return 'test';
        },
      } as any;

      const result = await router.execute({ req, res } as any);
      expect(result).toHaveProperty('status', 500);
    });
  });

  it('should be able to add a router', () => {
    const router = new Router('/');
    const subRouter = new Router('/test');
    router.useRouter(subRouter);

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
});
