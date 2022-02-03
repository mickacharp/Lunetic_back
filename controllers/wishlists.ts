import { NextFunction, Request, Response, Router } from 'express';
const wishlistsRouter = Router();
import IWishlist from '../interfaces/IWishlist';

import * as Wishlist from '../models/wishlist';
import { ErrorHandler } from '../helpers/errors';
import { formatSortString } from '../helpers/functions';

/////////////////// GET ///////////////////

// Get all wishlists
wishlistsRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  const sortBy: string = req.query.sort as string;
  Wishlist.getAllWishlists(formatSortString(sortBy))
    .then((wishlists: Array<IWishlist>) => {
      res.setHeader(
        'Content-Range',
        `wishlists : 0-${wishlists.length}/${wishlists.length + 1}`
      );
      res.status(200).json(wishlists);
    })
    .catch((err) => next(err));
});

// Get a specific wishlist by id
wishlistsRouter.get('/:id_wishlist', (req: Request, res: Response) => {
  const { id_wishlist } = req.params;
  Wishlist.getWishlistById(Number(id_wishlist))
    .then((wishlist) => {
      if (wishlist) {
        res.status(200).json(wishlist);
      } else {
        res.status(401).send('No wishlist found');
      }
    })
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'Wishlist cannot be found');
    });
});

/////////////////// POST ///////////////////

wishlistsRouter.post('/', (req: Request, res: Response) => {
  const wishlist = req.body as IWishlist;
  Wishlist.addWishlist(wishlist)
    .then((newWishlist) => res.status(200).json(newWishlist))
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'Wishlist cannot be created');
    });
});

/////////////////// PUT ///////////////////

wishlistsRouter.put('/:id_wishlist', (req: Request, res: Response) => {
  const { id_wishlist } = req.params;
  Wishlist.updateWishlist(Number(id_wishlist), req.body as IWishlist)
    .then((updatedWishlist) => {
      if (updatedWishlist) {
        res.status(200).send('Wishlist updated');
      } else {
        res.status(401).send('Wishlist cannot be updated');
      }
    })
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'Wishlist cannot be modified');
    });
});

/////////////////// DELETE ///////////////////

wishlistsRouter.delete('/:id_wishlist', (req: Request, res: Response) => {
  const { id_wishlist } = req.params;
  Wishlist.deleteWishlist(Number(id_wishlist))
    .then((deletedWishlist) => {
      if (deletedWishlist) {
        res.status(200).send('Delete wishlist for id_wishlist ' + id_wishlist);
      } else {
        res.status(401).send('No wishlist found');
      }
    })
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'Wishlist cannot be updated');
    });
});

export default wishlistsRouter;
