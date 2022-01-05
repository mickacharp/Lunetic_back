import express from 'express';
import opticiansRouter from './opticians';
import authRouter from './auth';
import daysRouter from './days';
import modelsRouter from './models';

const setupRoutes = (app: express.Application) => {
  app.use('/api/opticians', opticiansRouter);
  app.use('/api/login', authRouter);
  app.use('/api/days', daysRouter);
  app.use('/api/models', modelsRouter);
};

export default setupRoutes;
