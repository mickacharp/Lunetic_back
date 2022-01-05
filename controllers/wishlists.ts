import { Request, Response, Router } from 'express';
const wishlistsRouter = Router();
import IWishlist from '../interfaces/IWishlist';

import * as Wishlist from '../models/wishlist';
import { ErrorHandler } from '../helpers/errors';

/////////////////// GET ///////////////////

// Get all wishlists
wishlistsRouter.get('/', (req: Request, res: Response) => {
  Wishlist.getAllWishlists()
    .then((wishlists: Array<IWishlist>) => {
      res.status(200).json(wishlists);
    })
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'Wishlists cannot be found');
    });
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

// Get all wishlists of one specific optician
wishlistsRouter.get(
  '/opticians/:id_optician',
  (req: Request, res: Response) => {
    const { id_optician } = req.params;
    Wishlist.getWishlistsByOptician(Number(id_optician))
      .then((wishlists) => {
        if (wishlists) {
          res.status(200).json(wishlists);
        } else {
          res
            .status(401)
            .send(
              `Wishlists belonging to optician ${id_optician} can't be found`
            );
        }
      })
      .catch((err) => {
        console.log(err);
        throw new ErrorHandler(500, 'Wishlists cannot be found');
      });
  }
);

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
