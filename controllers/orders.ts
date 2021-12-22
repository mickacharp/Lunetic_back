const ordersRouter = require('express').Router();
import { Request, Response } from 'express';

interface OrderInfo {
  id_status: number;
  price: string;
  id_optician: number;
  date: string;
  order_number: string;
}

///////////// PRODUCTS ///////////////

ordersRouter.get('/', (req: Request, res: Response) => {
  res.status(200).send('get all orders');
});

module.exports = { ordersRouter };