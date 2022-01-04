import * as express from 'express';
import IOpticianInfo from '../interfaces/IOpticianInfo';
import INewsInfo from '../interfaces/INewsInfo';

declare global {
  namespace Express {
    interface Request {
      opticianInfo?: IOpticianInfo;
    }
  }
}
