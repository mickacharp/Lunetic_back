import express from 'express';
import opticiansRouter from './opticians';
import authRouter from './auth';
import templesRouter from './temples';
import newsRouter from './news';

const setupRoutes = (app: express.Application) => {
  app.use('/api/opticians', opticiansRouter);
  app.use('/api/login', authRouter);
  app.use('/api/temples', templesRouter);
  app.use('/api/news', newsRouter);
};

export default setupRoutes;
