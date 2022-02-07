import connection from '../db-config';
import Joi from 'joi';
import { ResultSetHeader } from 'mysql2';
import { NextFunction, Request, Response } from 'express';
import { ErrorHandler } from '../helpers/errors';
import IOpeningHour from '../interfaces/IOpeningHour';

//////////// OpeningHour middlewares /////////////
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
    id_opening_hour: Joi.number().optional(),
    id: Joi.number().optional(),
  }).validate(req.body, { abortEarly: false }).error;
  if (errors) {
    next(new ErrorHandler(422, errors.message));
  } else {
    next();
  }
};

const openingHourExists = (req: Request, res: Response, next: NextFunction) => {
  const { id_opening_hour } = req.params;
  getById(Number(id_opening_hour)).then((openingHourExists: IOpeningHour) => {
    if (!openingHourExists) {
      next(new ErrorHandler(404, `This opening hour doesn't exist`));
    } else {
      req.record = openingHourExists; // because we need deleted record to be sent after a delete in react-admin
      next();
    }
  });
};

//////////// CRUD models of opening hour /////////////
const getAllOpeningHour = (sortBy = ''): Promise<IOpeningHour[]> => {
  let sql = 'SELECT *, id_opening_hour as id FROM opening_hours';
  if (sortBy) {
    sql += ` ORDER BY ${sortBy}`;
  }
  return connection
    .promise()
    .query<IOpeningHour[]>(sql)
    .then(([results]) => results);
};

const getById = (id_opening_hour: number): Promise<IOpeningHour> => {
  return connection
    .promise()
    .query<IOpeningHour[]>(
      'SELECT *, id_opening_hour as id FROM opening_hours WHERE id_opening_hour = ?',
      [id_opening_hour]
    )
    .then(([results]) => results[0]);
};

const getByOptician = (id_optician: number): Promise<IOpeningHour> => {
  return connection
    .promise()
    .query<IOpeningHour[0]>(
      'SELECT *, id_opening_hour as id FROM opening_hours WHERE id_optician = ?',
      [id_optician]
    )
    .then((results: IOpeningHour[]) => results[0]);
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
      const id_opening_hour = results.insertId;
      const {
        start_morning,
        end_morning,
        start_afternoon,
        end_afternoon,
        id_optician,
        id_day,
      } = openingHours;
      return {
        id_opening_hour,
        start_morning,
        end_morning,
        start_afternoon,
        end_afternoon,
        id_optician,
        id_day,
      };
    });
};

const updateOpeningHour = (
  id_opening_hour: number,
  openingHour: IOpeningHour
): Promise<boolean> => {
  let sql = 'UPDATE opening_hours SET';
  const sqlValues: (string | number)[] = [];
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
  openingHourExists,
  getAllOpeningHour,
  getById,
  getByOptician,
  addOpeningHours,
  updateOpeningHour,
  deleteOpeningHour,
};
