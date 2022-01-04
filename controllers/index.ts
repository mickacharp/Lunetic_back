import express from 'express';
import opticiansRouter from './opticians';
import authRouter from './auth';
import collectionsRouter from './collections';

const setupRoutes = (app: express.Application) => {
  app.use('/api/opticians', opticiansRouter);
  app.use('/api/login', authRouter);
  app.use('./api/collections', collectionsRouter);
};

export default setupRoutes;
