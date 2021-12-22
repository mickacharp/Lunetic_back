import express from 'express';
import opticiansRouter from './opticians';
import authRouter from './auth';

const setupRoutes = (app: express.Application) => {
  app.use('/api/opticians', opticiansRouter);
  app.use('/api/login', authRouter);
};

export default setupRoutes;
