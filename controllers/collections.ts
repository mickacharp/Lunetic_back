import { NextFunction, Request, Response, Router } from 'express';
const collectionsRouter = Router();
import ICollection from '../interfaces/ICollection';
import * as Collection from '../models/collection';
import { ErrorHandler } from '../helpers/errors';

collectionsRouter.get('/', (req: Request, res: Response) => {
    Collection.getAllCollections()
      .then((collections: Array<ICollection>) => {
        res.status(200).json(collections);

collectionsRouter.get('/', (req: Request, res: Response) => {
  Collection.getAllCollections()
    .then((collections: Array<ICollection>) => {
      res.status(200).json(collections);
    })
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'Collections cannot be found');
    });
});

collectionsRouter.get(
  '/:id_collection',
  (req: Request, res: Response, next: NextFunction) => {
    const { id_collection } = req.params;
    Collection.getCollectionById(Number(id_collection))
      .then((collections: ICollection) => res.status(200).json(collections))
      .catch((err) => next(err));
  }
);

export default collectionsRouter;
