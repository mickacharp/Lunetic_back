import connection from '../db-config';
import Joi from 'joi';
import { ResultSetHeader } from 'mysql2';
import { NextFunction, Request, Response } from 'express';
import { ErrorHandler } from '../helpers/errors';
import IModelsImage from '../interfaces/IModelsImage';

//////////// ModelsImage middlewares /////////////
const validateModelsImage = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let required: Joi.PresenceMode = 'optional';
  if (req.method === 'POST') {
    required = 'required';
  }
  const errors = Joi.object({
    main_img1: Joi.string().max(255).presence(required),
    main_img2: Joi.string().max(255).presence(required),
    main_img3: Joi.string().max(255).presence(required),
    main_img4: Joi.string().max(255).presence(required),
    sidetitle_img1: Joi.string().max(255).presence(required),
    sidetitle_img2: Joi.string().max(255).presence(required),
    page_img1: Joi.string().max(255).presence(required),
    page_img2: Joi.string().max(255).presence(required),
    middle_img1: Joi.string().max(255).presence(required),
    middle_img2: Joi.string().max(255).presence(required),
    main_bottom_img: Joi.string().max(255).presence(required),
    bottom_img1: Joi.string().max(255).presence(required),
    bottom_img2: Joi.string().max(255).presence(required),
    bottom_img3: Joi.string().max(255).presence(required),
    id_models_image: Joi.number().optional(),
    id: Joi.number().optional(),
  }).validate(req.body, { abortEarly: false }).error;
  if (errors) {
    next(new ErrorHandler(422, errors.message));
  } else {
    next();
  }
};

const modelsImageExists = (req: Request, res: Response, next: NextFunction) => {
  const { id_models_image } = req.params;
  getById(Number(id_models_image)).then((modelsImage: IModelsImage) => {
    if (!modelsImage) {
      next(new ErrorHandler(404, `This modelsImage doesn't exist`));
    } else {
      next();
    }
  });
};

//////////// CRUD models of modelsImage /////////////
const getAllModelsImages = (sortBy = ''): Promise<IModelsImage[]> => {
  let sql = 'SELECT *, id_models_image as id FROM models_images';
  if (sortBy) {
    sql += ` ORDER BY ${sortBy}`;
  }
  return connection
    .promise()
    .query<IModelsImage[]>(sql)
    .then(([results]) => results);
};

const getById = (id_models_image: number): Promise<IModelsImage> => {
  return connection
    .promise()
    .query<IModelsImage[]>(
      'select *, id_models_image as id from models_images where id_models_image=?',
      [id_models_image]
    )
    .then(([results]) => results[0]);
};

const updateModelsImage = (
  id_models_image: number,
  modelsImage: IModelsImage
): Promise<boolean> => {
  let sql = 'UPDATE models_images SET';
  const sqlValues: (string | number)[] = [];
  let oneValue = false;

  if (modelsImage.main_img1) {
    sql += ' main_img1 = ? ';
    sqlValues.push(modelsImage.main_img1);
    oneValue = true;
  }
  if (modelsImage.main_img2) {
    sql += oneValue ? ', main_img2 = ? ' : ' main_img2 = ? ';
    sqlValues.push(modelsImage.main_img2);
    oneValue = true;
  }
  if (modelsImage.main_img3) {
    sql += oneValue ? ', main_img3 = ? ' : ' main_img3 = ? ';
    sqlValues.push(modelsImage.main_img3);
    oneValue = true;
  }
  if (modelsImage.main_img4) {
    sql += oneValue ? ', main_img4 = ? ' : ' main_img4 = ? ';
    sqlValues.push(modelsImage.main_img4);
    oneValue = true;
  }
  if (modelsImage.sidetitle_img1) {
    sql += oneValue ? ', sidetitle_img1 = ? ' : ' sidetitle_img1 = ? ';
    sqlValues.push(modelsImage.sidetitle_img1);
    oneValue = true;
  }
  if (modelsImage.sidetitle_img2) {
    sql += oneValue ? ', sidetitle_img2 = ? ' : ' sidetitle_img2 = ? ';
    sqlValues.push(modelsImage.sidetitle_img2);
    oneValue = true;
  }
  if (modelsImage.page_img1) {
    sql += oneValue ? ', page_img1 = ? ' : ' page_img1 = ? ';
    sqlValues.push(modelsImage.page_img1);
    oneValue = true;
  }
  if (modelsImage.page_img2) {
    sql += oneValue ? ', page_img2 = ? ' : ' page_img2 = ? ';
    sqlValues.push(modelsImage.page_img2);
    oneValue = true;
  }
  if (modelsImage.middle_img1) {
    sql += oneValue ? ', middle_img1 = ? ' : ' middle_img1 = ? ';
    sqlValues.push(modelsImage.middle_img1);
    oneValue = true;
  }
  if (modelsImage.middle_img2) {
    sql += oneValue ? ', middle_img2 = ? ' : ' middle_img2 = ? ';
    sqlValues.push(modelsImage.middle_img2);
    oneValue = true;
  }
  if (modelsImage.main_bottom_img) {
    sql += oneValue ? ', main_bottom_img = ? ' : ' main_bottom_img = ? ';
    sqlValues.push(modelsImage.main_bottom_img);
    oneValue = true;
  }
  if (modelsImage.bottom_img1) {
    sql += oneValue ? ', bottom_img1 = ? ' : ' bottom_img1 = ? ';
    sqlValues.push(modelsImage.bottom_img1);
    oneValue = true;
  }
  if (modelsImage.bottom_img2) {
    sql += oneValue ? ', bottom_img2 = ? ' : ' bottom_img2 = ? ';
    sqlValues.push(modelsImage.bottom_img2);
    oneValue = true;
  }
  if (modelsImage.bottom_img3) {
    sql += oneValue ? ', bottom_img3 = ? ' : ' bottom_img3 = ? ';
    sqlValues.push(modelsImage.bottom_img3);
    oneValue = true;
  }

  sql += ' WHERE id_models_image = ?';
  sqlValues.push(id_models_image);

  return connection
    .promise()
    .query<ResultSetHeader>(sql, sqlValues)
    .then(([results]) => results.affectedRows === 1);
};

export {
  validateModelsImage,
  modelsImageExists,
  getAllModelsImages,
  getById,
  updateModelsImage,
};
