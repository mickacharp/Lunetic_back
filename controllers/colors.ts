import { NextFunction, Request, Response, Router } from 'express';
const colorsRouter = Router();
import IColor from '../interfaces/IColor';
import * as Auth from '../helpers/auth';
import * as Color from '../models/color';
import { ErrorHandler } from '../helpers/errors';
import { formatSortString } from '../helpers/functions';

///////////// GET ALL ///////////////

colorsRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  const sortBy: string = req.query.sort as string;
  Color.getAllColors(formatSortString(sortBy))
    .then((colors: IColor[]) => {
      res.setHeader(
        'Content-Range',
        `colors : 0-${colors.length}/${colors.length + 1}`
      );
      res.status(200).json(colors);
    })
    .catch((err) => next(err));
});

///////////// GET ONE ///////////////

colorsRouter.get(
  '/:id_color',
  (req: Request, res: Response, next: NextFunction) => {
    const { id_color } = req.params;
    Color.getColorById(Number(id_color))
      .then((color: IColor) => {
        if (color) {
          res.status(200).json(color);
        } else {
          res.status(401).send('No color found');
        }
      })
      .catch((err) => next(err));
  }
);

/////////////////// POST ///////////////////

colorsRouter.post(
  '/',
  Auth.getCurrentSession,
  Auth.checkSessionPrivileges,
  Color.validateColor,
  (req: Request, res: Response, next: NextFunction) => {
    const color = req.body as IColor;
    Color.addColor(color)
      .then((newColor) => {
        if (newColor) {
          res.status(201).json({ id: newColor.id_color, ...newColor });
        } else {
          throw new ErrorHandler(500, 'Color cannot be created');
        }
      })
      .catch((err) => next(err));
  }
);

/////////////////// UPDATE ///////////////////

colorsRouter.put(
  '/:id_color',
  Auth.getCurrentSession,
  Auth.checkSessionPrivileges,
  Color.validateColor,
  Color.colorExists,
  (req: Request, res: Response, next: NextFunction) => {
    const { id_color } = req.params;
    Color.updateColor(Number(id_color), req.body as IColor)
      .then((updatedColor) => {
        if (updatedColor) {
          Color.getColorById(Number(id_color)).then(
            (color) => res.status(200).send(color) // react-admin needs this response
          );
        } else {
          throw new ErrorHandler(500, 'Color cannot be updated');
        }
      })
      .catch((err) => next(err));
  }
);

/////////////////// DELETE ///////////////////

colorsRouter.delete(
  '/:id_color',
  Auth.getCurrentSession,
  Auth.checkSessionPrivileges,
  Color.colorExists,
  (req: Request, res: Response, next: NextFunction) => {
    const { id_color } = req.params;
    Color.deleteColor(Number(id_color))
      .then((deletedColor) => {
        if (deletedColor) {
          res.status(200).send(req.record); // react-admin needs this response after a delete
        } else {
          throw new ErrorHandler(409, `Color not found`);
        }
      })
      .catch((err) => next(err));
  }
);

export default colorsRouter;
