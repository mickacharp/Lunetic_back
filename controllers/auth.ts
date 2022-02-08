import { Request, Response, NextFunction, Router } from 'express';
import * as Optician from '../models/optician';
import IOptician from '../interfaces/IOptician';
import { ErrorHandler } from '../helpers/errors';
import { calculateToken } from '../helpers/auth';

const authRouter = Router();

authRouter.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as IOptician;
    Optician.getByEmail(email)
      .then((optician) => {
        if (!optician) {
          throw new ErrorHandler(401, 'This optician does not exist');
        } else {
          Optician.verifyPassword(password, optician.password)
            .then((passwordIsCorrect: boolean) => {
              if (passwordIsCorrect) {
                const token: string = calculateToken(
                  email,
                  Number(optician.id_optician),
                  optician.admin
                );
                res.cookie('optician_token', token, {
                  expires: new Date(new Date().getTime() + 3600 * 1000),
                  httpOnly: true,
                });
                res.json({
                  id_optician: optician.id_optician,
                  admin: optician.admin as number,
                  token: token,
                });
              } else throw new ErrorHandler(401, 'Invalid Credentials');
            })
            .catch((err) => next(err));
        }
      })
      .catch((err) => next(err));
  } catch (err) {
    next(err);
  }
});

export default authRouter;
