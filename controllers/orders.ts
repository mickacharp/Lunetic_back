import { NextFunction, Request, Response, Router } from 'express';
const ordersRouter = Router();
import IOrders from '../interfaces/IOrders';
import * as Auth from '../helpers/auth';
import * as Order from '../models/order';
import { ErrorHandler } from '../helpers/errors';
import { formatSortString } from '../helpers/functions';

///////////// GET ALL ///////////////

ordersRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  const sortBy: string = req.query.sort as string;
  Order.getAllOrders(formatSortString(sortBy))
    .then((orders: IOrders[]) => {
      res.setHeader(
        'Content-Range',
        `orders : 0-${orders.length}/${orders.length + 1}`
      );
      res.status(200).json(orders);
    })
    .catch((err) => next(err));
});

///////////// GET ONE ///////////////

ordersRouter.get(
  '/:id_order',
  (req: Request, res: Response, next: NextFunction) => {
    const { id_order } = req.params;
    Order.getById(Number(id_order))
      .then((order) => {
        if (order) {
          res.status(200).json(order);
        } else {
          res.status(401).send('No order found');
        }
      })
      .catch((err) => next(err));
  }
);

/////////////////// POST ///////////////////

ordersRouter.post(
  '/',
  Auth.getCurrentSession,
  Auth.checkSessionPrivileges,
  Order.validateOrders,
  (req: Request, res: Response, next: NextFunction) => {
    const order = req.body as IOrders;
    Order.addOrder(order)
      .then((newOrder) => {
        if (newOrder) {
          res.status(201).json({ id: newOrder.id_order, ...newOrder });
        } else {
          throw new ErrorHandler(500, 'Order cannot be created');
        }
      })
      .catch((err) => next(err));
  }
);

/////////////////// UPDATE ///////////////////

ordersRouter.put(
  '/:id_order',
  Auth.getCurrentSession,
  Auth.checkSessionPrivileges,
  Order.validateOrders,
  Order.orderExists,
  (req: Request, res: Response, next: NextFunction) => {
    const { id_order } = req.params;
    Order.updateOrder(Number(id_order), req.body as IOrders)
      .then((updateOrder) => {
        if (updateOrder) {
          Order.getById(Number(id_order)).then(
            (order) => res.status(200).send(order) // react-admin needs this response
          );
        } else {
          throw new ErrorHandler(500, 'Order cannot be updated');
        }
      })
      .catch((err) => next(err));
  }
);

/////////////////// DELETE ///////////////////

ordersRouter.delete(
  '/:id_order',
  Auth.getCurrentSession,
  Auth.checkSessionPrivileges,
  Order.orderExists,
  (req: Request, res: Response, next: NextFunction) => {
    const { id_order } = req.params;
    Order.deleteOrder(Number(id_order))
      .then((deletedOrder) => {
        if (deletedOrder) {
          res.status(200).send(req.record); // react-admin needs this response after a delete
        } else {
          throw new ErrorHandler(409, `Order not found`);
        }
      })
      .catch((err) => next(err));
  }
);

export default ordersRouter;
