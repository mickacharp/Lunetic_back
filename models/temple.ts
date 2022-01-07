import connection from '../db-config';
import { ResultSetHeader } from 'mysql2';

import ITemple from '../interfaces/ITemple';

const getAllTemples = (): Promise<ITemple[]> => {
  return connection
    .promise()
    .query<ITemple[]>('SELECT * FROM temples')
    .then(([results]) => results);
};

const getTempleById = (id_temple: number): Promise<ITemple> => {
  return connection
    .promise()
    .query<ITemple[]>('SELECT * FROM temples WHERE id_temple = ?', [id_temple])
    .then(([results]) => results[0]);
};

const getTempleByCollection = (id_collection: number) => {
  return connection
    .promise()
    .query<ITemple[]>('SELECT * FROM temples WHERE id_collection = ?', [
      id_collection,
    ])
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
  const sqlValues: Array<string | number> = [];
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
  getAllTemples,
  getTempleById,
  getTempleByCollection,
  addTemple,
  updateTemple,
  deleteTemple,
};
