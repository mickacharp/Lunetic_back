import { NextFunction, Request, Response } from 'express';
import { ErrorHandler } from '../helpers/errors';
import IOpticianInfo from '../interfaces/IOpticianInfo';

import jwt from 'jsonwebtoken';
import 'dotenv/config';

const calculateToken = (opticianEmail = '', id_optician = 0, admin = 0) => {
  return jwt.sign(
    { email: opticianEmail, id: id_optician, admin: admin },
    process.env.PRIVATE_KEY as string
  );
};

interface ICookie {
  optician_token: string;
}

const getCurrentSession = (req: Request, res: Response, next: NextFunction) => {
  const myCookie = req.cookies as ICookie;
  if (!myCookie.optician_token && !req.headers.authorization) {
    next(new ErrorHandler(401, 'Unauthorized optician, please login'));
  } else {
    const token: string =
      myCookie.optician_token || req.headers.authorization || '';
    req.opticianInfo = jwt.verify(
      token,
      process.env.PRIVATE_KEY as string
    ) as IOpticianInfo;
    if (req.opticianInfo === undefined) {
      next(new ErrorHandler(401, 'Unauthorized optician, please login'));
    } else {
      next();
    }
  }
};

const checkSessionPrivileges = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.opticianInfo === undefined || req.opticianInfo.admin === 0) {
    next(new ErrorHandler(401, 'You must be admin to perform this action'));
  } else {
    next();
  }
};

export { calculateToken, getCurrentSession, checkSessionPrivileges };
