import { NextFunction, Request, Response, Router } from 'express';
const templesRouter = Router();
import ITemple from '../interfaces/ITemple';
import * as Auth from '../helpers/auth';
import * as Temple from '../models/temple';
import { ErrorHandler } from '../helpers/errors';
import { formatSortString } from '../helpers/functions';

///////////// GET ALL ///////////////

templesRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  const sortBy: string = req.query.sort as string;
  Temple.getAllTemples(formatSortString(sortBy))
    .then((temples: ITemple[]) => {
      res.setHeader(
        'Content-Range',
        `temples : 0-${temples.length}/${temples.length + 1}`
      );
      res.status(200).json(temples);
    })
    .catch((err) => next(err));
});

///////////// GET ONE ///////////////

templesRouter.get(
  '/:id_temple',
  (req: Request, res: Response, next: NextFunction) => {
    const { id_temple } = req.params;
    Temple.getTempleById(Number(id_temple))
      .then((temple) => {
        if (temple) {
          res.status(200).json(temple);
        } else {
          res.status(401).send('No temple found');
        }
      })
      .catch((err) => next(err));
  }
);

/////////////////// POST ///////////////////

templesRouter.post(
  '/',
  Auth.getCurrentSession,
  Auth.checkSessionPrivileges,
  Temple.validateTemple,
  (req: Request, res: Response, next: NextFunction) => {
    const temple = req.body as ITemple;
    Temple.addTemple(temple)
      .then((newTemple) => {
        if (newTemple) {
          res.status(201).json({ id: newTemple.id_temple, ...newTemple });
        } else {
          throw new ErrorHandler(500, 'Temple cannot be created');
        }
      })
      .catch((err) => next(err));
  }
);

/////////////////// UPDATE ///////////////////

templesRouter.put(
  '/:id_temple',
  Auth.getCurrentSession,
  Auth.checkSessionPrivileges,
  Temple.validateTemple,
  Temple.templeExists,
  (req: Request, res: Response, next: NextFunction) => {
    const { id_temple } = req.params;
    Temple.updateTemple(Number(id_temple), req.body as ITemple)
      .then((updatedTemple) => {
        if (updatedTemple) {
          Temple.getTempleById(Number(id_temple)).then(
            (temple) => res.status(200).send(temple) // react-admin needs this response
          );
        } else {
          throw new ErrorHandler(500, 'Temple cannot be updated');
        }
      })
      .catch((err) => next(err));
  }
);

/////////////////// DELETE ///////////////////

templesRouter.delete(
  '/:id_temple',
  Auth.getCurrentSession,
  Auth.checkSessionPrivileges,
  Temple.templeExists,
  (req: Request, res: Response, next: NextFunction) => {
    const { id_temple } = req.params;
    Temple.deleteTemple(Number(id_temple))
      .then((deletedTemple) => {
        if (deletedTemple) {
          res.status(200).send(req.record); // react-admin needs this response after a delete
        } else {
          throw new ErrorHandler(409, `Temple not found`);
        }
      })
      .catch((err) => next(err));
  }
);

export default templesRouter;
