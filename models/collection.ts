import connection from '../db-config';
import Joi from 'joi';
import { ResultSetHeader } from 'mysql2';
import { NextFunction, Request, Response } from 'express';
import { ErrorHandler } from '../helpers/errors';
import ICollection from '../interfaces/ICollection';

//////////// Collection middlewares /////////////
const validateCollection = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let required: Joi.PresenceMode = 'optional';
  if (req.method === 'POST') {
    required = 'required';
  }
  const errors = Joi.object({
    name: Joi.string().max(255).presence(required),
    id_collection: Joi.number().optional(),
    id: Joi.number().optional(),
  }).validate(req.body, { abortEarly: false }).error;
  if (errors) {
    next(new ErrorHandler(422, errors.message));
  } else {
    next();
  }
};

const collectionExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id_collection } = req.params;
  const collectionExists: ICollection = await getCollectionById(
    Number(id_collection)
  );
  if (!collectionExists) {
    next(new ErrorHandler(404, `This collection doesn't exist`));
  } else {
    req.record = collectionExists; // because we need deleted record to be sent after a delete in react-admin
    next();
  }
};

//////////// CRUD models of collection /////////////
const getAllCollections = (sortBy = ''): Promise<ICollection[]> => {
  let sql = 'SELECT *, id_collection as id FROM collections';
  if (sortBy) {
    sql += ` ORDER BY ${sortBy}`;
  }
  return connection
    .promise()
    .query<ICollection[]>(sql)
    .then(([results]) => results);
};

const getCollectionById = (idCollection: number): Promise<ICollection> => {
  return connection
    .promise()
    .query<ICollection[]>(
      'SELECT *, id_collection as id FROM collections WHERE id_collection = ?',
      [idCollection]
    )
    .then(([results]) => results[0]);
};

const addCollection = (collection: ICollection) => {
  return connection
    .promise()
    .query<ResultSetHeader>('INSERT INTO collections (name) VALUES (?)', [
      collection.name,
    ])
    .then(([results]) => {
      const id_collection = results.insertId;
      const { name } = collection;
      return {
        id_collection,
        name,
      };
    });
};

const updateCollection = (
  id_collection: number,
  collection: ICollection
): Promise<boolean> => {
  return connection
    .promise()
    .query<ResultSetHeader>(
      `UPDATE collections SET name = ? WHERE id_collection = ?`,
      [collection.name, id_collection]
    )
    .then(([results]) => results.affectedRows === 1);
};

const deleteCollection = (id_collection: number): Promise<boolean> => {
  return connection
    .promise()
    .query<ResultSetHeader>('DELETE FROM collections WHERE id_collection = ?', [
      id_collection,
    ])
    .then(([results]) => results.affectedRows === 1);
};

export {
  validateCollection,
  collectionExists,
  getAllCollections,
  getCollectionById,
  addCollection,
  updateCollection,
  deleteCollection,
};
