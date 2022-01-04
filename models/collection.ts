import connection from '../db-config';
import Joi from 'joi';
import { ResultSetHeader } from 'mysql2';
import { NextFunction, Request, Response } from 'express';
import { ErrorHandler } from '../helpers/errors';
import ICollection from '../interfaces/ICollection';

const getAllCollections = (): Promise<ICollection[]> => {
  return connection
    .promise()
    .query<ICollection[]>('SELECT * FROM collections')
    .then(([results]) => results);
};

const getCollectionById = (idCollection: number): Promise<ICollection> => {
  return connection
    .promise()
    .query<ICollection[]>('SELECT * FROM collections WHERE id_collection = ?', [
      idCollection,
    ])
    .then(([results]) => results[0]);
};

const deleteCollection = (id_collection: number): Promise<boolean> => {
  return connection
    .promise()
    .query<ResultSetHeader>('DELETE FROM collections WHERE id_collection = ?', [
      id_collection,
    ])
    .then(([results]) => results.affectedRows === 1);
};

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
  }).validate(req.body, { abortEarly: false }).error;
  if (error) {
    next(new ErrorHandler(422, error.message));
  } else {
    next();
  }
};

export {
  getAllCollections,
  getCollectionById,
  deleteCollection,
  validateCollection,
};
