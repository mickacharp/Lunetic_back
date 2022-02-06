import connection from '../db-config';
import Joi from 'joi';
import { ResultSetHeader } from 'mysql2';
import { NextFunction, Request, Response } from 'express';
import { ErrorHandler } from '../helpers/errors';
import IModel from '../interfaces/IModel';

//////////// Model middlewares /////////////
const validateModel = (req: Request, res: Response, next: NextFunction) => {
  let required: Joi.PresenceMode = 'optional';
  if (req.method === 'POST') {
    required = 'required';
  }
  const errors = Joi.object({
    name: Joi.string().max(100).presence(required),
    id_collection: Joi.number().presence(required),
    main_img: Joi.string().max(255).presence(required),
    img_2: Joi.string().max(255).allow('', null),
    img_3: Joi.string().max(255).allow('', null),
    img_4: Joi.string().max(255).allow('', null),
    img_5: Joi.string().max(255).allow('', null),
    text: Joi.string().max(1500).allow('', null),
    id_model: Joi.number().optional(),
    id: Joi.number().optional(),
  }).validate(req.body, { abortEarly: false }).error;
  if (errors) {
    next(new ErrorHandler(422, errors.message));
  } else {
    next();
  }
};

const modelExists = (req: Request, res: Response, next: NextFunction) => {
  const { id_model } = req.params;
  getById(Number(id_model)).then((modelExists: IModel) => {
    if (!modelExists) {
      next(new ErrorHandler(404, `This model doesn't exist`));
    } else {
      req.record = modelExists; // because we need deleted record to be sent after a delete in react-admin
      next();
    }
  });
};

//////////// CRUD models of model /////////////
const getAllModels = (sortBy = ''): Promise<IModel[]> => {
  let sql = 'SELECT *, id_model as id FROM models';
  if (sortBy) {
    sql += ` ORDER BY ${sortBy}`;
  }
  return connection
    .promise()
    .query<IModel[]>(sql)
    .then(([results]) => results);
};

const getById = (id_model: number): Promise<IModel> => {
  return connection
    .promise()
    .query<IModel[]>('select *, id_model as id from models where id_model=?', [
      id_model,
    ])
    .then(([results]) => results[0]);
};

const getByCollection = (id_collection: number): Promise<IModel[]> => {
  return connection
    .promise()
    .query<IModel[]>('select * from models where id_collection=?', [
      id_collection,
    ])
    .then(([results]) => results);
};

const addModel = (model: IModel) => {
  return connection
    .promise()
    .query<ResultSetHeader>(
      'INSERT INTO models (name, id_collection, main_img, img_2, img_3, img_4, img_5, text) VALUES (?,?,?,?,?,?,?,?)',
      [
        model.name,
        model.id_collection,
        model.main_img,
        model.img_2,
        model.img_3,
        model.img_4,
        model.img_5,
        model.text,
      ]
    )
    .then(([results]) => {
      const id_model = results.insertId;
      const {
        name,
        id_collection,
        main_img,
        img_2,
        img_3,
        img_4,
        img_5,
        text,
      } = model;
      return {
        id_model,
        name,
        id_collection,
        main_img,
        img_2,
        img_3,
        img_4,
        img_5,
        text,
      };
    });
};

const updateModel = (id_model: number, model: IModel): Promise<boolean> => {
  let sql = 'UPDATE models SET';
  const sqlValues: (string | number)[] = [];
  let oneValue = false;

  if (model.name) {
    sql += ' name = ? ';
    sqlValues.push(model.name);
    oneValue = true;
  }
  if (model.id_collection) {
    sql += oneValue ? ', id_collection = ? ' : ' id_collection = ? ';
    sqlValues.push(model.id_collection);
    oneValue = true;
  }
  if (model.main_img) {
    sql += oneValue ? ', main_img = ? ' : ' main_img = ? ';
    sqlValues.push(model.main_img);
    oneValue = true;
  }
  if (model.img_2) {
    sql += oneValue ? ', img_2 = ? ' : ' img_2 = ? ';
    sqlValues.push(model.img_2);
    oneValue = true;
  }
  if (model.img_3) {
    sql += oneValue ? ', img_3 = ? ' : ' img_3 = ? ';
    sqlValues.push(model.img_3);
    oneValue = true;
  }
  if (model.img_4) {
    sql += oneValue ? ', img_4 = ? ' : ' img_4 = ? ';
    sqlValues.push(model.img_4);
    oneValue = true;
  }
  if (model.img_5) {
    sql += oneValue ? ', img_5 = ? ' : ' img_5 = ? ';
    sqlValues.push(model.img_5);
    oneValue = true;
  }
  if (model.text) {
    sql += oneValue ? ', text = ? ' : ' text = ? ';
    sqlValues.push(model.text);
    oneValue = true;
  }

  sql += ' WHERE id_model = ?';
  sqlValues.push(id_model);

  return connection
    .promise()
    .query<ResultSetHeader>(sql, sqlValues)
    .then(([results]) => results.affectedRows === 1);
};

const deleteModel = (id_model: number): Promise<boolean> => {
  return connection
    .promise()
    .query<ResultSetHeader>('DELETE FROM models WHERE id_model = ?', [id_model])
    .then(([results]) => results.affectedRows === 1);
};

export {
  validateModel,
  modelExists,
  getAllModels,
  getById,
  getByCollection,
  addModel,
  updateModel,
  deleteModel,
};
