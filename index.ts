import express from 'express';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import { handleError } from './helpers/errors';
import setupRoutes from './controllers';
import cors from 'cors';

export const app = express();
const port = process.env.PORT || 3000;

const corsOptions: cors.CorsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};

// middleware cors
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

setupRoutes(app);

// A mettre à la fin pour gèrer les erreurs qui sortiront des routes
app.use(handleError);

app.listen(port, () => {
  console.log(`server is listening on ${port}`);
});
