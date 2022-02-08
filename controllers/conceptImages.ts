import { NextFunction, Request, Response, Router } from 'express';
const conceptImagesRouter = Router();
import IConceptImage from '../interfaces/IConceptImage';
import * as Auth from '../helpers/auth';
import * as ConceptImage from '../models/conceptImage';
import { ErrorHandler } from '../helpers/errors';
import { formatSortString } from '../helpers/functions';

///////////// GET ALL ///////////////

conceptImagesRouter.get(
  '/',
  (req: Request, res: Response, next: NextFunction) => {
    const sortBy: string = req.query.sort as string;
    ConceptImage.getAllConceptImages(formatSortString(sortBy))
      .then((conceptImages: IConceptImage[]) => {
        res.setHeader(
          'Content-Range',
          `conceptImages : 0-${conceptImages.length}/${
            conceptImages.length + 1
          }`
        );
        res.status(200).json(conceptImages);
      })
      .catch((err) => next(err));
  }
);

///////////// GET ONE ///////////////

conceptImagesRouter.get(
  '/:id_concept_image',
  (req: Request, res: Response, next: NextFunction) => {
    const { id_concept_image } = req.params;
    ConceptImage.getById(Number(id_concept_image))
      .then((conceptImage) => {
        if (conceptImage) {
          res.status(200).json(conceptImage);
        } else {
          res.status(401).send('No conceptImage found');
        }
      })
      .catch((err) => next(err));
  }
);

/////////////////// UPDATE ///////////////////

conceptImagesRouter.put(
  '/:id_concept_image',
  Auth.getCurrentSession,
  Auth.checkSessionPrivileges,
  ConceptImage.validateConceptImage,
  ConceptImage.conceptImageExists,
  (req: Request, res: Response, next: NextFunction) => {
    const { id_concept_image } = req.params;
    ConceptImage.updateConceptImage(
      Number(id_concept_image),
      req.body as IConceptImage
    )
      .then((updatedConceptImage) => {
        if (updatedConceptImage) {
          ConceptImage.getById(Number(id_concept_image)).then(
            (conceptImage) => res.status(200).send(conceptImage) // react-admin needs this response
          );
        } else {
          throw new ErrorHandler(500, 'ConceptImage cannot be updated');
        }
      })
      .catch((err) => next(err));
  }
);

export default conceptImagesRouter;
