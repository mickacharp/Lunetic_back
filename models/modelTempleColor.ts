import connection from '../db-config';
import IModelTempleColor from '../interfaces/IModelTempleColor';
import { ResultSetHeader } from 'mysql2';

const getAllModels = (): Promise<IModelTempleColor[]> => {
  return connection
    .promise()
    .query<IModelTempleColor[]>(
      'SELECT * FROM models_temples_colors'
    )
    .then(([results]) => results);
};

const getById = (id_model_temple_color: number): Promise<IModelTempleColor> => {
  return connection
    .promise()
    .query<IModelTempleColor[]>(
      'SELECT * FROM models_temples_colors WHERE id_model_temple_color = ?',
      [id_model_temple_color]
    )
    .then(([results]) => results[0]);
};

const addModelTempleColor = (modelTempleColor: IModelTempleColor) => {
  return connection
    .promise()
    .query<ResultSetHeader>(
      'INSERT INTO models_temples_colors (id_color_temple, id_model, id_color_model, id_temple, id_wishlist) VALUES (?,?,?,?,?)',
      [modelTempleColor.id_color_temple, modelTempleColor.id_model, modelTempleColor.id_color_model, modelTempleColor.id_temple, modelTempleColor.id_wishlist]
    )
    .then(([results]) => {
      const id_model_temple_color = results.insertId;
      const { id_color_temple, id_model, id_color_model, id_temple, id_wishlist } = modelTempleColor;
      return {
        id_model_temple_color,
        id_color_temple,
        id_model,
        id_color_model,
        id_temple,
        id_wishlist
      };
    });
};

const deleteModel = (id_model_temple_color: number): Promise<boolean> => {
  return connection
    .promise()
    .query<ResultSetHeader>('DELETE FROM models_temples_colors WHERE id_model_temple_color = ?', [id_model_temple_color])
    .then(([results]) => results.affectedRows === 1);
};

export {
  getAllModels,
  getById,
  deleteModel,
  addModelTempleColor,
};
