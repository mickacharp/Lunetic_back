import { Request, Response, Router } from 'express';
const ordersRouter = Router();

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