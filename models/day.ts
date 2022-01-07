import connection from '../db-config';
import IDay from '../interfaces/IDay';

const getAllDays = (): Promise<IDay[]> => {
  return connection
    .promise()
    .query<IDay[]>('select * from days')
    .then(([results]) => results);
};

const getById = (id_day: number): Promise<IDay> => {
  return connection
    .promise()
    .query<IDay[]>('SELECT * FROM days WHERE id_day = ?', [id_day])
    .then(([results]) => results[0]);
};

export { getById, getAllDays };
