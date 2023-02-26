import type { IRequest, IResponse } from './types';

export async function executeMiddleware(
  middleware: any[],
  req: IRequest,
  res: IResponse,
): Promise<any> {
  function* middlewareGenerator(middleware: any[]) {
    for (const func of middleware) {
      yield func;
    }
  }

  const middlewareIterator = middlewareGenerator(middleware);
  let result: any;

  const next = async () => {
    const nextFunc = middlewareIterator.next();
    if (!nextFunc.value) return false;
    const response = await nextFunc.value(req, res, next);
    if (response) result = response;
    return result;
  };

  try {
    const response = await next();
    if (response) {
      return response;
    }
    return false;
  } catch (e: any) {
    return {
      status: 500,
      message: 'Internal Server Error.',
      errorMessage: e.message,
    };
  }
}
