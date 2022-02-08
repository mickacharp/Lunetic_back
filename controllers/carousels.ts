import { NextFunction, Request, Response, Router } from 'express';
const carouselsRouter = Router();
import ICarousel from '../interfaces/ICarousel';
import * as Auth from '../helpers/auth';
import * as Carousel from '../models/carousel';
import { ErrorHandler } from '../helpers/errors';
import { formatSortString } from '../helpers/functions';

///////////// GET ALL ///////////////

carouselsRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  const sortBy: string = req.query.sort as string;
  Carousel.getAllCarousels(formatSortString(sortBy))
    .then((carousels: ICarousel[]) => {
      res.setHeader(
        'Content-Range',
        `carousels : 0-${carousels.length}/${carousels.length + 1}`
      );
      res.status(200).json(carousels);
    })
    .catch((err) => next(err));
});

///////////// GET ONE ///////////////

carouselsRouter.get(
  '/:id_carousel',
  (req: Request, res: Response, next: NextFunction) => {
    const { id_carousel } = req.params;
    Carousel.getById(Number(id_carousel))
      .then((carousel) => {
        if (carousel) {
          res.status(200).json(carousel);
        } else {
          res.status(401).send('No carousel found');
        }
      })
      .catch((err) => next(err));
  }
);

/////////////////// UPDATE ///////////////////

carouselsRouter.put(
  '/:id_carousel',
  Auth.getCurrentSession,
  Auth.checkSessionPrivileges,
  Carousel.validateCarousel,
  Carousel.carouselExists,
  (req: Request, res: Response, next: NextFunction) => {
    const { id_carousel } = req.params;
    Carousel.updateCarousel(Number(id_carousel), req.body as ICarousel)
      .then((updatedCarousel) => {
        if (updatedCarousel) {
          Carousel.getById(Number(id_carousel)).then(
            (carousel) => res.status(200).send(carousel) // react-admin needs this response
          );
        } else {
          throw new ErrorHandler(500, 'Carousel cannot be updated');
        }
      })
      .catch((err) => next(err));
  }
);

export default carouselsRouter;
