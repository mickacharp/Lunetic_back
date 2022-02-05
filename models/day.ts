import connection from '../db-config';
import IDay from '../interfaces/IDay';

const getAllDays = (): Promise<IDay[]> => {
  return connection
    .promise()
    .query<IDay[]>('select *, id_day as id from days')
    .then(([results]) => results);
};

const getById = (id_day: number): Promise<IDay> => {
  return connection
    .promise()
    .query<IDay[]>('SELECT *, id_day as id FROM days WHERE id_day = ?', [
      id_day,
    ])
    .then(([results]) => results[0]);
};

export { getById, getAllDays };
