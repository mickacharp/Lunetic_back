import { Request, Response, Router } from 'express';
const modelsRouter = Router();
import * as Model from '../models/model';
import IModel from '../interfaces/IModel';

import { ErrorHandler } from '../helpers/errors';

///////////// GET ALL ///////////////

modelsRouter.get('/', (req: Request, res: Response) => {
  Model.getAllModels()
    .then((models) => res.status(200).json(models))
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'models cannot be found');
    });
});

///////////// GET ONE ///////////////

modelsRouter.get('/:id_model', (req: Request, res: Response) => {
  Model.getById(Number(req.params.id_model))
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

///////////// GET BY COLLECTION ///////////////

modelsRouter.get(
  '/collections/:id_collection',
  (req: Request, res: Response) => {
    Model.getByCollection(Number(req.params.id_collection))
      .then((models) => {
        if (models) {
          res.status(200).json(models);
        } else {
          res.status(401).send('No model found');
        }
      })
      .catch((err) => {
        console.log(err);
        throw new ErrorHandler(500, 'model cannot be found');
      });
  }
);

/////////////////// POST ///////////////////

modelsRouter.post('/', (req: Request, res: Response) => {
  const model = req.body as IModel;
  Model.addModel(model)
    .then((newModel) => res.status(200).json(newModel))
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'Model cannot be created');
    });
});

/////////////////// UPDATE ///////////////////

modelsRouter.put('/:id_model', (req: Request, res: Response) => {
  const { id_model } = req.params;
  Model.updateModel(Number(id_model), req.body as IModel)
    .then((updatedModel) => {
      if (updatedModel) {
        res.status(200).send('model updated');
      } else {
        res.status(401).send('model cannot be updated');
      }
    })
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'model cannot be modified');
    });
});

/////////////////// DELETE ///////////////////

modelsRouter.delete('/:id_model', (req: Request, res: Response) => {
  const { id_model } = req.params;
  Model.deleteModel(Number(id_model))
    .then((deleteModel) => {
      if (deleteModel) {
        res.status(200).send('model' + id_model + 'deleted');
      } else {
        res.status(401).send('No model found');
      }
    })
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'model cannot be updated');
    });
});

export default modelsRouter;
