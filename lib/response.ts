import { ServerResponse } from 'http';

import type { IRequest, ISetCookie } from './types';

export class Response extends ServerResponse {
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

  cookie({ name, value, options }: ISetCookie) {
    if (!options.Path) {
      options.Path = '/';
    }

    const formatObj: { [key: string]: any } = {
      [name]: value,
      ...options,
    };

    const cookieValue = Object.entries(formatObj)
      .map(([k, v]) => k + '=' + encodeURIComponent(v))
      .join('; ');

    this.res.setHeader('Set-Cookie', cookieValue);
    return this;
  }

  clearCookie(key: string) {
    this.res.setHeader('Set-Cookie', [
      `${key}=; Path=/; HttpOnly=false; Secure=false; Max-Age=0; SameSite=false; SameParty=false; Priority=low`,
    ]);
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
