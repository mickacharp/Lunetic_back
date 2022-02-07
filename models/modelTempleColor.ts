import connection from '../db-config';
import Joi from 'joi';
import { ResultSetHeader } from 'mysql2';
import { NextFunction, Request, Response } from 'express';
import { ErrorHandler } from '../helpers/errors';
import IModelTempleColor from '../interfaces/IModelTempleColor';

//////////// ModelTempleColor middlewares /////////////
const validateModelTempleColor = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let required: Joi.PresenceMode = 'optional';
  if (req.method === 'POST') {
    required = 'required';
  }
  const errors = Joi.object({
    id_temple: Joi.optional(),
    id_color_temple: Joi.optional(),
    id_model: Joi.number().presence(required),
    id_color_model: Joi.number().presence(required),
    id_wishlist: Joi.number().presence(required),
    id_model_temple_color: Joi.number().optional(),
    id: Joi.number().optional(),
  }).validate(req.body, { abortEarly: false }).error;
  if (errors) {
    next(new ErrorHandler(422, errors.message));
  } else {
    next();
  }
};

const modelTempleColorExists = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id_model_temple_color } = req.params;
  getById(Number(id_model_temple_color)).then(
    (modelTempleColorExists: IModelTempleColor) => {
      if (!modelTempleColorExists) {
        next(new ErrorHandler(404, `This product doesn't exist`));
      } else {
        req.record = modelTempleColorExists; // because we need deleted record to be sent after a delete in react-admin
        next();
      }
    }
  );
};

//////////// CRUD models of modelTempleColor /////////////
const getAllModelsTemplesColors = (
  sortBy = ''
): Promise<IModelTempleColor[]> => {
  let sql = 'SELECT *, id_model_temple_color as id FROM models_temples_colors';
  if (sortBy) {
    sql += ` ORDER BY ${sortBy}`;
  }
  return connection
    .promise()
    .query<IModelTempleColor[]>(sql)
    .then(([results]) => results);
};

const getById = (id_model_temple_color: number): Promise<IModelTempleColor> => {
  return connection
    .promise()
    .query<IModelTempleColor[]>(
      'SELECT *, id_model_temple_color as id FROM models_temples_colors WHERE id_model_temple_color = ?',
      [id_model_temple_color]
    )
    .then(([results]) => results[0]);
};

const getByIdWishlist = (id_wishlist: number): Promise<IModelTempleColor[]> => {
  return connection
    .promise()
    .query<IModelTempleColor[]>(
      'SELECT mtc.*, mtc.id_model_temple_color as id, m.name AS name_model, m.main_img, c.name AS name_color FROM models_temples_colors mtc INNER JOIN models m ON mtc.id_model = m.id_model INNER JOIN colors c ON mtc.id_color_model = c.id_color WHERE id_wishlist = ? ORDER BY id_model_temple_color',
      [id_wishlist]
    )
    .then(([results]) => results);
};

const addModelTempleColor = (modelTempleColor: IModelTempleColor) => {
  return connection
    .promise()
    .query<ResultSetHeader>(
      'INSERT INTO models_temples_colors (id_temple, id_color_temple, id_model, id_color_model, id_wishlist) VALUES (?,?,?,?,?)',
      [
        modelTempleColor.id_temple,
        modelTempleColor.id_color_temple,
        modelTempleColor.id_model,
        modelTempleColor.id_color_model,
        modelTempleColor.id_wishlist,
      ]
    )
    .then(([results]) => {
      const id_model_temple_color = results.insertId;
      const {
        id_temple,
        id_color_temple,
        id_model,
        id_color_model,
        id_wishlist,
      } = modelTempleColor;
      return {
        id_model_temple_color,
        id_temple,
        id_color_temple,
        id_model,
        id_color_model,
        id_wishlist,
      };
    });
};

const updateModelTempleColor = (
  id_model_temple_color: number,
  modelTempleColor: IModelTempleColor
): Promise<boolean> => {
  let sql = 'UPDATE models_temples_colors SET';
  const sqlValues: (string | number)[] = [];
  let oneValue = false;

  if (modelTempleColor.id_temple) {
    sql += ' id_temple = ? ';
    sqlValues.push(modelTempleColor.id_temple);
    oneValue = true;
  }
  if (modelTempleColor.id_color_temple) {
    sql += oneValue ? ', id_color_temple = ? ' : ' id_color_temple = ? ';
    sqlValues.push(modelTempleColor.id_color_temple);
    oneValue = true;
  }
  if (modelTempleColor.id_model) {
    sql += oneValue ? ', id_model = ? ' : ' id_model = ? ';
    sqlValues.push(modelTempleColor.id_model);
    oneValue = true;
  }
  if (modelTempleColor.id_color_model) {
    sql += oneValue ? ', id_color_model = ? ' : ' id_color_model = ? ';
    sqlValues.push(modelTempleColor.id_color_model);
    oneValue = true;
  }

  if (modelTempleColor.id_wishlist) {
    sql += oneValue ? ', id_wishlist = ? ' : ' id_wishlist = ? ';
    sqlValues.push(modelTempleColor.id_wishlist);
    oneValue = true;
  }

  sql += ' WHERE id_model_temple_color = ?';
  sqlValues.push(id_model_temple_color);

  return connection
    .promise()
    .query<ResultSetHeader>(sql, sqlValues)
    .then(([results]) => results.affectedRows === 1);
};

const deleteModelTempleColor = (
  id_model_temple_color: number
): Promise<boolean> => {
  return connection
    .promise()
    .query<ResultSetHeader>(
      'DELETE FROM models_temples_colors WHERE id_model_temple_color = ?',
      [id_model_temple_color]
    )
    .then(([results]) => results.affectedRows === 1);
};

export {
  validateModelTempleColor,
  modelTempleColorExists,
  getAllModelsTemplesColors,
  getById,
  getByIdWishlist,
  addModelTempleColor,
  updateModelTempleColor,
  deleteModelTempleColor,
};
