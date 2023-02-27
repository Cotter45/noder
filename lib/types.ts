import * as http from 'http';

export interface IRequest extends http.IncomingMessage {
  method: string;
  url: string;
  headers: NodeJS.Dict<string | string[]>;
  params: { [key: string]: string };
  query: { [key: string]: string };
  body: { [key: string]: string };
  requestId: string;
  cookies?: { [key: string]: string };
}

export interface ISetCookie {
  name: string;
  value: string;
  options: {
    Path?: string;
    HttpOnly?: boolean;
    Secure?: boolean;
    'Max-Age'?: number;
    SameSite?: 'strict' | 'lax' | 'none';
    SameParty?: boolean;
    Priority?: 'low' | 'medium' | 'high';
  };
}

export interface IResponse extends http.ServerResponse {
  header: (key: string, value: string) => IResponse;
  cookie: (cookie: ISetCookie) => IResponse;
  clearCookie: (key: string) => IResponse;
  status: (code: number) => IResponse;
  send: (data: any) => IResponse;
  json: (data: any) => IResponse;
  res: http.ServerResponse;
}

export interface INextFunction {
  (): void;
}

export interface ICtx {
  req: IRequest;
  res: IResponse;
  config: any;
  logger: any;
  [key: string]: any;
}
