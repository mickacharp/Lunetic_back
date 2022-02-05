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

const getByIdWishlist = (id_wishlist: number): Promise<IModelTempleColor[]> => {
  return connection
    .promise()
    .query<IModelTempleColor[]>(
      'SELECT mtc.*, m.name AS name_model, m.main_img, c.name AS name_color FROM models_temples_colors mtc INNER JOIN models m ON mtc.id_model = m.id_model INNER JOIN colors c ON mtc.id_color_model = c.id_color WHERE id_wishlist = ? ORDER BY id_model_temple_color',
      [id_wishlist]
    )
    .then(([results]) => results);
}

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
  getByIdWishlist,
  deleteModel,
  addModelTempleColor,
};
