import connection from '../db-config';
import IModel from '../interfaces/IModel';
import { ResultSetHeader } from 'mysql2';

const getAllModels = (): Promise<IModel[]> => {
  return connection
    .promise()
    .query<IModel[]>(
      'select * from models inner join collections on collections.id_collection=models.id_collection'
    )
    .then(([results]) => results);
};

const getById = (id_model: number): Promise<IModel> => {
  return connection
    .promise()
    .query<IModel[]>(
      'select * from models inner join collections on collections.id_collection=models.id_collection where id_model=?',
      [id_model]
    )
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
      [model.name, model.id_collection, model.main_img, model.img_2, model.img_3, model.img_4, model.img_5, model.text]
    )
    .then(([results]) => {
      const id_model = results.insertId;
      const { name, id_collection, main_img, img_2, img_3, img_4, img_5, text } = model;
      return {
        id_model,
        name,
        id_collection,
        main_img,
        img_2,
        img_3,
        img_4,
        img_5,
        text
      };
    });
};

const updateModel = (id_model: number, model: IModel): Promise<boolean> => {
  console.log(id_model);
  return connection
    .promise()
    .query<ResultSetHeader>(
      `UPDATE models SET name = ?, id_collection = ? WHERE id_model = ?`,
      [model.name, model.id_collection, id_model]
    )
    .then(([results]) => results.affectedRows === 1);
};

const deleteModel = (id_model: number): Promise<boolean> => {
  return connection
    .promise()
    .query<ResultSetHeader>('DELETE FROM models WHERE id_model = ?', [id_model])
    .then(([results]) => results.affectedRows === 1);
};

export {
  getAllModels,
  getById,
  updateModel,
  deleteModel,
  addModel,
  getByCollection,
};
