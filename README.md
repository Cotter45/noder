# NODER.JS

## What is Noder.js?
Noder.js is what I'm calling this github repo, you can call it whatever you'd like. This is a bit of a wrapper around a basic Node.js HTTP server. It works very similarly to Express.js but is much more lightweight and ever so slightly more opinionated. There are way to many to check, but so far it's worked with every Express middleware I've tried. It's also very easy to add your own middleware in the same style that Express.js uses.

***I would not recommend using this in production, it's just a fun little project I've been working on.*** Feel free to open PR's or use this project in any way that you see fit.

## NPM
- ```npm i @cotter45/noderjs```
- https://www.npmjs.com/package/@cotter45/noderjs

## Highlights

- Simple and easy to use
  - Works essentially the same as Express.js
  - Some notable differences
    - routes can only be added to Router objects, not the Server object. The Server object only has the use() method for adding middleware and useRouter() for adding routers.
    - Routes do not accept req, res, next as arguments. This app uses ctx: ICtx instead, which is an object containing req, res, logger (optional with boolean flag in config obj), config and whatever else you want to add to it through config.ctx when config object is passed to the server constructor.
- Lightweight
  - Only 2 dependencies
    - pino for logging
    - uuid for generating unique ids for each request
- Works with **MOST** Express.js middleware
  - I've tested it with a few different options, though I can't guarantee it will work with all of them
- Easy to add your own middleware
- Small script included in the github repo to generate boilerplate controllers, handlers, tests and validators for a resource
  - THIS WILL ONLY WORK WITH THE GITHUB TEMPLATE, NOT THE NPM PACKAGE
  - run with
    - ```npm run generate```
  - The script will prompt you for the name of the resource
  - It will then create all folders and files for basic CRUD inside the routes dir
  - It will NOT automagically add this new router / resource to the main router
- FAST 
  - Using wrk for testing
```typescript
wrk -t4 -c300 -d30s http://localhost:8000/api
  4 threads and 300 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     9.06ms    3.29ms 107.33ms   95.77%
    Req/Sec     8.46k     0.94k    9.32k    90.58%

  1010664 requests in 30.02s, 240.96MB read
  Socket errors: connect 0, read 0, write 0, timeout 0

  Requests/sec:  33666.23
  Transfer/sec:      8.03MB
```
  - using autocannon with fastify's benchmark settings
```typescript
autocannon -c 100 -d 40 -p 10 http://127.0.0.1:8000/api
  Running 40s test @ http://127.0.0.1:8000/api
  100 connections with 10 pipelining factor


  ┌─────────┬──────┬───────┬───────┬───────┬──────────┬─────────┬────────┐
  │ Stat    │ 2.5% │ 50%   │ 97.5% │ 99%   │ Avg      │ Stdev   │ Max    │
  ├─────────┼──────┼───────┼───────┼───────┼──────────┼─────────┼────────┤
  │ Latency │ 9 ms │ 22 ms │ 33 ms │ 51 ms │ 19.34 ms │ 7.71 ms │ 112 ms │
  └─────────┴──────┴───────┴───────┴───────┴──────────┴─────────┴────────┘
  ┌───────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
  │ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg     │ Stdev   │ Min     │
  ├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
  │ Req/Sec   │ 39039   │ 39039   │ 50719   │ 53247   │ 50415.2 │ 2371.18 │ 39035   │
  ├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
  │ Bytes/Sec │ 9.76 MB │ 9.76 MB │ 12.7 MB │ 13.3 MB │ 12.6 MB │ 592 kB  │ 9.76 MB │
  └───────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘

  Req/Bytes counts sampled once per second.
  # of samples: 40

  2018k requests in 40.02s, 504 MB read
```

## Features
- Basic HTTP server
  - Handles OPTIONS, HEAD, GET, POST, PUT, PATCH, DELETE
```typescript
  import { Server, Router } from '@cotter45/noderjs';

  const server = new Server();
  const apiRouter = new Router('/api');

  apiRouter.get('/', (ctx: ICtx) => {
    ctx.res.status(200).json({
      message: 'Hello World'
    });
  });

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
- Params parsed from routes
  - The normal 'gotchas' apply, but it should work as expected
```typescript
  apiRouter.get('/:hello', (ctx: ICtx) => {
    return {
      message: `Hello ${ctx.req.params.hello}`
    };
  });
```
- Middleware
  - Works with most Express.js middleware, though I can't guarantee it will work with all of them. Middleware takes in the req, res, next arguments.
```typescript
  apiRouter.use(() => {
    return {
      status: 418,
      message: "I'm a teapot"
    };
  });
```
- Logging 
  - This is OFF by default, turn it on with - ```new Server({ logger: true })```
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
    try {
      throw new Error('Something went wrong');
    } catch (err) {
      ctx.logger.error(err);
      ctx.res.status(500).json({
        message: 'Something went wrong'
      });
    }
  });

  OR

  apiRouter.get('/', (ctx: ICtx) => {
    throw new Error('Something went wrong');
  });
```
- Static file serving
  - This is OFF by default, turn it on with - ```new Server({ fileServer: true })```
  - Uses 'public' dir by default but can be set to any dir inside the 'app' dir in dev, if you're using typescript or docker you will have to ensure it transfers to the correct 'dist' or 'app' dir. The file names are traversed at run time and added to a Map for quick lookup and security, so updates to the files will be reflected in the server upon a restart.
```typescript
  server.staticDir('build'); // folder inside app dir
```
- Basic body parsing
  - Only supports JSON so far
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

There is also a dockerfile included if you prefer containerization
  - docker-compose up --build -d
  - If you're having issues with npm ci, try npm install
  - If you're having issues with static files, make sure they are getting copied into the 'app' dir of your container

## TODO
- [ ] Convert the generate script to work from node_modules when packaged
- [ ] Add more tests
- [ ] Add more documentation / documentation site ?
- [ ] Test with more databases
- [ ] Test with more Express middlewares
- [ ] Body parsing for more content types
