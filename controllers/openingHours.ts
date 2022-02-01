import { NextFunction, Request, Response, Router } from 'express';
const openingHoursRouter = Router();
import IOpeningHour from '../interfaces/IOpeningHour';
import * as OpeningHour from '../models/openingHour';
import { ErrorHandler } from '../helpers/errors';
import { formatSortString } from '../helpers/functions';

openingHoursRouter.get(
  '/',
  (req: Request, res: Response, next: NextFunction) => {
    const sortBy: string = req.query.sort as string;
    OpeningHour.getAllOpeningHour(formatSortString(sortBy))
      .then((openingHours: Array<IOpeningHour>) => {
        res.setHeader(
          'Content-Range',
          `openingHours : 0-${openingHours.length}/${openingHours.length + 1}`
        );
        res.status(200).json(openingHours);
      })
      .catch((err) => next(err));
  }
);

openingHoursRouter.post(
  '/',
  OpeningHour.validateOpeningHour,
  (req: Request, res: Response) => {
    const openingHour = req.body as IOpeningHour;
    OpeningHour.addOpeningHours(openingHour)
      .then((newOpeningHour) => res.status(200).json(newOpeningHour))
      .catch((err) => {
        console.log(err);
        throw new ErrorHandler(500, 'Opening hours cannot be created');
      });
  }
);

openingHoursRouter.put(
  '/:id_opening_hour',
  OpeningHour.validateOpeningHour,
  OpeningHour.openingHourExists,
  (req: Request, res: Response) => {
    const { id_opening_hour } = req.params;
    OpeningHour.updateOpeningHour(
      Number(id_opening_hour),
      req.body as IOpeningHour
    )
      .then((updatedOpeningHour) => {
        if (updatedOpeningHour) {
          res.status(200).send('Opening hour updated');
        } else {
          throw new ErrorHandler(500, 'Opening hour cannot be updated');
        }
      })
      .catch((err) => {
        console.log(err);
        throw new ErrorHandler(500, 'Opening hour cannot be modified');
      });
  }
);

openingHoursRouter.delete(
  '/:id_opening_hour',
  (req: Request, res: Response) => {
    const { id_opening_hour } = req.params;
    OpeningHour.deleteOpeningHour(Number(id_opening_hour))
      .then((deletedOpeningHour) => {
        if (deletedOpeningHour) {
          res.status(200).send('Opening hour deleted');
        } else {
          res.status(401).send('No opening hour found');
        }
      })
      .catch((err) => {
        console.log(err);
        throw new ErrorHandler(
          500,
          'Opening hour cannot be deleted, something wrong happened'
        );
      });
  }
);

export default openingHoursRouter;
