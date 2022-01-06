import { Request, Response, Router } from 'express';
const modelsRouter = Router();

interface ModelInfo {
  name: string;
}

///////////// PRODUCTS ////////////////

modelsRouter.get('/', (req: Request, res: Response) => {
  res.status(200).send('get all models');
});

module.exports = { modelsRouter };
