import { Request, Response, Router } from 'express';
const colorsRouter = Router();

interface ColorInfo {
  name: string;
}

///////////// PRODUCTS ///////////////

colorsRouter.get('/', (req: Request, res: Response) => {
  res.status(200).send('get all colors');
});

module.exports = { colorsRouter };