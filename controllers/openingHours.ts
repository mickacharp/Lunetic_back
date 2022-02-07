import { NextFunction, Request, Response, Router } from 'express';
const openingHoursRouter = Router();
import IOpeningHour from '../interfaces/IOpeningHour';
import * as Auth from '../helpers/auth';
import * as OpeningHour from '../models/openingHour';
import { ErrorHandler } from '../helpers/errors';
import { formatSortString } from '../helpers/functions';

///////////// GET ALL ///////////////

openingHoursRouter.get(
  '/',
  (req: Request, res: Response, next: NextFunction) => {
    const sortBy: string = req.query.sort as string;
    OpeningHour.getAllOpeningHour(formatSortString(sortBy))
      .then((openingHours: IOpeningHour[]) => {
        res.setHeader(
          'Content-Range',
          `openingHours : 0-${openingHours.length}/${openingHours.length + 1}`
        );
        res.status(200).json(openingHours);
      })
      .catch((err) => next(err));
  }
);

///////////// GET ONE ///////////////

openingHoursRouter.get(
  '/:id_opening_hour',
  (req: Request, res: Response, next: NextFunction) => {
    const { id_opening_hour } = req.params;
    OpeningHour.getById(Number(id_opening_hour))
      .then((openingHour) => {
        if (openingHour) {
          res.status(200).json(openingHour);
        } else {
          res.status(401).send('No opening hour found');
        }
      })
      .catch((err) => next(err));
  }
);

/////////////////// POST ///////////////////

openingHoursRouter.post(
  '/',
  Auth.getCurrentSession,
  Auth.checkSessionPrivileges,
  OpeningHour.validateOpeningHour,
  (req: Request, res: Response, next: NextFunction) => {
    const openingHour = req.body as IOpeningHour;
    OpeningHour.addOpeningHours(openingHour)
      .then((newOpeningHour) => {
        if (newOpeningHour) {
          res
            .status(201)
            .json({ id: newOpeningHour.id_opening_hour, ...newOpeningHour });
        } else {
          throw new ErrorHandler(500, 'Opening hour cannot be created');
        }
      })
      .catch((err) => next(err));
  }
);

/////////////////// UPDATE ///////////////////

openingHoursRouter.put(
  '/:id_opening_hour',
  Auth.getCurrentSession,
  Auth.checkSessionPrivileges,
  OpeningHour.validateOpeningHour,
  OpeningHour.openingHourExists,
  (req: Request, res: Response, next: NextFunction) => {
    const { id_opening_hour } = req.params;
    OpeningHour.updateOpeningHour(
      Number(id_opening_hour),
      req.body as IOpeningHour
    )
      .then((updatedOpeningHour) => {
        if (updatedOpeningHour) {
          OpeningHour.getById(Number(id_opening_hour)).then(
            (openingHour) => res.status(200).send(openingHour) // react-admin needs this response
          );
        } else {
          throw new ErrorHandler(500, 'Opening hour cannot be updated');
        }
      })
      .catch((err) => next(err));
  }
);

/////////////////// DELETE ///////////////////

openingHoursRouter.delete(
  '/:id_opening_hour',
  Auth.getCurrentSession,
  Auth.checkSessionPrivileges,
  OpeningHour.openingHourExists,
  (req: Request, res: Response, next: NextFunction) => {
    const { id_opening_hour } = req.params;
    OpeningHour.deleteOpeningHour(Number(id_opening_hour))
      .then((deletedOpeningHour) => {
        if (deletedOpeningHour) {
          res.status(200).send(req.record); // react-admin needs this response after a delete
        } else {
          throw new ErrorHandler(409, `Opening hour not found`);
        }
      })
      .catch((err) => next(err));
  }
);

export default openingHoursRouter;
