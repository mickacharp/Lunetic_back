import { NextFunction, Request, Response, Router } from 'express';
const daysRouter = Router();
import IDay from '../interfaces/IDay';
import * as Day from '../models/day';

///////////// GET ALL ///////////////

daysRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  Day.getAllDays()
    .then((days: IDay[]) => {
      res.setHeader(
        'Content-Range',
        `models : 0-${days.length}/${days.length + 1}`
      );
      res.status(200).json(days);
    })
    .catch((err) => next(err));
});

///////////// GET ONE ///////////////

daysRouter.get(
  '/:id_day',
  (req: Request, res: Response, next: NextFunction) => {
    Day.getById(Number(req.params.id_day))
      .then((day) => {
        if (day) {
          res.status(200).json(day);
        } else {
          res.status(401).send('No day found');
        }
      })
      .catch((err) => next(err));
  }
);

export default daysRouter;
