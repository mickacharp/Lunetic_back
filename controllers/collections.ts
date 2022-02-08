import { NextFunction, Request, Response, Router } from 'express';
const collectionsRouter = Router();
import ICollection from '../interfaces/ICollection';
import * as Auth from '../helpers/auth';
import * as Collection from '../models/collection';
import * as Model from '../models/model';
import * as Temple from '../models/temple';
import { ErrorHandler } from '../helpers/errors';
import { formatSortString } from '../helpers/functions';

///////////// GET ALL ///////////////

collectionsRouter.get(
  '/',
  (req: Request, res: Response, next: NextFunction) => {
    const sortBy: string = req.query.sort as string;
    Collection.getAllCollections(formatSortString(sortBy))
      .then((collections: ICollection[]) => {
        res.setHeader(
          'Content-Range',
          `collections : 0-${collections.length}/${collections.length + 1}`
        );
        res.status(200).json(collections);
      })
      .catch((err) => next(err));
  }
);

///////////// GET ONE ///////////////

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
  (req: Request, res: Response, next: NextFunction) => {
    const { id_collection } = req.params;
    Model.getByCollection(Number(id_collection))
      .then((models) => {
        if (models) {
          res.status(200).json(models);
        } else {
          res.status(401).send('No model found');
        }
      })
      .catch((err) => next(err));
  }
);

///////////// GET TEMPLES BY COLLECTION ///////////////

collectionsRouter.get(
  '/:id_collection/temples',
  (req: Request, res: Response, next: NextFunction) => {
    const { id_collection } = req.params;
    Temple.getTempleByCollection(Number(id_collection))
      .then((temples) => {
        if (temples) {
          res.status(200).json(temples);
        } else {
          res.status(401).send('No temple found');
        }
      })
      .catch((err) => next(err));
  }
);

/////////////////// POST ///////////////////

collectionsRouter.post(
  '/',
  Auth.getCurrentSession,
  Auth.checkSessionPrivileges,
  Collection.validateCollection,
  (req: Request, res: Response, next: NextFunction) => {
    const collection = req.body as ICollection;
    Collection.addCollection(collection)
      .then((newCollection) => {
        if (newCollection) {
          res
            .status(201)
            .json({ id: newCollection.id_collection, ...newCollection });
        } else {
          throw new ErrorHandler(500, 'Collection cannot be created');
        }
      })
      .catch((err) => next(err));
  }
);

/////////////////// UPDATE ///////////////////

collectionsRouter.put(
  '/:id_collection',
  Auth.getCurrentSession,
  Auth.checkSessionPrivileges,
  Collection.validateCollection,
  Collection.collectionExists,
  (req: Request, res: Response, next: NextFunction) => {
    const { id_collection } = req.params;
    Collection.updateCollection(Number(id_collection), req.body as ICollection)
      .then((updatedCollection) => {
        if (updatedCollection) {
          Collection.getCollectionById(Number(id_collection)).then(
            (collection) => res.status(200).send(collection) // react-admin needs this response
          );
        } else {
          throw new ErrorHandler(500, 'Collection cannot be updated');
        }
      })
      .catch((err) => next(err));
  }
);

collectionsRouter.delete(
  '/:id_collection',
  Auth.getCurrentSession,
  Auth.checkSessionPrivileges,
  Collection.collectionExists,
  (req: Request, res: Response, next: NextFunction) => {
    const { id_collection } = req.params;
    Collection.deleteCollection(Number(id_collection))
      .then((deletedCollection) => {
        if (deletedCollection) {
          res.status(200).send(req.record); // react-admin needs this response after a delete
        } else {
          throw new ErrorHandler(409, `Collection not found`);
        }
      })
      .catch((err) => next(err));
  }
);

export default collectionsRouter;
