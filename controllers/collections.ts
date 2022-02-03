import { NextFunction, Request, Response, Router } from 'express';
const collectionsRouter = Router();
import ICollection from '../interfaces/ICollection';
import * as Collection from '../models/collection';
import * as Model from '../models/model';
import { ErrorHandler } from '../helpers/errors';
import { formatSortString } from '../helpers/functions';

collectionsRouter.get(
  '/',
  (req: Request, res: Response, next: NextFunction) => {
    const sortBy: string = req.query.sort as string;
    Collection.getAllCollections(formatSortString(sortBy))
      .then((collections: Array<ICollection>) => {
        res.setHeader(
          'Content-Range',
          `collections : 0-${collections.length}/${collections.length + 1}`
        );
        res.status(200).json(collections);
      })
      .catch((err) => next(err));
  }
);

collectionsRouter.get(
  '/:id_collection',
  (req: Request, res: Response, next: NextFunction) => {
    const { id_collection } = req.params;
    Collection.getCollectionById(Number(id_collection))
      .then((collections: ICollection) => res.status(200).json(collections))
      .catch((err) => next(err));
  }
);

///////////// GET MODELS BY COLLECTION ///////////////

collectionsRouter.get(
  '/:id_collection/models',
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

collectionsRouter.delete('/:id_collection', (req: Request, res: Response) => {
  const { id_collection } = req.params;
  Collection.deleteCollection(Number(id_collection))
    .then((deletedCollection) => {
      if (deletedCollection) {
        res
          .status(200)
          .send('delete collection for id_collection ' + id_collection);
      } else {
        res.status(401).send('No collection found');
      }
    })
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'Collection cannot be updated');
    });
});

collectionsRouter.post(
  '/',
  Collection.validateCollection,
  (req: Request, res: Response) => {
    const collection = req.body as ICollection;
    Collection.addCollection(collection)
      .then((newCollection) => res.status(200).json(newCollection))
      .catch((err) => {
        console.log(err);
        throw new ErrorHandler(500, 'Collection cannot be created');
      });
  }
);

collectionsRouter.put('/:id_collection', (req: Request, res: Response) => {
  const { id_collection } = req.params;
  Collection.updateCollection(Number(id_collection), req.body as ICollection)
    .then((updatedCollection) => {
      if (updatedCollection) {
        res.status(200).send('Collection updated');
      } else {
        res.status(401).send('Collection cannot be updated');
      }
    })
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'Collection cannot be modified');
    });
});

export default collectionsRouter;
