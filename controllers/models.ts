const modelsRouter = require('express').Router();
import { Request, Response } from 'express';

interface ModelInfo {
  name: string;
}

///////////// PRODUCTS ///////////////

modelsRouter.get('/', (req: Request, res: Response) => {
  res.status(200).send('get all models');
});

module.exports = { modelsRouter };