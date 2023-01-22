import * as url from 'url';
import { v4 as uuidv4 } from 'uuid';

import type { IRequest } from './types';
import type { IncomingMessage } from 'http';

export const Request = (req: IncomingMessage, body?: any) => {
  const parsedUrl = url.parse(req.url || '', true) || '';

  return {
    ...req,
    method: req.method || '',
    url: req.url ? parsedUrl.pathname || '' : '',
    headers: req.headers || {},
    query: parsedUrl.query ? parsedUrl.query : {},
    body: body || {},
    requestId: uuidv4(),
    params: {},
    cookies: {},
  } as IRequest;
};
