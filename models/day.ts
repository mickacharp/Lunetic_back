import connection from '../db-config';
import IOptician from '../interfaces/IOptician';

const getById = (id_day: number): Promise<IOptician> => {
  return connection
    .promise()
    .query<IOptician[]>('SELECT * FROM days WHERE id_day = ?', [id_day])
    .then(([results]) => results[0]);
};

export { getById };
