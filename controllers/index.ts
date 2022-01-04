import express from 'express';
import opticiansRouter from './opticians';
import authRouter from './auth';
import newsRouter from './news';
import openingHoursRouter from './openingHours';

const setupRoutes = (app: express.Application) => {
  app.use('/api/opticians', opticiansRouter);
  app.use('/api/login', authRouter);
  app.use('/api/news', newsRouter);
  app.use('/api/openingHours', openingHoursRouter);
};

export default setupRoutes;
