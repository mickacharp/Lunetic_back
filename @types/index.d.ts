import IOpticianInfo from '../interfaces/IOpticianInfo';

declare global {
  namespace Express {
    interface Request {
      opticianInfo?: IOpticianInfo;
    }
  }
}
