import request from 'supertest';

import server from '../app/config';

describe('API', () => {
  it('should start the server', async () => {
    await server.listen();
  });

  describe('Index', () => {
    it('should return 200 OK from GET /api', async () => {
      const res = await request('http://127.0.0.1:8000').get('/api');

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ message: 'Hello World' });
    });
  });

  describe('Body', () => {
    it('should return 200 OK from GET /api/body', async () => {
      const res = await request('http://127.0.0.1:8000').get('/api/body');

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ message: 'Hello Body' });
    });

    it('should return 201 Created from POST /api/body', async () => {
      const res = await request('http://127.0.0.1:8000')
        .post('/api/body')
        .send({ message: 'Hello Body' });

      expect(res.status).toEqual(201);
      expect(res.body).toEqual({ message: { message: 'Hello Body' } });
    });
  });

  describe('Errors', () => {
    it('should return 200 OK from GET /api/errors', async () => {
      const res = await request('http://127.0.0.1:8000').get('/api/errors');

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ message: 'Hello Errors' });
    });

    it('should return 404 Not Found from GET /api/errors/404', async () => {
      const res = await request('http://127.0.0.1:8000').get('/api/errors/404');

      expect(res.status).toEqual(404);
      expect(res.body).toEqual({ message: 'Not Found' });
    });

    it('should return 500 Internal Server Error from GET /api/errors/throw', async () => {
      const res = await request('http://127.0.0.1:8000').get(
        '/api/errors/throw',
      );

      expect(res.status).toEqual(500);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toEqual('Error Thrown');
      expect(res.body).toHaveProperty('status');
    });
  });

  describe('Methods', () => {
    it('should return 200 OK from GET /api/methods', async () => {
      const res = await request('http://127.0.0.1:8000').get('/api/methods');

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ message: 'Hello Methods' });
    });

    it('should return 201 Created from POST /api/methods', async () => {
      const res = await request('http://127.0.0.1:8000')
        .post('/api/methods')
        .send({ message: 'Hello Methods' });

      expect(res.status).toEqual(201);
      expect(res.body).toEqual({ message: { message: 'Hello Methods' } });
    });

    it('should return 200 OK from PUT /api/methods/:id', async () => {
      const res = await request('http://127.0.0.1:8000')
        .put('/api/methods/1')
        .send({ message: 'Hello Methods' });

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({
        message: {
          id: '1',
          body: { message: 'Hello Methods' },
        },
      });
    });

    it('should return 200 OK from PATCH /api/methods/:id', async () => {
      const res = await request('http://127.0.0.1:8000')
        .patch('/api/methods/1')
        .send({ message: 'Hello Methods' });

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({
        message: {
          id: '1',
          body: { message: 'Hello Methods' },
        },
      });
    });

    it('should return 200 OK from DELETE /api/methods/:id', async () => {
      const res = await request('http://127.0.0.1:8000').delete(
        '/api/methods/1',
      );

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({
        message: {
          id: '1',
        },
      });
    });
  });

  describe('Middleware', () => {
    it('should return 200 OK from GET /api/middleware', async () => {
      const res = await request('http://127.0.0.1:8000').get('/api/middleware');

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ message: 'Hello Middleware' });
    });

    it('should return 200 OK from GET /api/middleware/next', async () => {
      const res = await request('http://127.0.0.1:8000').get(
        '/api/middleware/next',
      );

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ message: 'Next Called' });
    });

    it('should return 200 OK from GET /api/middleware/return', async () => {
      const res = await request('http://127.0.0.1:8000').get(
        '/api/middleware/return',
      );

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ message: 'Returned from middleware' });
    });
  });

  describe('Params', () => {
    it('should return 200 OK from GET /api/params', async () => {
      const res = await request('http://127.0.0.1:8000').get('/api/params');

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ message: 'Hello Params' });
    });

    it('should return 200 OK from GET /api/params/:id', async () => {
      const res = await request('http://127.0.0.1:8000').get('/api/params/1');

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ message: { id: '1' } });
    });

    it('should return 200 OK from GET /api/params/:id/:name', async () => {
      const res = await request('http://127.0.0.1:8000').get(
        '/api/params/1/John',
      );

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ message: { id: '1', name: 'John' } });
    });
  });

  describe('Query', () => {
    it('should return 200 OK from GET /api/query', async () => {
      const res = await request('http://127.0.0.1:8000').get('/api/query');

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ message: 'Hello Query' });
    });

    it('should return 200 OK from GET /api/query/string?string=John', async () => {
      const res = await request('http://127.0.0.1:8000').get(
        '/api/query/string?string=John',
      );

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ message: 'John' });
    });
  });

  describe('404', () => {
    it('should return 404 Not Found from GET /api/404', async () => {
      const res = await request('http://127.0.0.1:8000').get('/api/404');

      expect(res.status).toEqual(404);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toEqual('Not Found');
      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toEqual(404);
    });

    it('should return 404 Not Found from GET /api/params/test/fail/this', async () => {
      const res = await request('http://127.0.0.1:8000').get(
        '/api/params/test/fail/this',
      );

      expect(res.status).toEqual(404);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toEqual('Not Found');
      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toEqual(404);
    });
  });

  it('should close the server', async () => {
    server.close();
  });
});
