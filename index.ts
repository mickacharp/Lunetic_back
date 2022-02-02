import express, { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import { handleError } from './helpers/errors';
import setupRoutes from './controllers';
import cors from 'cors';

export const app = express();
const port = process.env.PORT || 3000;

const corsOptions: cors.CorsOptions = {
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true,
};

// middleware cors
app.use(cors(corsOptions));
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
  next();
});
app.use(express.json());
app.use(cookieParser());

setupRoutes(app);

app.use(handleError);

app.listen(port, () => {
  console.log(`server is listening on ${port}`);
});
