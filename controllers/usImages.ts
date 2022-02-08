import { NextFunction, Request, Response, Router } from 'express';
const usImagesRouter = Router();
import IUsImage from '../interfaces/IUsImage';
import * as Auth from '../helpers/auth';
import * as UsImage from '../models/usImage';
import { ErrorHandler } from '../helpers/errors';
import { formatSortString } from '../helpers/functions';

///////////// GET ALL ///////////////

usImagesRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  const sortBy: string = req.query.sort as string;
  UsImage.getAllUsImages(formatSortString(sortBy))
    .then((usImages: IUsImage[]) => {
      res.setHeader(
        'Content-Range',
        `usImages : 0-${usImages.length}/${usImages.length + 1}`
      );
      res.status(200).json(usImages);
    })
    .catch((err) => next(err));
});

///////////// GET ONE ///////////////

usImagesRouter.get(
  '/:id_us_image',
  (req: Request, res: Response, next: NextFunction) => {
    const { id_us_image } = req.params;
    UsImage.getById(Number(id_us_image))
      .then((usImage) => {
        if (usImage) {
          res.status(200).json(usImage);
        } else {
          res.status(401).send('No usImage found');
        }
      })
      .catch((err) => next(err));
  }
);

/////////////////// UPDATE ///////////////////

usImagesRouter.put(
  '/:id_us_image',
  Auth.getCurrentSession,
  Auth.checkSessionPrivileges,
  UsImage.validateUsImage,
  UsImage.usImageExists,
  (req: Request, res: Response, next: NextFunction) => {
    const { id_us_image } = req.params;
    UsImage.updateUsImage(Number(id_us_image), req.body as IUsImage)
      .then((updatedUsImage) => {
        if (updatedUsImage) {
          UsImage.getById(Number(id_us_image)).then(
            (usImage) => res.status(200).send(usImage) // react-admin needs this response
          );
        } else {
          throw new ErrorHandler(500, 'UsImage cannot be updated');
        }
      })
      .catch((err) => next(err));
  }
);

export default usImagesRouter;
