import { NextFunction, Request, Response, Router } from 'express';
const modelsRouter = Router();
import IModel from '../interfaces/IModel';
import * as Auth from '../helpers/auth';
import * as Model from '../models/model';
import { ErrorHandler } from '../helpers/errors';
import { formatSortString } from '../helpers/functions';

///////////// GET ALL ///////////////

modelsRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  const sortBy: string = req.query.sort as string;
  Model.getAllModels(formatSortString(sortBy))
    .then((models: IModel[]) => {
      res.setHeader(
        'Content-Range',
        `models : 0-${models.length}/${models.length + 1}`
      );
      res.status(200).json(models);
    })
    .catch((err) => next(err));
});

///////////// GET ONE ///////////////

modelsRouter.get(
  '/:id_model',
  (req: Request, res: Response, next: NextFunction) => {
    const { id_model } = req.params;
    Model.getById(Number(id_model))
      .then((model) => {
        if (model) {
          res.status(200).json(model);
        } else {
          res.status(401).send('No model found');
        }
      })
      .catch((err) => next(err));
  }
);

/////////////////// POST ///////////////////

modelsRouter.post(
  '/',
  Auth.getCurrentSession,
  Auth.checkSessionPrivileges,
  Model.validateModel,
  (req: Request, res: Response, next: NextFunction) => {
    const model = req.body as IModel;
    Model.addModel(model)
      .then((newModel) => {
        if (newModel) {
          res.status(201).json({ id: newModel.id_model, ...newModel });
        } else {
          throw new ErrorHandler(500, 'Model cannot be created');
        }
      })
      .catch((err) => next(err));
  }
);

/////////////////// UPDATE ///////////////////

modelsRouter.put(
  '/:id_model',
  Auth.getCurrentSession,
  Auth.checkSessionPrivileges,
  Model.validateModel,
  Model.modelExists,
  (req: Request, res: Response, next: NextFunction) => {
    const { id_model } = req.params;
    Model.updateModel(Number(id_model), req.body as IModel)
      .then((updatedModel) => {
        if (updatedModel) {
          Model.getById(Number(id_model)).then(
            (model) => res.status(200).send(model) // react-admin needs this response
          );
        } else {
          throw new ErrorHandler(500, 'Model cannot be updated');
        }
      })
      .catch((err) => next(err));
  }
);

/////////////////// DELETE ///////////////////

modelsRouter.delete(
  '/:id_model',
  Auth.getCurrentSession,
  Auth.checkSessionPrivileges,
  Model.modelExists,
  (req: Request, res: Response, next: NextFunction) => {
    const { id_model } = req.params;
    Model.deleteModel(Number(id_model))
      .then((deleteModel) => {
        if (deleteModel) {
          res.status(200).send(req.record); // react-admin needs this response after a delete
        } else {
          throw new ErrorHandler(409, `Model not found`);
        }
      })
      .catch((err) => next(err));
  }
);

export default modelsRouter;
