import { NextFunction, Request, Response, Router } from 'express';
const opticiansRouter = Router();
import IOptician from '../interfaces/IOptician';
import * as Auth from '../helpers/auth';
import * as Optician from '../models/optician';
import * as OpeningHour from '../models/openingHour';
import * as Order from '../models/order';
import { ErrorHandler } from '../helpers/errors';
import { formatSortString } from '../helpers/functions';

///////////// OPTICIAN ///////////////

opticiansRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  const sortBy: string = req.query.sort as string;
  Optician.getAllOpticians(formatSortString(sortBy))
    .then((opticians: Array<IOptician>) => {
      res.setHeader(
        'Content-Range',
        `opticians : 0-${opticians.length}/${opticians.length + 1}`
      );
      res.status(200).json(opticians);
    })
    .catch((err) => next(err));
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

opticiansRouter.get(
  '/:id_optician/openingHours',
  (req: Request, res: Response) => {
    const { id_optician } = req.params;
    OpeningHour.getByOptician(Number(id_optician))
      .then((openingHours) => {
        res.status(200).json(openingHours);
      })
      .catch((err) => {
        console.log(err);
        throw new ErrorHandler(500, 'Opening hours cannot be found');
      });
  }
);

opticiansRouter.get('/:id_optician/orders', (req: Request, res: Response) => {
  const { id_optician } = req.params;
  Order.getOrdersByOptician(Number(id_optician))
    .then((orders) => {
      res.status(200).json(orders);
    })
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'Orders cannot be found');
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
  Auth.checkSessionPrivileges,
  Optician.validateOptician,
  Optician.opticianExists,
  (req: Request, res: Response) => {
    const { id_optician } = req.params;
    Optician.updateOptician(Number(id_optician), req.body as IOptician)
      .then((updatedOptician) => {
        if (updatedOptician) {
          Optician.getById(Number(id_optician)).then(
            (optician) => res.status(200).send(optician) // react-admin needs this response
          );
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

export default opticiansRouter;
