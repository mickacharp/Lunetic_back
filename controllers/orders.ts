import { Request, Response, Router } from 'express';
const ordersRouter = Router();
import IOrders from '../interfaces/IOrders';
import * as Order from '../models/order';
import { ErrorHandler } from '../helpers/errors';

ordersRouter.get('/', (req: Request, res: Response) => {
  Order.getAllOrders().then((orders: Array<IOrders>) => {
    res.status(200).json(orders);
  })
  .catch((err) => {
    console.log(err);
    throw new ErrorHandler(500, 'Orders cannot be found');
  });
});

ordersRouter.post(
  '/',
  Order.validateOrders,
  (req: Request, res: Response) => {
    const order = req.body as IOrders;
    Order.addOrder(order).then((newOrder) =>
      res.status(200).json(newOrder)
    )
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'Order cannot be created');
    });
  }
);

ordersRouter.put(
  '/:id_order',
  Order.validateOrders,
  Order.orderExists,
  (req: Request, res: Response) => {
    const { id_order } = req.params;
    Order.updateOrder(
      Number(id_order),
      req.body as IOrders
    ).then((updateOrder) => {
      if (updateOrder) {
        res.status(200).send('Order updated');
      } else {
        throw new ErrorHandler(500, 'Order cannot be updated');
      }
    })
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'Order cannot be modified');
    });
  }
);

ordersRouter.delete('/:id_order', (req: Request, res: Response) => {
  const { id_order } = req.params;
  Order.deleteOrder(Number(id_order))
    .then((deletedOrder) => {
      if (deletedOrder) {
        res.status(200).send('Order deleted');
      } else {
        res.status(401).send('No order found')
      }
    })
    .catch((err) => {
    console.log(err);
    throw new ErrorHandler(500, 'Order cannot be deleted, something wrong happened');
  });
});

export default ordersRouter;