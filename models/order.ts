import connection from '../db-config';
import Joi from 'joi';
import { ResultSetHeader } from 'mysql2';
import { NextFunction, Request, Response } from 'express';
import { ErrorHandler } from '../helpers/errors';
import IOrders from '../interfaces/IOrders';

const validateOrders = (req: Request, res: Response, next: NextFunction) => {
  let required: Joi.PresenceMode = 'optional';
  if (req.method === 'POST') {
    required = 'required';
  }
  const errors = Joi.object({
    id_optician: Joi.number().integer().presence(required),
    link_pdf: Joi.string().max(255).allow('', null),
    order_number: Joi.string().max(100).presence(required),
    date: Joi.string().max(10).presence(required),
  }).validate(req.body, { abortEarly: false }).error;
  if (errors) {
    next(new ErrorHandler(422, errors.message));
  } else {
    next();
  }
};

const getAllOrders = (sortBy: string = ''): Promise<IOrders[]> => {
  let sql: string = 'SELECT *, id_order as id FROM orders';
  if (sortBy) {
    sql += ` ORDER BY ${sortBy}`;
  }
  return connection
    .promise()
    .query<IOrders[]>(sql)
    .then(([results]) => results);
};

const addOrder = (order: IOrders) => {
  return connection
    .promise()
    .query<ResultSetHeader>(
      'INSERT INTO orders (id_optician, link_pdf, order_number, date) VALUES (?, ?, ?, ?)',
      [order.id_optician, order.link_pdf, order.order_number, order.date]
    )
    .then(([results]) => {
      const id_order = results.insertId;
      const { id_optician, link_pdf, order_number, date } = order;
      return {
        id_order,
        id_optician,
        link_pdf,
        order_number,
        date,
      };
    });
};

const updateOrder = async (
  id_order: number,
  order: IOrders
): Promise<boolean> => {
  let sql = 'UPDATE orders SET';
  const sqlValues: Array<string | number> = [];
  let oneValue = false;

  if (order.id_optician) {
    sql += ' id_optician = ? ';
    sqlValues.push(order.id_optician);
    oneValue = true;
  }
  if (order.link_pdf) {
    sql += oneValue ? ', link_pdf = ? ' : ' link_pdf = ? ';
    sqlValues.push(order.link_pdf);
    oneValue = true;
  }
  if (order.order_number) {
    sql += oneValue ? ', order_number = ? ' : ' order_number = ? ';
    sqlValues.push(order.order_number);
    oneValue = true;
  }
  if (order.date) {
    sql += oneValue ? ', date = ? ' : ' date = ? ';
    sqlValues.push(order.date);
    oneValue = true;
  }

  sql += ' WHERE id_order = ?';
  sqlValues.push(id_order);

  return connection
    .promise()
    .query<ResultSetHeader>(sql, sqlValues)
    .then(([results]) => results.affectedRows === 1);
};

const getById = (id_order: number): Promise<IOrders> => {
  return connection
    .promise()
    .query<IOrders[]>('SELECT * FROM orders WHERE id_order = ?', [id_order])
    .then(([results]) => results[0]);
};

const orderExists = async (req: Request, res: Response, next: NextFunction) => {
  const { id_order } = req.params;
  const orderExists: IOrders = await getById(Number(id_order));
  if (!orderExists) {
    next(new ErrorHandler(404, `This order doesn't exist`));
  } else {
    next();
  }
};

const deleteOrder = (id_order: number): Promise<boolean> => {
  return connection
    .promise()
    .query<ResultSetHeader>('DELETE FROM orders WHERE id_order = ?', [id_order])
    .then(([results]) => results.affectedRows === 1);
};

export {
  validateOrders,
  getAllOrders,
  addOrder,
  updateOrder,
  orderExists,
  deleteOrder,
};
