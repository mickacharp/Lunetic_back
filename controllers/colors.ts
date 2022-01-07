import { NextFunction, Request, Response, Router } from 'express';
const colorsRouter = Router();
import IColor from '../interfaces/IColor';
import * as Color from '../models/color';
import { ErrorHandler } from '../helpers/errors';

colorsRouter.get('/', (req: Request, res: Response) => {
  Color.getAllColors()
    .then((colors: Array<IColor>) => {
      res.status(200).json(colors);
    })
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'Colors cannot be found');
    });
});

colorsRouter.get(
  '/:id_color',
  (req: Request, res: Response, next: NextFunction) => {
    const { id_color } = req.params;
    Color.getColorById(Number(id_color))
      .then((colors: IColor) => res.status(200).json(colors))
      .catch((err) => next(err));
  }
);

colorsRouter.delete('/:id_color', (req: Request, res: Response) => {
  const { id_color } = req.params;
  Color.deleteColor(Number(id_color))
    .then((deletedColor) => {
      if (deletedColor) {
        res.status(200).send('delete color for id_color ' + id_color);
      } else {
        res.status(401).send('No color found');
      }
    })
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'Color cannot be updated');
    });
});

colorsRouter.post('/', Color.validateColor, (req: Request, res: Response) => {
  const color = req.body as IColor;
  Color.addColor(color)
    .then((newColor) => res.status(200).json(newColor))
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'Color cannot be created');
    });
});

colorsRouter.put('/:id_color', (req: Request, res: Response) => {
  const { id_color } = req.params;
  Color.updateColor(Number(id_color), req.body as IColor)
    .then((updatedColor) => {
      if (updatedColor) {
        res.status(200).send('Color updated');
      } else {
        res.status(401).send('Color cannot be updated');
      }
    })
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'Color cannot be modified');
    });
});

export default colorsRouter;
