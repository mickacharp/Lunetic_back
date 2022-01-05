import { Request, Response, Router } from 'express';
const daysRouter = Router();
import * as Day from '../models/day';

///////////// GET ALL ///////////////

daysRouter.get('/', (req: Request, res: Response) => {
  res.send('days');
});

///////////// GET ONE ///////////////

daysRouter.get('/:id_day', (req: Request, res: Response) => {
  Day.getById(Number(req.params.id_day)).then((day) => {
    res.status(200).send(day.name);
  });
});

export default daysRouter;
