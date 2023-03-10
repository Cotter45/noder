import type { IRequest, ISetCookie } from './types';

export const Response = (req: IRequest, res: any) => {
  res.req = req;

  /**
   * Sets a response header.
   * @param key - string
   * @param value - string
   * @returns - res
   */
  res.header = (key: string, value: string) => {
    res.setHeader(key, value);
    return res;
  };

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
  res.cookie = ({ name, value, options }: ISetCookie) => {
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

    res.setHeader('Set-Cookie', cookieValue);
    return res;
  };

  /**
   * Clears a cookie.
   * @param key - string
   * @returns - res
   * @example
   * res.clearCookie('name');
   */
  res.clearCookie = (key: string) => {
    res.setHeader('Set-Cookie', [
      `${key}=; Path=/; HttpOnly=false; Secure=false; Max-Age=0; SameSite=false; SameParty=false; Priority=low`,
    ]);
    return res;
  };

  /**
   * Sets the status code.
   * @param code - number
   * @returns - res
   */
  res.status = (code: number) => {
    res.statusCode = code;
    res.setHeader('request-id', req.requestId);
    return res;
  };

  /**
   * Sends a text response.
   * @param data - string
   * @returns - res
   * @example
   * ctx.res.send('Hello World');
   */
  res.send = (data: any) => {
    res.setHeader('content-type', 'text/plain');
    res.setHeader('request-id', req.requestId);
    res.write(data);
    res.end();
    return res;
  };

  /**
   * Sends a json response.
   * @param data - object
   * @returns - res
   * @example
   * ctx.res.json({ message: 'Hello World' });
   */
  res.json = (data: any) => {
    res.setHeader('content-type', 'application/json');
    res.setHeader('request-id', req.requestId);
    res.write(JSON.stringify(data));
    res.end();
    return res;
  };
  return res;
};
