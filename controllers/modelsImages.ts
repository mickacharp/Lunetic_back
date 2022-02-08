import { NextFunction, Request, Response, Router } from 'express';
const modelsImagesRouter = Router();
import IModelsImage from '../interfaces/IModelsImage';
import * as Auth from '../helpers/auth';
import * as ModelsImage from '../models/modelsImage';
import { ErrorHandler } from '../helpers/errors';
import { formatSortString } from '../helpers/functions';

///////////// GET ALL ///////////////

modelsImagesRouter.get(
  '/',
  (req: Request, res: Response, next: NextFunction) => {
    const sortBy: string = req.query.sort as string;
    ModelsImage.getAllModelsImages(formatSortString(sortBy))
      .then((modelsImages: IModelsImage[]) => {
        res.setHeader(
          'Content-Range',
          `modelsImages : 0-${modelsImages.length}/${modelsImages.length + 1}`
        );
        res.status(200).json(modelsImages);
      })
      .catch((err) => next(err));
  }
);

///////////// GET ONE ///////////////

modelsImagesRouter.get(
  '/:id_models_image',
  (req: Request, res: Response, next: NextFunction) => {
    const { id_models_image } = req.params;
    ModelsImage.getById(Number(id_models_image))
      .then((modelsImage) => {
        if (modelsImage) {
          res.status(200).json(modelsImage);
        } else {
          res.status(401).send('No modelsImage found');
        }
      })
      .catch((err) => next(err));
  }
);

/////////////////// UPDATE ///////////////////

modelsImagesRouter.put(
  '/:id_models_image',
  Auth.getCurrentSession,
  Auth.checkSessionPrivileges,
  ModelsImage.validateModelsImage,
  ModelsImage.modelsImageExists,
  (req: Request, res: Response, next: NextFunction) => {
    const { id_models_image } = req.params;
    ModelsImage.updateModelsImage(
      Number(id_models_image),
      req.body as IModelsImage
    )
      .then((updatedModelsImage) => {
        if (updatedModelsImage) {
          ModelsImage.getById(Number(id_models_image)).then(
            (modelsImage) => res.status(200).send(modelsImage) // react-admin needs this response
          );
        } else {
          throw new ErrorHandler(500, 'ModelsImage cannot be updated');
        }
      })
      .catch((err) => next(err));
  }
);

export default modelsImagesRouter;
