import { Request, Response, Router } from 'express';
const modelsTemplesColorsRouter = Router();
import * as ModelTempleColor from '../models/modelTempleColor';
import IModelTempleColor from '../interfaces/IModelTempleColor';

import { ErrorHandler } from '../helpers/errors';

///////////// GET ALL ///////////////

modelsTemplesColorsRouter.get('/', (req: Request, res: Response) => {
  ModelTempleColor.getAllModels()
    .then((models) => res.status(200).json(models))
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'models cannot be found');
    });
});

///////////// GET ONE ///////////////

modelsTemplesColorsRouter.get('/:id_model', (req: Request, res: Response) => {
  ModelTempleColor.getById(Number(req.params.id_model))
    .then((model) => {
      if (model) {
        res.status(200).json(model);
      } else {
        res.status(401).send('No model found');
      }
    })
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'model cannot be found');
    });
});

///////////// GET BY ID WISHLIST ///////////////

modelsTemplesColorsRouter.get('/wishlists/:id_wishlist', (req: Request, res: Response) => {
  ModelTempleColor.getByIdWishlist(Number(req.params.id_wishlist))
  .then((wishlist) => {
    if (wishlist) {
      res.status(200).json(wishlist);
    } else {
      res.status(401).send('No wishlist found');
    }
  })
  .catch((err) => {
    console.log(err);
    throw new ErrorHandler(500, 'Wishlist cannot be found');
  });
});

/////////////////// POST ///////////////////

modelsTemplesColorsRouter.post('/', (req: Request, res: Response) => {
  const model = req.body as IModelTempleColor;
  ModelTempleColor.addModelTempleColor(model)
    .then((newModel) => res.status(200).json(newModel))
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'Model cannot be created');
    });
});

/////////////////// DELETE ///////////////////

modelsTemplesColorsRouter.delete('/:id_model', (req: Request, res: Response) => {
  const { id_model } = req.params;
  ModelTempleColor.deleteModel(Number(id_model))
    .then((deleteModel) => {
      if (deleteModel) {
        res.status(200).send('model ' + id_model + ' deleted');
      } else {
        res.status(401).send('No model found');
      }
    })
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'model cannot be updated');
    });
});

export default modelsTemplesColorsRouter;
