import { NextFunction, Request, Response, Router } from 'express';
const opticiansRouter = Router();
import IOptician from '../interfaces/IOptician';
import * as Auth from '../helpers/auth';
import * as Optician from '../models/optician';
import * as OpeningHour from '../models/openingHour';
import * as Order from '../models/order';
import * as Wishlist from '../models/wishlist';
import { ErrorHandler } from '../helpers/errors';
import { formatSortString } from '../helpers/functions';

///////////// OPTICIAN ///////////////

opticiansRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  const sortBy: string = req.query.sort as string;
  Optician.getAllOpticians(formatSortString(sortBy))
    .then((opticians: IOptician[]) => {
      res.setHeader(
        'Content-Range',
        `opticians : 0-${opticians.length}/${opticians.length + 1}`
      );
      res.status(200).json(opticians);
    })
    .catch((err) => next(err));
});

opticiansRouter.get(
  '/:id_optician',
  (req: Request, res: Response, next: NextFunction) => {
    const { id_optician } = req.params;
    Optician.getById(Number(id_optician))
      .then((optician) => {
        if (optician) {
          res.status(200).json(optician);
        } else {
          res.status(401).send('No optician found');
        }
      })
      .catch((err) => next(err));
  }
);

// Get all opening hours of one specific optician
opticiansRouter.get(
  '/:id_optician/openingHours',
  (req: Request, res: Response, next: NextFunction) => {
    const { id_optician } = req.params;
    OpeningHour.getByOptician(Number(id_optician))
      .then((openingHours) => {
        res.status(200).json(openingHours);
      })
      .catch((err) => next(err));
  }
);

// Get all orders of one specific optician
opticiansRouter.get(
  '/:id_optician/orders',
  (req: Request, res: Response, next: NextFunction) => {
    const { id_optician } = req.params;
    Order.getOrdersByOptician(Number(id_optician))
      .then((orders) => {
        res.status(200).json(orders);
      })
      .catch((err) => next(err));
  }
);

// Get all wishlists of one specific optician
opticiansRouter.get(
  '/:id_optician/wishlists',
  (req: Request, res: Response, next: NextFunction) => {
    const { id_optician } = req.params;
    Wishlist.getWishlistsByOptician(Number(id_optician))
      .then((wishlists) => {
        if (wishlists) {
          res.status(200).json(wishlists);
        } else {
          res
            .status(401)
            .send(
              `Wishlists belonging to optician ${id_optician} can't be found`
            );
        }
      })
      .catch((err) => next(err));
  }
);

opticiansRouter.post(
  '/',
  Auth.getCurrentSession,
  Auth.checkSessionPrivileges,
  Optician.validateOptician,
  Optician.emailIsFree,
  (req: Request, res: Response, next: NextFunction) => {
    const optician = req.body as IOptician;
    Optician.addOptician(optician)
      .then((newOptician) => {
        if (newOptician) {
          res.status(201).json({ id: newOptician.id_optician, ...newOptician });
        } else {
          throw new ErrorHandler(500, 'Optician cannot be created');
        }
      })
      .catch((err) => next(err));
  }
);

opticiansRouter.put(
  '/:id_optician',
  Auth.getCurrentSession,
  Optician.validateOptician,
  Optician.opticianExists,
  (req: Request, res: Response, next: NextFunction) => {
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
      .catch((err) => next(err));
  }
);

opticiansRouter.delete(
  '/:id_optician',
  Auth.getCurrentSession,
  Auth.checkSessionPrivileges,
  Optician.opticianExists,
  (req: Request, res: Response, next: NextFunction) => {
    const { id_optician } = req.params;
    Optician.deleteOptician(Number(id_optician))
      .then((deletedOptician) => {
        if (deletedOptician) {
          res.status(200).send(req.record); // react-admin needs this response after a delete
        } else {
          throw new ErrorHandler(409, `Optician not found`);
        }
      })
      .catch((err) => next(err));
  }
);

export default opticiansRouter;
