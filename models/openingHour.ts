import connection from '../db-config';
import Joi from 'joi';
import { ResultSetHeader } from 'mysql2';
import { NextFunction, Request, Response } from 'express';
import { ErrorHandler } from '../helpers/errors';
import IOpeningHour from '../interfaces/IOpeningHour';

const validateOpeningHour = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let required: Joi.PresenceMode = 'optional';
  if (req.method === 'POST') {
    required = 'required';
  }
  const errors = Joi.object({
    start_morning: Joi.string().max(45).allow('', null),
    end_morning: Joi.string().max(45).allow('', null),
    start_afternoon: Joi.string().max(45).allow('', null),
    end_afternoon: Joi.string().max(45).allow('', null),
    id_optician: Joi.number().presence(required),
    id_day: Joi.number().presence(required),
  }).validate(req.body, { abortEarly: false }).error;
  if (errors) {
    next(new ErrorHandler(422, errors.message));
  } else {
    next();
  }
};

const getAllOpeningHour = (sortBy: string = ''): Promise<IOpeningHour[]> => {
  let sql: string = 'SELECT *, id_opening_hour as id FROM opening_hours';
  if (sortBy) {
    sql += ` ORDER BY ${sortBy}`;
  }
  return connection
    .promise()
    .query<IOpeningHour[]>(sql)
    .then(([results]) => results);
};

const addOpeningHours = (openingHours: IOpeningHour) => {
  return connection
    .promise()
    .query<ResultSetHeader>(
      'INSERT INTO opening_hours (start_morning, end_morning, start_afternoon, end_afternoon, id_optician, id_day) VALUES (?, ?, ?, ?, ?, ?)',
      [
        openingHours.start_morning,
        openingHours.end_morning,
        openingHours.start_afternoon,
        openingHours.end_afternoon,
        openingHours.id_optician,
        openingHours.id_day,
      ]
    )
    .then(([results]) => {
      const id_opening_hours = results.insertId;
      const {
        start_morning,
        end_morning,
        start_afternoon,
        end_afternoon,
        id_optician,
        id_day,
      } = openingHours;
      return {
        id_opening_hours,
        start_morning,
        end_morning,
        start_afternoon,
        end_afternoon,
        id_optician,
        id_day,
      };
    });
};

const getById = (id_opening_hour: number): Promise<IOpeningHour> => {
  return connection
    .promise()
    .query<IOpeningHour[]>(
      'SELECT * FROM opening_hours WHERE id_opening_hour = ?',
      [id_opening_hour]
    )
    .then(([results]) => results[0]);
};

const getByOptician = (id_optician: number): Promise<IOpeningHour> => {
  return connection
    .promise()
    .query<IOpeningHour[0]>(
      'SELECT * FROM opening_hours WHERE id_optician = ?',
      [id_optician]
    )
    .then((results) => results[0]);
};

const openingHourExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id_opening_hour } = req.params;
  const openingHourExists: IOpeningHour = await getById(
    Number(id_opening_hour)
  );
  if (!openingHourExists) {
    next(new ErrorHandler(404, `This opening hour doesn't exist`));
  } else {
    next();
  }
};

const updateOpeningHour = async (
  id_opening_hour: number,
  openingHour: IOpeningHour
): Promise<boolean> => {
  let sql = 'UPDATE opening_hours SET';
  const sqlValues: Array<string | number> = [];
  let oneValue = false;

  if (openingHour.start_morning) {
    sql += ' start_morning = ? ';
    sqlValues.push(openingHour.start_morning);
    oneValue = true;
  }
  if (openingHour.end_morning) {
    sql += oneValue ? ', end_morning = ? ' : ' end_morning = ? ';
    sqlValues.push(openingHour.end_morning);
    oneValue = true;
  }
  if (openingHour.start_afternoon) {
    sql += oneValue ? ', start_afternoon = ? ' : ' start_afternoon = ? ';
    sqlValues.push(openingHour.start_afternoon);
    oneValue = true;
  }
  if (openingHour.end_afternoon) {
    sql += oneValue ? ', end_afternoon = ? ' : ' end_afternoon = ? ';
    sqlValues.push(openingHour.end_afternoon);
    oneValue = true;
  }
  if (openingHour.id_optician) {
    sql += oneValue ? ', id_optician = ? ' : ' id_optician = ? ';
    sqlValues.push(openingHour.id_optician);
    oneValue = true;
  }
  if (openingHour.id_day) {
    sql += oneValue ? ', id_day = ? ' : ' id_day = ? ';
    sqlValues.push(openingHour.id_day);
    oneValue = true;
  }

  sql += ' WHERE id_opening_hour = ?';
  sqlValues.push(id_opening_hour);

  return connection
    .promise()
    .query<ResultSetHeader>(sql, sqlValues)
    .then(([results]) => results.affectedRows === 1);
};

const deleteOpeningHour = (id_opening_hour: number): Promise<boolean> => {
  return connection
    .promise()
    .query<ResultSetHeader>(
      'DELETE FROM opening_hours WHERE id_opening_hour = ?',
      [id_opening_hour]
    )
    .then(([results]) => results.affectedRows === 1);
};

export {
  validateOpeningHour,
  getAllOpeningHour,
  addOpeningHours,
  openingHourExists,
  updateOpeningHour,
  deleteOpeningHour,
  getByOptician,
};
