import * as path from 'path';
import * as fs from 'fs';

import { mimeTypes } from './mimeTypes';

import type { IRequest, ISetCookie } from './types';

export const Response = (
  req: IRequest,
  res: any,
  files?: { [key: string]: string },
) => {
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
    return res;
  };

  /**
   * Sends a file. Must be relative to the static directory.
   * @param filename - string
   * @returns - res
   * @example
   * ctx.res.sendFile('index.html');
   */
  res.sendFile = (filename: string) => {
    if (!files) {
      throw new Error('Files not found.');
    }

    if (!filename.startsWith('/')) {
      filename = '/' + filename;
    }

    const file = files[filename];

    if (!file) {
      throw new Error('File not found.');
    }

    const ext = path.extname(filename);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(file).pipe(res);
    return res;
  };

  /**
   * Sends a file for download. Must be relative to the static directory.
   * @param filename - string
   * @returns - res
   * @example
   * ctx.res.download('index.html');
   */
  res.download = (filename: string) => {
    if (!files) {
      throw new Error('Files not found.');
    }

    if (!filename.startsWith('/')) {
      filename = '/' + filename;
    }

    const file = files[filename];

    if (!file) {
      throw new Error('File not found.');
    }

    const ext = path.extname(filename);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename=${filename}`,
    });
    fs.createReadStream(file).pipe(res);
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
    res.write(data);
    res.end();
    return res;
  };

  /**
   * Redirects to a url.
   * @param url - string
   * @returns - res
   * @example
   * ctx.res.redirect('https://example.com');
   */
  res.redirect = (url: string) => {
    res.statusCode = 302;
    const host = req.headers.host;

    if (url.startsWith('/')) {
      url = `http://${host}${url}`;
    }
    res.setHeader('Location', url);
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
    res.write(JSON.stringify(data));
    res.end();
    return res;
  };
  return res;
};
