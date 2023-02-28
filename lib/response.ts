import type { IRequest, ISetCookie } from './types';

export const Response = (req: IRequest, res: any) => {
  res.req = req;
  res.header = (key: string, value: string) => {
    res.setHeader(key, value);
    return res;
  };
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
  res.clearCookie = (key: string) => {
    res.setHeader('Set-Cookie', [
      `${key}=; Path=/; HttpOnly=false; Secure=false; Max-Age=0; SameSite=false; SameParty=false; Priority=low`,
    ]);
    return res;
  };
  res.status = (code: number) => {
    res.statusCode = code;
    res.setHeader('request-id', req.requestId);
    return res;
  };
  res.send = (data: any) => {
    res.setHeader('content-type', 'text/plain');
    res.setHeader('request-id', req.requestId);
    res.write(data);
    res.end();
    return res;
  };
  res.json = (data: any) => {
    res.setHeader('content-type', 'application/json');
    res.setHeader('request-id', req.requestId);
    res.write(JSON.stringify(data));
    res.end();
    return res;
  };
  return res;
};
