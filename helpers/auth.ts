import { NextFunction, Request, Response } from 'express';
import { ErrorHandler } from '../helpers/errors';

const jwt = require('jsonwebtoken');
require('dotenv').config();

const calculateToken = (opticianEmail = '', id_optician = 0) => {
  return jwt.sign(
    { email: opticianEmail, id: id_optician },
    process.env.PRIVATE_KEY
  );
};

const getCurrentSession = (req: Request, res: Response, next: NextFunction) => {
  if (!req.cookies.optician_token) {
    next(new ErrorHandler(401, 'Unauthorized optician, please login'));
  }
  const opticianInfo = jwt.verify(req.cookies.optician_token, process.env.PRIVATE_KEY);
  if (opticianInfo === undefined) {
    next(new ErrorHandler(401, 'Unauthorized optician, please login'));
  } else {
    req.opticianInfo = opticianInfo.id
    next();
  }

};

const checkSessionPrivileges = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.opticianInfo === undefined) {
    next(new ErrorHandler(401, 'You must be admin to perform this action'));
  } else {
    next();
  }
};

export { calculateToken, getCurrentSession, checkSessionPrivileges };
