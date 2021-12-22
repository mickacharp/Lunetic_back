const colorsRouter = require('express').Router();
import { Request, Response } from 'express';

interface ColorInfo {
  name: string;
}

///////////// PRODUCTS ///////////////

colorsRouter.get('/', (req: Request, res: Response) => {
  res.status(200).send('get all colors');
});

module.exports = { colorsRouter };