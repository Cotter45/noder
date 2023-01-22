import { IncomingMessage, ServerResponse } from 'http';

import type { IRequest } from './types';

export class Response extends ServerResponse<IncomingMessage> {
  declare res: ServerResponse;
  declare req: IRequest;

  constructor(req: IRequest, res: ServerResponse) {
    super(req);
    this.res = res;
    this.req = req;
  }

  header(key: string, value: string) {
    this.res.setHeader(key, value);
    return this;
  }

  status(code: number) {
    this.res.statusCode = code;
    this.res.setHeader('request-id', this.req.requestId);
    return this;
  }

  send(data: any) {
    this.res.setHeader('content-type', 'text/plain');
    this.res.setHeader('request-id', this.req.requestId);
    this.res.write(data);
    this.res.end();
    return this;
  }

  json(data: any) {
    this.res.setHeader('content-type', 'application/json');
    this.res.setHeader('request-id', this.req.requestId);
    this.res.write(JSON.stringify(data));
    this.res.end();
    return this;
  }
}
