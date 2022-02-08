import { NextFunction, Request, Response, Router } from 'express';
const modelsTemplesColorsRouter = Router();
import IModelTempleColor from '../interfaces/IModelTempleColor';
import * as Auth from '../helpers/auth';
import * as ModelTempleColor from '../models/modelTempleColor';
import { ErrorHandler } from '../helpers/errors';
import { formatSortString } from '../helpers/functions';

///////////// GET ALL ///////////////

modelsTemplesColorsRouter.get(
  '/',
  (req: Request, res: Response, next: NextFunction) => {
    const sortBy: string = req.query.sort as string;
    ModelTempleColor.getAllModelsTemplesColors(formatSortString(sortBy))
      .then((models: IModelTempleColor[]) => {
        res.setHeader(
          'Content-Range',
          `models : 0-${models.length}/${models.length + 1}`
        );
        res.status(200).json(models);
      })
      .catch((err) => next(err));
  }
);

///////////// GET ONE ///////////////

modelsTemplesColorsRouter.get(
  '/:id_model_temple_color',
  (req: Request, res: Response, next: NextFunction) => {
    const { id_model_temple_color } = req.params;
    ModelTempleColor.getById(Number(id_model_temple_color))
      .then((product) => {
        if (product) {
          res.status(200).json(product);
        } else {
          res.status(401).send('No product found');
        }
      })
      .catch((err) => next(err));
  }
);

/////////////////// POST ///////////////////

modelsTemplesColorsRouter.post(
  '/',
  Auth.getCurrentSession,
  ModelTempleColor.validateModelTempleColor,
  (req: Request, res: Response, next: NextFunction) => {
    const glasses = req.body as IModelTempleColor;
    ModelTempleColor.addModelTempleColor(glasses)
      .then((newGlasses) => {
        if (newGlasses) {
          res
            .status(201)
            .json({ id: newGlasses.id_model_temple_color, ...newGlasses });
        } else {
          throw new ErrorHandler(500, 'Glasses cannot be added');
        }
      })
      .catch((err) => next(err));
  }
);

/////////////////// UPDATE ///////////////////

modelsTemplesColorsRouter.put(
  '/:id_model_temple_color',
  Auth.getCurrentSession,
  ModelTempleColor.validateModelTempleColor,
  ModelTempleColor.modelTempleColorExists,
  (req: Request, res: Response, next: NextFunction) => {
    const { id_model_temple_color } = req.params;
    ModelTempleColor.updateModelTempleColor(
      Number(id_model_temple_color),
      req.body as IModelTempleColor
    )
      .then((updatedGlasses) => {
        if (updatedGlasses) {
          ModelTempleColor.getById(Number(id_model_temple_color)).then(
            (glasses) => res.status(200).send(glasses) // react-admin needs this response
          );
        } else {
          throw new ErrorHandler(500, 'Glasses cannot be updated');
        }
      })
      .catch((err) => next(err));
  }
);

/////////////////// DELETE ///////////////////

modelsTemplesColorsRouter.delete(
  '/:id_model_temple_color',
  Auth.getCurrentSession,
  ModelTempleColor.modelTempleColorExists,
  (req: Request, res: Response, next: NextFunction) => {
    const { id_model_temple_color } = req.params;
    ModelTempleColor.deleteModelTempleColor(Number(id_model_temple_color))
      .then((deletedGlasses) => {
        if (deletedGlasses) {
          res.status(200).send(req.record); // react-admin needs this response after a delete
        } else {
          throw new ErrorHandler(409, `Glasses not found`);
        }
      })
      .catch((err) => next(err));
  }
);

export default modelsTemplesColorsRouter;
