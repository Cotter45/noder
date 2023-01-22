import * as http from 'http';

export interface IRequest extends http.IncomingMessage {
  method: string;
  url: string;
  headers: NodeJS.Dict<string | string[]>;
  params: { [key: string]: string };
  query: any;
  body: any;
  requestId: string;
  cookies?: { [key: string]: string };
}

export interface IResponse extends http.ServerResponse {
  header: any;
  status: any;
  send: any;
  json: any;
  res: http.ServerResponse;
}

export interface INextFunction {
  (): void;
}

export interface ICtx {
  req: IRequest;
  res: IResponse;
  db: any;
  config: any;
  user?: any;
  logger?: any;
}
