import { Request, Response, Router } from 'express';
const opticiansRouter = Router();
import IOptician from '../interfaces/IOptician';
import * as Auth from '../helpers/auth';
import * as Optician from '../models/optician';
import { ErrorHandler } from '../helpers/errors';
import { resolve } from 'path';
import { number } from 'joi';

///////////// OPTICIAN ///////////////

opticiansRouter.get('/', (req: Request, res: Response) => {
  Optician.getAllOpticians()
    .then((opticians: Array<IOptician>) => {
      res.status(200).json(opticians);
    })
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'Opticians cannot be found');
    });
});

opticiansRouter.get('/:id_optician', (req: Request, res: Response) => {
  const { id_optician } = req.params;
  Optician.getById(Number(id_optician))
    .then((optician) => {
      if (optician) {
        res.status(200).json(optician);
      } else {
        res.status(401).send('No optician found');
      }
    })
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'Optician cannot be found');
    });
});

opticiansRouter.post(
  '/',
  Optician.validateOptician,
  Optician.emailIsFree,
  (req: Request, res: Response) => {
    const optician = req.body as IOptician;
    Optician.addOptician(optician)
      .then((newOptician) => res.status(200).json(newOptician))
      .catch((err) => {
        console.log(err);
        throw new ErrorHandler(500, 'Optician cannot be created');
      });
  }
);

opticiansRouter.put(
  '/:id_optician',
  Auth.getCurrentSession,
  Optician.validateOptician,
  Optician.opticianExists,
  (req: Request, res: Response) => {
    req.opticianInfo &&
      Optician.updateOptician(req.opticianInfo.id, req.body as IOptician)
        .then((updatedOptician) => {
          if (updatedOptician) {
            res.status(200).send('optician updated');
          } else {
            throw new ErrorHandler(500, 'Optician cannot be updated');
          }
        })
        .catch((err) => {
          console.log(err);
          throw new ErrorHandler(500, 'Opticians cannot be modified');
        });
  }
);

opticiansRouter.delete('/:id_optician', (req: Request, res: Response) => {
  const { id_optician } = req.params;
  Optician.deleteOptician(Number(id_optician))
    .then((deletedOptician) => {
      if (deletedOptician) {
        res.status(200).send('delete optician for id_optician ' + id_optician);
      } else {
        res.status(401).send('No optician found');
      }
    })
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'Optician cannot be updated');
    });
});
// A gérer : la suppression d'un compte par l'admin

export default opticiansRouter;
