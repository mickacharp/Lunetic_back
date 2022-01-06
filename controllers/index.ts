import express from 'express';
import usersRouter from './users';
import addressesRouter from './adresses';
import authRouter from './auth';
import collectionsRouter from './collections';
import templesRouter from './temples';
import newsRouter from './news';
import wishlistsRouter from './wishlists';
import openingHoursRouter from './openingHours';
import ordersRouter from './orders';

const setupRoutes = (app: express.Application) => {
  app.use('/api/users', usersRouter);
  app.use('/api/addresses', addressesRouter);
  app.use('/api/login', authRouter);
  app.use('/api/collections', collectionsRouter);
  app.use('/api/temples', templesRouter);
  app.use('/api/news', newsRouter);
  app.use('/api/wishlists', wishlistsRouter);
  app.use('/api/openingHours', openingHoursRouter);
  app.use('/api/orders', ordersRouter);
};

export default setupRoutes;
