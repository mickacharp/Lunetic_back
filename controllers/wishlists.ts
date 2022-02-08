import { NextFunction, Request, Response, Router } from 'express';
const wishlistsRouter = Router();
import IWishlist from '../interfaces/IWishlist';
import * as Auth from '../helpers/auth';
import * as Wishlist from '../models/wishlist';
import * as ModelTempleColor from '../models/modelTempleColor';
import { ErrorHandler } from '../helpers/errors';
import { formatSortString } from '../helpers/functions';

////////////// GET ALL ////////////////

wishlistsRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  const sortBy: string = req.query.sort as string;
  Wishlist.getAllWishlists(formatSortString(sortBy))
    .then((wishlists: IWishlist[]) => {
      res.setHeader(
        'Content-Range',
        `wishlists : 0-${wishlists.length}/${wishlists.length + 1}`
      );
      res.status(200).json(wishlists);
    })
    .catch((err) => next(err));
});

///////////// GET ONE ///////////////

wishlistsRouter.get(
  '/:id_wishlist',
  (req: Request, res: Response, next: NextFunction) => {
    const { id_wishlist } = req.params;
    Wishlist.getWishlistById(Number(id_wishlist))
      .then((wishlist) => {
        if (wishlist) {
          res.status(200).json(wishlist);
        } else {
          res.status(401).send('No wishlist found');
        }
      })

      .catch((err) => next(err));
  }
);

///////////// GET GLASSES (ModelTempleColor) OF ONE WISHLIST ///////////////

wishlistsRouter.get(
  '/:id_wishlist/glasses',
  (req: Request, res: Response, next: NextFunction) => {
    const { id_wishlist } = req.params;
    ModelTempleColor.getByIdWishlist(Number(id_wishlist))
      .then((glasses) => {
        res.status(200).json(glasses);
      })
      .catch((err) => next(err));
  }
);

/////////////////// POST ///////////////////

wishlistsRouter.post(
  '/',
  Auth.getCurrentSession,
  Wishlist.validateWishlist,
  (req: Request, res: Response, next: NextFunction) => {
    const wishlist = req.body as IWishlist;
    Wishlist.addWishlist(wishlist)
      .then((newWishlist) => {
        if (newWishlist) {
          res.status(201).json({ id: newWishlist.id_wishlist, ...newWishlist });
        } else {
          throw new ErrorHandler(500, 'Wishlist cannot be created');
        }
      })
      .catch((err) => next(err));
  }
);

/////////////////// UPDATE ///////////////////

wishlistsRouter.put(
  '/:id_wishlist',
  Auth.getCurrentSession,
  Wishlist.validateWishlist,
  Wishlist.wishlistExists,
  (req: Request, res: Response, next: NextFunction) => {
    const { id_wishlist } = req.params;
    Wishlist.updateWishlist(Number(id_wishlist), req.body as IWishlist)
      .then((updatedWishlist) => {
        if (updatedWishlist) {
          Wishlist.getWishlistById(Number(id_wishlist)).then(
            (wishlist) => res.status(200).send(wishlist) // react-admin needs this response
          );
        } else {
          throw new ErrorHandler(500, 'Wishlist cannot be updated');
        }
      })
      .catch((err) => next(err));
  }
);

/////////////////// DELETE ///////////////////

wishlistsRouter.delete(
  '/:id_wishlist',
  Auth.getCurrentSession,
  Wishlist.wishlistExists,
  (req: Request, res: Response, next: NextFunction) => {
    const { id_wishlist } = req.params;
    Wishlist.deleteWishlist(Number(id_wishlist))
      .then((deletedWishlist) => {
        if (deletedWishlist) {
          res.status(200).send(req.record); // react-admin needs this response after a delete
        } else {
          throw new ErrorHandler(409, `Wishlit not found`);
        }
      })
      .catch((err) => next(err));
  }
);

export default wishlistsRouter;
