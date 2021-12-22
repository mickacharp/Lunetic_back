import { Request, Response, NextFunction } from 'express';
const authRouter = require('express').Router();
import * as Optician from '../models/optician';
import IOptician from '../interfaces/IOptician';
import { ErrorHandler } from '../helpers/errors';

import { calculateToken } from '../helpers/auth';

authRouter.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const optician: IOptician = await Optician.getByEmail(email);
      if (!optician) throw new ErrorHandler(401, 'This optician does not exist');
      else {
        const passwordIsCorrect: boolean = await Optician.verifyPassword(
          password,
          optician.password
        );
        if (passwordIsCorrect) {
          const token = calculateToken(email, Number(optician.id_optician));
          res.cookie('optician_token', token);
          res.send();
        } else throw new ErrorHandler(401, 'Invalid Credentials');
      }
    } catch (err) {
      next(err);
    }
  }
);

export default authRouter;
