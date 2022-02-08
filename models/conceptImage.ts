import connection from '../db-config';
import Joi from 'joi';
import { ResultSetHeader } from 'mysql2';
import { NextFunction, Request, Response } from 'express';
import { ErrorHandler } from '../helpers/errors';
import IConceptImage from '../interfaces/IConceptImage';

//////////// ConceptImage middlewares /////////////
const validateConceptImage = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let required: Joi.PresenceMode = 'optional';
  if (req.method === 'POST') {
    required = 'required';
  }
  const errors = Joi.object({
    main_img: Joi.string().max(255).presence(required),
    img1: Joi.string().max(255).presence(required),
    img2: Joi.string().max(255).presence(required),
    left_img3: Joi.string().max(255).presence(required),
    right_img3: Joi.string().max(255).presence(required),
    video: Joi.string().max(255).presence(required),
    id_concept_image: Joi.number().optional(),
    id: Joi.number().optional(),
  }).validate(req.body, { abortEarly: false }).error;
  if (errors) {
    next(new ErrorHandler(422, errors.message));
  } else {
    next();
  }
};

const conceptImageExists = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id_concept_image } = req.params;
  getById(Number(id_concept_image)).then(
    (conceptImageExists: IConceptImage) => {
      if (!conceptImageExists) {
        next(new ErrorHandler(404, `This conceptImage doesn't exist`));
      } else {
        next();
      }
    }
  );
};

//////////// CRUD models of ConceptImage /////////////
const getAllConceptImages = (sortBy = ''): Promise<IConceptImage[]> => {
  let sql = 'SELECT *, id_concept_image as id FROM concept_images';
  if (sortBy) {
    sql += ` ORDER BY ${sortBy}`;
  }
  return connection
    .promise()
    .query<IConceptImage[]>(sql)
    .then(([results]) => results);
};

const getById = (id_concept_image: number): Promise<IConceptImage> => {
  return connection
    .promise()
    .query<IConceptImage[]>(
      'select *, id_concept_image as id from concept_images where id_concept_image=?',
      [id_concept_image]
    )
    .then(([results]) => results[0]);
};

const updateConceptImage = (
  id_concept_image: number,
  conceptImage: IConceptImage
): Promise<boolean> => {
  let sql = 'UPDATE concept_images SET';
  const sqlValues: (string | number)[] = [];
  let oneValue = false;

  if (conceptImage.main_img) {
    sql += ' main_img = ? ';
    sqlValues.push(conceptImage.main_img);
    oneValue = true;
  }
  if (conceptImage.img1) {
    sql += oneValue ? ', img1 = ? ' : ' img1 = ? ';
    sqlValues.push(conceptImage.img1);
    oneValue = true;
  }
  if (conceptImage.img2) {
    sql += oneValue ? ', img2 = ? ' : ' img2 = ? ';
    sqlValues.push(conceptImage.img2);
    oneValue = true;
  }
  if (conceptImage.left_img3) {
    sql += oneValue ? ', left_img3 = ? ' : ' left_img3 = ? ';
    sqlValues.push(conceptImage.left_img3);
    oneValue = true;
  }
  if (conceptImage.right_img3) {
    sql += oneValue ? ', right_img3 = ? ' : ' right_img3 = ? ';
    sqlValues.push(conceptImage.right_img3);
    oneValue = true;
  }
  if (conceptImage.video) {
    sql += oneValue ? ', video = ? ' : ' video = ? ';
    sqlValues.push(conceptImage.video);
    oneValue = true;
  }

  sql += ' WHERE id_concept_image = ?';
  sqlValues.push(id_concept_image);

  return connection
    .promise()
    .query<ResultSetHeader>(sql, sqlValues)
    .then(([results]) => results.affectedRows === 1);
};

export {
  validateConceptImage,
  conceptImageExists,
  getAllConceptImages,
  getById,
  updateConceptImage,
};
