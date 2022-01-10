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
      .then(async (optician) => {
        if (!optician)
          throw new ErrorHandler(401, 'This optician does not exist');
        else {
          const passwordIsCorrect: boolean = await Optician.verifyPassword(
            password,
            optician.password
          );
          if (passwordIsCorrect) {
            const token: string = calculateToken(
              email,
              Number(optician.id_optician)
            );
            res.cookie('optician_token', token);
            res.json({
              id_optician: optician.id_optician,
            });
          } else throw new ErrorHandler(401, 'Invalid Credentials');
        }
      })
      .catch((err) => next(err));
  } catch (err) {
    next(err);
  }
});

export default authRouter;
