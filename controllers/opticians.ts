const opticiansRouter = require('express').Router();
import { Request, Response } from 'express';
import IOptician from '../interfaces/IOptician';
import * as Auth from '../helpers/auth';

import * as Optician from '../models/optician';
import { ErrorHandler } from '../helpers/errors';

///////////// OPTICIAN ///////////////

opticiansRouter.get('/', (req: Request, res: Response) => {
  Optician.getAllOpticians().then((opticians: Array<IOptician>) => {
    res.status(200).json(opticians);
  });
});

opticiansRouter.get('/:id_optician', (req: Request, res: Response) => {
  const { id_optician } = req.params;
  res.status(200).send('get user for id_optician ' + id_optician);
});

opticiansRouter.post(
  '/',
  Optician.validateOptician,
  Optician.emailIsFree,
  (req: Request, res: Response) => {
    const optician: IOptician = req.body;
    Optician.addOptician(optician).then((newOptician) =>
      res.status(200).json(newOptician)
    );
  }
);

opticiansRouter.put(
  '/:id_optician',
  Auth.getCurrentSession,
  Optician.validateOptician,
  Optician.opticianExists,
  (req: Request, res: Response) => {
    const { id_optician } = req.params;
    const id = req.opticianInfo;
    Optician.updateOptician(
      Number(req.opticianInfo),
      req.body as IOptician
    ).then((updatedOptician) => {
      if (updatedOptician) {
        res.status(200).send('optician updated');
      } else {
        throw new ErrorHandler(500, 'Optician cannot be updated');
      }
    });
  }
);

opticiansRouter.delete('/:id_optician', (req: Request, res: Response) => {
  const { id_optician } = req.params;
  res.status(200).send('delete optician for id_optician ' + id_optician);
});

export default opticiansRouter;
