import connection from '../db-config';
import Joi from 'joi';
import { ResultSetHeader } from 'mysql2';
import { NextFunction, Request, Response } from 'express';
import { ErrorHandler } from '../helpers/errors';
import IUsImage from '../interfaces/IUsImage';

//////////// UsImage middlewares /////////////
const validateUsImage = (req: Request, res: Response, next: NextFunction) => {
  let required: Joi.PresenceMode = 'optional';
  if (req.method === 'POST') {
    required = 'required';
  }
  const errors = Joi.object({
    main_img: Joi.string().max(255).presence(required),
    middle_img: Joi.string().max(255).presence(required),
    partners_img: Joi.string().max(255).presence(required),
    id_us_image: Joi.number().optional(),
    id: Joi.number().optional(),
  }).validate(req.body, { abortEarly: false }).error;
  if (errors) {
    next(new ErrorHandler(422, errors.message));
  } else {
    next();
  }
};

const usImageExists = (req: Request, res: Response, next: NextFunction) => {
  const { id_us_image } = req.params;
  getById(Number(id_us_image)).then((usImageExists: IUsImage) => {
    if (!usImageExists) {
      next(new ErrorHandler(404, `This usImage doesn't exist`));
    } else {
      next();
    }
  });
};

//////////// CRUD models of usImage /////////////
const getAllUsImages = (sortBy = ''): Promise<IUsImage[]> => {
  let sql = 'SELECT *, id_us_image as id FROM us_images';
  if (sortBy) {
    sql += ` ORDER BY ${sortBy}`;
  }
  return connection
    .promise()
    .query<IUsImage[]>(sql)
    .then(([results]) => results);
};

const getById = (id_us_image: number): Promise<IUsImage> => {
  return connection
    .promise()
    .query<IUsImage[]>(
      'select *, id_us_image as id from us_images where id_us_image=?',
      [id_us_image]
    )
    .then(([results]) => results[0]);
};

const updateUsImage = (
  id_us_image: number,
  usImage: IUsImage
): Promise<boolean> => {
  let sql = 'UPDATE us_images SET';
  const sqlValues: (string | number)[] = [];
  let oneValue = false;

  if (usImage.main_img) {
    sql += ' main_img = ? ';
    sqlValues.push(usImage.main_img);
    oneValue = true;
  }
  if (usImage.middle_img) {
    sql += oneValue ? ', middle_img = ? ' : ' middle_img = ? ';
    sqlValues.push(usImage.middle_img);
    oneValue = true;
  }
  if (usImage.partners_img) {
    sql += oneValue ? ', partners_img = ? ' : ' partners_img = ? ';
    sqlValues.push(usImage.partners_img);
    oneValue = true;
  }

  sql += ' WHERE id_us_image = ?';
  sqlValues.push(id_us_image);

  return connection
    .promise()
    .query<ResultSetHeader>(sql, sqlValues)
    .then(([results]) => results.affectedRows === 1);
};

export {
  validateUsImage,
  usImageExists,
  getAllUsImages,
  getById,
  updateUsImage,
};
