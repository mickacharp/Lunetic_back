import { Request, Response, Router } from 'express';
const modelsRouter = Router();
import * as Model from '../models/model';

interface ModelInfo {
  name: string;
}

///////////// PRODUCTS ///////////////

modelsRouter.get('/', (req: Request, res: Response) => {
  Model.getAllModels().then((models) => res.status(200).json(models));
});

modelsRouter.get('/:id_model', (req: Request, res: Response) => {
  Model.getById(Number(req.params.id_model)).then((model) => {
    console.log(model);
    res.status(200).json(model);
  });
});

export default modelsRouter;
