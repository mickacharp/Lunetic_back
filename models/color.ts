import connection from '../db-config';
import Joi from 'joi';
import { ResultSetHeader } from 'mysql2';
import { NextFunction, Request, Response } from 'express';
import { ErrorHandler } from '../helpers/errors';
import IColor from '../interfaces/IColor';

//////////// Color middlewares /////////////
const validateColor = (req: Request, res: Response, next: NextFunction) => {
  let required: Joi.PresenceMode = 'optional';
  if (req.method === 'POST') {
    required = 'required';
  }
  const errors = Joi.object({
    name: Joi.string().max(50).presence(required),
    id_color: Joi.number().optional(),
    id: Joi.number().optional(),
  }).validate(req.body, { abortEarly: false }).error;
  if (errors) {
    next(new ErrorHandler(422, errors.message));
  } else {
    next();
  }
};

const colorExists = (req: Request, res: Response, next: NextFunction) => {
  const { id_color } = req.params;
  getColorById(Number(id_color)).then((colorExists: IColor) => {
    if (!colorExists) {
      next(new ErrorHandler(404, `This color doesn't exist`));
    } else {
      req.record = colorExists; // because we need deleted record to be sent after a delete in react-admin
      next();
    }
  });
};

//////////// CRUD models of color /////////////
const getAllColors = (sortBy = ''): Promise<IColor[]> => {
  let sql = 'SELECT *, id_color as id FROM colors';
  if (sortBy) {
    sql += ` ORDER BY ${sortBy}`;
  }
  return connection
    .promise()
    .query<IColor[]>(sql)
    .then(([results]) => results);
};

const getColorById = (idColor: number): Promise<IColor> => {
  return connection
    .promise()
    .query<IColor[]>(
      'SELECT *, id_color as id FROM colors WHERE id_color = ?',
      [idColor]
    )
    .then(([results]) => results[0]);
};

const addColor = (color: IColor) => {
  return connection
    .promise()
    .query<ResultSetHeader>('INSERT INTO colors (name) VALUES (?)', [
      color.name,
    ])
    .then(([results]) => {
      const id_color = results.insertId;
      const { name } = color;
      return {
        id_color,
        name,
      };
    });
};

const updateColor = (id_color: number, color: IColor): Promise<boolean> => {
  return connection
    .promise()
    .query<ResultSetHeader>(`UPDATE colors SET name = ? WHERE id_color = ?`, [
      color.name,
      id_color,
    ])
    .then(([results]) => results.affectedRows === 1);
};

const deleteColor = (id_color: number): Promise<boolean> => {
  return connection
    .promise()
    .query<ResultSetHeader>('DELETE FROM colors WHERE id_color = ?', [id_color])
    .then(([results]) => results.affectedRows === 1);
};

export {
  validateColor,
  colorExists,
  getAllColors,
  getColorById,
  addColor,
  updateColor,
  deleteColor,
};
