import express from 'express';
import opticiansRouter from './opticians';
import authRouter from './auth';
import collectionsRouter from './collections';
import colorsRouter from './colors';
import templesRouter from './temples';
import newsRouter from './news';
import wishlistsRouter from './wishlists';
import openingHoursRouter from './openingHours';
import ordersRouter from './orders';
import modelsRouter from './models';
import daysRouter from './days';

const setupRoutes = (app: express.Application) => {
  app.use('/api/opticians', opticiansRouter);
  app.use('/api/login', authRouter);
  app.use('/api/collections', collectionsRouter);
  app.use('/api/colors', colorsRouter);
  app.use('/api/temples', templesRouter);
  app.use('/api/news', newsRouter);
  app.use('/api/wishlists', wishlistsRouter);
  app.use('/api/openingHours', openingHoursRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/models', modelsRouter);
  app.use('/api/days', daysRouter);
};

export default setupRoutes;
