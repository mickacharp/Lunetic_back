import { NextFunction, Request, Response, Router } from 'express';
const templesRouter = Router();
import ITemple from '../interfaces/ITemple';

import * as Temple from '../models/temple';
import { ErrorHandler } from '../helpers/errors';
import { formatSortString } from '../helpers/functions';

/////////////////// GET ///////////////////

// Get all temples
templesRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  const sortBy: string = req.query.sort as string;
  Temple.getAllTemples(formatSortString(sortBy))
    .then((temples: Array<ITemple>) => {
      res.setHeader(
        'Content-Range',
        `temples : 0-${temples.length}/${temples.length + 1}`
      );
      res.status(200).json(temples);
    })
    .catch((err) => next(err));
});

// Get a specific temple by id
templesRouter.get('/:id_temple', (req: Request, res: Response) => {
  const { id_temple } = req.params;
  Temple.getTempleById(Number(id_temple))
    .then((temple) => {
      if (temple) {
        res.status(200).json(temple);
      } else {
        res.status(401).send('No temple found');
      }
    })
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'Temple cannot be found');
    });
});

// Get all models belonging to one specific collection
templesRouter.get(
  '/collection/:id_collection',
  (req: Request, res: Response) => {
    const { id_collection } = req.params;
    Temple.getTempleByCollection(Number(id_collection))
      .then((temples) => {
        if (temples) {
          res.status(200).json(temples);
        } else {
          res
            .status(401)
            .send(
              `Temples belonging to collection ${id_collection} can't be found`
            );
        }
      })
      .catch((err) => {
        console.log(err);
        throw new ErrorHandler(500, 'Temples cannot be found');
      });
  }
);

/////////////////// POST ///////////////////

templesRouter.post('/', (req: Request, res: Response) => {
  const temple = req.body as ITemple;
  Temple.addTemple(temple)
    .then((newTemple) => res.status(200).json(newTemple))
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'Temple cannot be created');
    });
});

/////////////////// PUT ///////////////////

templesRouter.put('/:id_temple', (req: Request, res: Response) => {
  const { id_temple } = req.params;
  Temple.updateTemple(Number(id_temple), req.body as ITemple)
    .then((updatedTemple) => {
      if (updatedTemple) {
        res.status(200).send('temple updated');
      } else {
        res.status(401).send('Temple cannot be updated');
      }
    })
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'Temple cannot be modified');
    });
});

/////////////////// DELETE ///////////////////

templesRouter.delete('/:id_temple', (req: Request, res: Response) => {
  const { id_temple } = req.params;
  Temple.deleteTemple(Number(id_temple))
    .then((deletedTemple) => {
      if (deletedTemple) {
        res.status(200).send('delete temple for id_temple ' + id_temple);
      } else {
        res.status(401).send('No temple found');
      }
    })
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'Temple cannot be updated');
    });
});

export default templesRouter;
