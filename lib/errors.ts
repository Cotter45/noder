import type { IRequest, IResponse } from './types';

export class ServerError extends Error {
  statusCode: number;
  message: string;
  request: IRequest;

  constructor(request: IRequest, res: IResponse, message?: string) {
    super();
    this.statusCode = 500;
    this.message = message || 'Internal Server Error';
    this.request = request;

    res.status(500).json({
      status: 500,
      message: this.message,
      requestId: this.request.requestId,
    });
  }
}

export class NotFoundError extends Error {
  statusCode: number;
  message: string;
  request: IRequest;

  constructor(request: IRequest, res: IResponse, message?: string) {
    super();
    this.statusCode = 404;
    this.message = message || 'Not Found';
    this.request = request;

    res.status(404).json({
      status: 404,
      message: this.message,
      requestId: this.request.requestId,
    });
  }
}
