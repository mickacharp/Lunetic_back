import connection from '../db-config';
import Joi from 'joi';
import { ResultSetHeader } from 'mysql2';
import { NextFunction, Request, Response } from 'express';
import { ErrorHandler } from '../helpers/errors';
import ITemple from '../interfaces/ITemple';

//////////// Temple middlewares /////////////
const validateTemple = (req: Request, res: Response, next: NextFunction) => {
  let required: Joi.PresenceMode = 'optional';
  if (req.method === 'POST') {
    required = 'required';
  }
  const errors = Joi.object({
    name: Joi.string().max(100).presence(required),
    id_collection: Joi.number().presence(required),
    id_temple: Joi.number().optional(),
    id: Joi.number().optional(),
  }).validate(req.body, { abortEarly: false }).error;
  if (errors) {
    next(new ErrorHandler(422, errors.message));
  } else {
    next();
  }
};

const templeExists = (req: Request, res: Response, next: NextFunction) => {
  const { id_temple } = req.params;
  getTempleById(Number(id_temple)).then((templeExists: ITemple) => {
    if (!templeExists) {
      next(new ErrorHandler(404, `This temple doesn't exist`));
    } else {
      req.record = templeExists; // because we need deleted record to be sent after a delete in react-admin
      next();
    }
  });
};

//////////// CRUD models of temple /////////////
const getAllTemples = (sortBy = ''): Promise<ITemple[]> => {
  let sql = 'SELECT *, id_temple as id FROM temples';
  if (sortBy) {
    sql += ` ORDER BY ${sortBy}`;
  }
  return connection
    .promise()
    .query<ITemple[]>(sql)
    .then(([results]) => results);
};

const getTempleById = (id_temple: number): Promise<ITemple> => {
  return connection
    .promise()
    .query<ITemple[]>(
      'SELECT *, id_temple as id FROM temples WHERE id_temple = ?',
      [id_temple]
    )
    .then(([results]) => results[0]);
};

const getTempleByCollection = (id_collection: number) => {
  return connection
    .promise()
    .query<ITemple[]>(
      'SELECT *, id_temple as id FROM temples WHERE id_collection = ?',
      [id_collection]
    )
    .then(([results]) => results);
};

const addTemple = (temple: ITemple) => {
  return connection
    .promise()
    .query<ResultSetHeader>(
      'INSERT INTO temples (name, id_collection) VALUES (?,?)',
      [temple.name, temple.id_collection]
    )
    .then(([results]) => {
      const id_temple = results.insertId;
      const { name, id_collection } = temple;
      return {
        id_temple,
        name,
        id_collection,
      };
    });
};

const updateTemple = (id_temple: number, temple: ITemple): Promise<boolean> => {
  let sql = 'UPDATE temples SET ';
  const sqlValues: (string | number)[] = [];
  let oneValue = false;

  if (temple.name) {
    sql += 'name = ? ';
    sqlValues.push(temple.name);
    oneValue = true;
  }

  if (temple.id_collection) {
    sql += oneValue ? ', id_collection = ? ' : 'id_collection = ? ';
    sqlValues.push(temple.id_collection);
    oneValue = true;
  }

  sql += 'WHERE id_temple = ?';
  sqlValues.push(id_temple);

  return connection
    .promise()
    .query<ResultSetHeader>(sql, sqlValues)
    .then(([results]) => results.affectedRows === 1);
};

const deleteTemple = (id_temple: number): Promise<boolean> => {
  return connection
    .promise()
    .query<ResultSetHeader>('DELETE FROM temples WHERE id_temple = ?', [
      id_temple,
    ])
    .then(([results]) => results.affectedRows === 1);
};

export {
  validateTemple,
  templeExists,
  getAllTemples,
  getTempleById,
  getTempleByCollection,
  addTemple,
  updateTemple,
  deleteTemple,
};
