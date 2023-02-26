# NODER.JS

## What is Noder.js?
Noder.js is what I'm calling this github repo, you can call it whatever you'd like. This is a bit of a wrapper around a basic Node.js HTTP server. It works very similarly to Express.js but is much more lightweight and ever so slightly more opinionated. There are way to many to check, but so far it's worked with every Express middleware I've tried. It's also very easy to add your own middleware in the same style that Express.js uses.


***I would not recommend using this in production, it's just a fun little project I've been working on.*** Feel free to open PR's or use this project in any way that you see fit.

## Highlights

- Simple and easy to use
  - Works essentially the same as Express.js
- Lightweight
  - Only 2 dependencies
    - pino for logging
    - uuid for generating unique ids for each request
- Works with **MOST** Express.js middleware
  - I've tested it with a few different options, though I can't guarantee it will work with all of them
- Easy to add your own middleware
- FAST 
  - wrk -t4 -c300 -d30s http://localhost:8000/api
```typescript
    Running 30s test @ http://localhost:8000/api
    4 threads and 300 connections
    Thread Stats   Avg      Stdev     Max   +/- Stdev
      Latency    14.89ms    7.95ms  92.20ms   87.61%
      Req/Sec     5.27k     1.58k    8.89k    61.42%
    630321 requests in 30.05s, 150.28MB read
    Socket errors: connect 0, read 296, write 0, timeout 0
    Requests/sec:  20973.21
    Transfer/sec:      5.00MB
```

## Features
- Basic HTTP server
  - Handles OPTIONS, GET, POST, PUT, PATCH, DELETE
```typescript
  import { Server } from './lib';
  import { initConfig } from './config';
  import apiRouter from './routes';

  const config = initConfig();

  const server = new Server(config);

  server.use(apiRouter);
  server.listen();
```
- Basic routing
  - In the same style as Express.js
```typescript
  apiRouter.get('/', (ctx: ICtx) => {
    ctx.res.status(200).json({
      message: 'Hello World'
    });
  });
```
- One param per route
  - This could be expanded but is a personal preference to avoid complex routes
```typescript
  apiRouter.get('/:hello', (ctx: ICtx) => {
    return {
      message: `Hello ${ctx.req.params.hello}`
    };
  });
```
- Middleware
  - Works with most Express.js middleware, though I can't guarantee it will work with all of them. Middleware needs to either call next() or return to function properly.
```typescript
  apiRouter.use(() => {
    return {
      status: 418,
      message: "I'm a teapot"
    };
  });
```
- Logging
  - Uses pino for logging
```typescript
  apiRouter.get('/', (ctx: ICtx) => {
    ctx.logger.info('TEST');
    ctx.res.status(200).json({
      message: 'Hello World'
    });
  });
```
- Error handling
  - The framework should catch all errors and log them, but you can also add your own error handling inside the callbacks or middleware.
```typescript
  apiRouter.get('/', (ctx: ICtx) => {
    return new NotFoundError(ctx.req, ctx.res);
  });

  apiRouter.get('/', (ctx: ICtx) => {
    throw new Error('Something went wrong');
  });
```
- Static file serving
  - Uses 'public' dir by default but can be set to any dir inside the 'app' dir. The file names are traversed at run time and added to a Map for quick lookup and security.
```typescript
  server.staticDir('build'); // folder inside app dir
```
- Basic body parsing
  - Supports JSON
```typescript
  apiRouter.get('/', (ctx: ICtx) => {
    ctx.res.status(200).json(ctx.req.body); 
    // returns { "hello": "world" } if body is { "hello": "world" }
  });
```
- Basic query string parsing
  - Parses query strings into an object
```typescript
  apiRouter.get('/', (ctx: ICtx) => {
    ctx.res.status(200).json(ctx.req.query);
    /**
     * GET /api/test?hello=world
     * returns { "hello": "world" }
     */
  });
```


## How to use
However you'd like. The infrastructure is there to use it in a similar fashion to how I would. There are a few basic example routes inside the routes/index.ts. Feel free to reach out with any questions.

### Basic / Development
1. Clone the repo
2. Run `npm install`
3. Run `npm run dev`

### Production **(Not recommended)**
1. Clone the repo
2. Run `npm install`
3. Run `npm run build`
4. Run `npm run start`
- There is also a dockerfile included if you prefer containerization
  - docker-compose up --build -d
  - If you're using a windows machine just change line 11 of the dockerfile from npm ci to npm i 

## TODO
- [ ] Add more tests
- [ ] Add more documentation
- [ ] Test with more databases
- [ ] Test with more Express middlewares
