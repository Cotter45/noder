import * as url from 'url';
import { v4 as uuidv4 } from 'uuid';

import type { IRequest } from './types';
import type { IncomingMessage } from 'http';

export const Request = (req: IncomingMessage, body?: any) => {
  let pathname: string;
  let query: any;

  if (req.url && req.url.includes('?')) {
    const parsedUrl = url.parse(req.url || '', true) || '';
    pathname = parsedUrl.pathname ? parsedUrl.pathname.split('?')[0] : '/';
    query = parsedUrl.query || {};
  } else {
    pathname = req.url || '/';
    query = {};
  }

  function parseCookies(str: string) {
    const rx = /([^;=\s]*)=([^;]*)/g;
    const obj: { [key: string]: string } = {};
    for (let m; (m = rx.exec(str)); ) obj[m[1]] = decodeURIComponent(m[2]);
    return obj;
  }

  return {
    ...req,
    method: req.method,
    url: pathname,
    headers: req.headers || {},
    query: query,
    body: body || {},
    requestId: uuidv4(),
    params: {},
    cookies: req.headers?.cookie ? parseCookies(req.headers.cookie) : {},
  } as IRequest;
};
