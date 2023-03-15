import * as http from 'http';

export interface IRequest extends http.IncomingMessage {
  method: string;
  url: string;
  headers: NodeJS.Dict<string | string[]>;
  params: { [key: string]: string };
  query: { [key: string]: string };
  body: any;
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
  /**
   * Sets a response header.
   * @param key - string
   * @param value - string
   * @returns - res
   */
  header: (key: string, value: string) => IResponse;

  /**
   * Sets a cookie.
   * @param name - string
   * @param value - string
   * @param options - object
   * @returns - res
   * @example
   * res.cookie('name', 'value', {
   *  Path: '/',
   * HttpOnly: false,
   * Secure: false,
   * MaxAge: 0,
   * SameSite: false,
   * SameParty: false,
   * Priority: 'low',
   * });
   */
  cookie: (cookie: ISetCookie) => IResponse;

  /**
   * Clears a cookie.
   * @param key - string
   * @returns - res
   * @example
   * res.clearCookie('name');
   */
  clearCookie: (key: string) => IResponse;

  /**
   * Sets the status code.
   * @param code - number
   * @returns - res
   */
  status: (code: number) => IResponse;

  /**
   * Sends a text response.
   * @param data - string
   * @returns - res
   * @example
   * ctx.res.send('Hello World');
   */
  send: (data: any) => IResponse;

  /**
   * Sends a file. Must be relative to the static directory.
   * @param filename - string
   * @returns - res
   * @example
   * ctx.res.sendFile('index.html');
   */
  sendFile: (filename: string) => IResponse;

  /**
   * Sends a file for download. Must be relative to the static directory.
   * @param filename - string
   * @returns - res
   * @example
   * ctx.res.download('index.html');
   */
  download: (filename: string) => IResponse;

  /**
   * Redirects to a url.
   * @param url - string
   * @returns - res
   * @example
   * ctx.res.redirect('https://example.com');
   */
  redirect: (url: string) => IResponse;

  /**
   * Sends a json response.
   * @param data - object
   * @returns - res
   * @example
   * ctx.res.json({ message: 'Hello World' });
   */
  json: (data: any) => IResponse;
  res: http.ServerResponse;
}

/**
 * The next function, advances to the next middleware function.
 * @returns - void
 */
export interface INextFunction {
  (): void;
}

/**
 * The context object created for each request.
 * @attr req - IRequest - The request object.
 * @attr res - IResponse - The response object.
 * @attr config - object - The config object.
 * @attr logger - object - The logger object (optional).
 * @attr _key - any - Any additional properties.
 */
export interface ICtx {
  /**
   * The request object.
   * @attr method - string - The request method.
   * @attr url - string - The request url.
   * @attr headers - object - The request headers.
   * @attr attrs - object - The request attrs.
   * @attr query - object - The request query.
   * @attr body - object - The request body.
   * @attr cookies - object - The request cookies.
   */
  req: IRequest;

  /**
   * The response object.
   * @attr req - IRequest - The request object.
   * @attr res - http.ServerResponse - The response object.
   * @attr header - function - Sets a response header.
   * @attr cookie - function - Sets a cookie.
   * @attr clearCookie - function - Clears a cookie.
   * @attr status - function - Sets the status code.
   * @attr send - function - Sends a text response.
   * @attr json - function - Sends a json response.
   */
  res: IResponse;
  config: any;
  logger?: any;
  [key: string]: any;
}
