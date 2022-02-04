import { Request, Response } from 'express';
import 'dotenv/config';

class ErrorHandler extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

const handleError = (
  err: ErrorHandler,
  req: Request,
  res: Response
) => {
  // manages environnement PROD/DEV
  const { statusCode = 500, message } = err;
  // Displays message only in environment DEV
  if (process.env.NODE_ENV === 'DEV') {
    res.status(statusCode).json({
      status: 'error',
      statusCode,
      message: message,
    });
  } else {
    res.status(statusCode).json({
      status: 'error',
      statusCode,
    });
  }
};

export { ErrorHandler, handleError };
