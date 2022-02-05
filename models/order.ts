import connection from '../db-config';
import Joi from 'joi';
import { ResultSetHeader } from 'mysql2';
import { NextFunction, Request, Response } from 'express';
import { ErrorHandler } from '../helpers/errors';
import IOrders from '../interfaces/IOrders';

//////////// Order middlewares /////////////
const validateOrders = (req: Request, res: Response, next: NextFunction) => {
  let required: Joi.PresenceMode = 'optional';
  if (req.method === 'POST') {
    required = 'required';
  }
  const errors = Joi.object({
    id_optician: Joi.number().presence(required),
    link_pdf: Joi.string().max(255).allow('', null),
    order_number: Joi.string().max(100).presence(required),
    date: Joi.string().max(40).presence(required),
    id_order: Joi.number().optional(),
    id: Joi.number().optional(),
  }).validate(req.body, { abortEarly: false }).error;
  if (errors) {
    next(new ErrorHandler(422, errors.message));
  } else {
    next();
  }
};

const orderExists = (req: Request, res: Response, next: NextFunction) => {
  const { id_order } = req.params;
  getById(Number(id_order)).then((orderExists: IOrders) => {
    if (!orderExists) {
      next(new ErrorHandler(404, `This order doesn't exist`));
    } else {
      req.record = orderExists; // because we need deleted record to be sent after a delete in react-admin
      next();
    }
  });
};

//////////// CRUD models of order /////////////
const getAllOrders = (sortBy = ''): Promise<IOrders[]> => {
  let sql = 'SELECT *, id_order as id FROM orders';
  if (sortBy) {
    sql += ` ORDER BY ${sortBy}`;
  }
  return connection
    .promise()
    .query<IOrders[]>(sql)
    .then(([results]) => results);
};

const getById = (id_order: number): Promise<IOrders> => {
  return connection
    .promise()
    .query<IOrders[]>(
      'SELECT *, id_order as id FROM orders WHERE id_order = ?',
      [id_order]
    )
    .then(([results]) => results[0]);
};

const getOrdersByOptician = (id_optician: number): Promise<IOrders[]> => {
  return connection
    .promise()
    .query<IOrders[]>(
      'SELECT *, id_order as id FROM orders WHERE id_optician = ?',
      [id_optician]
    )
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

const updateOrder = (id_order: number, order: IOrders): Promise<boolean> => {
  let sql = 'UPDATE orders SET';
  const sqlValues: (string | number)[] = [];
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

const deleteOrder = (id_order: number): Promise<boolean> => {
  return connection
    .promise()
    .query<ResultSetHeader>('DELETE FROM orders WHERE id_order = ?', [id_order])
    .then(([results]) => results.affectedRows === 1);
};

export {
  validateOrders,
  orderExists,
  getAllOrders,
  getById,
  getOrdersByOptician,
  addOrder,
  updateOrder,
  deleteOrder,
};
