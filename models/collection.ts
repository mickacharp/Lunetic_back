import connection from '../db-config';
import Joi from 'joi';
import argon2, { Options } from 'argon2';
import { ResultSetHeader } from 'mysql2';
import { NextFunction, Request, Response } from 'express';
import { ErrorHandler } from '../helpers/errors';
import { builtinModules } from 'module';
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

export { getAllCollections, getCollectionById };
