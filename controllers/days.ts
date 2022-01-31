import { Request, Response, Router } from 'express';
const daysRouter = Router();
import * as Day from '../models/day';
import { ErrorHandler } from '../helpers/errors';

///////////// GET ALL ///////////////

daysRouter.get('/', (req: Request, res: Response) => {
  Day.getAllDays()
    .then((days) => res.status(200).json(days))
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'No days found');
    });
});

///////////// GET ONE ///////////////

daysRouter.get('/:id_day', (req: Request, res: Response) => {
  Day.getById(Number(req.params.id_day))
    .then((day) => {
      res.status(200).send(day.name);
    })
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'Day cannot be found');
    });
});

export default daysRouter;
