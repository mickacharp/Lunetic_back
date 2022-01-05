import connection from '../db-config';
import IOptician from '../interfaces/IOptician';

const getAllModels = (): Promise<IOptician[]> => {
  return connection
    .promise()
    .query<IOptician[]>(
      'select * from models inner join collections on collections.id_collection=models.id_collection'
    )
    .then(([results]) => results);
};

const getById = (id_model: number): Promise<IOptician> => {
  console.log(id_model);
  return connection
    .promise()
    .query<IOptician[]>(
      'select * from models inner join collections on collections.id_collection=models.id_collection where id_model=?',
      [id_model]
    )
    .then(([results]) => results[0]);
};

export { getAllModels, getById };
