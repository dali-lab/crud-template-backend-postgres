import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import morgan from 'morgan';
import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import { errorHandler } from 'errors';
import { validationErrorHandler } from 'validation';

import * as models from './db/models';
import {
  authRouter, 
  userRouter, 
  resourceRouter,
} from './routers';

dotenv.config();

const app = express(); // initialize
app.use(cors()); // enable/disable cross origin resource sharing if necessary
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev')); // enable/disable http request logging
app.use(express.json({ limit: '100mb' }));

export const server = createServer(app);
const port = process.env.PORT;
server.listen({ port }, () => {
  console.log(`Server listening on port ${port}!`);
});

export const db = new Sequelize( // Connect the database
  process.env.DATABASE_URL ?? '', 
  {
    dialect: 'postgres',
    logging: false,
    models: Object.values(models),
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' && {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
);

// sequelize.sync();

try {
  db.authenticate();
  console.log('Database connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

// declare routers
app.use('/auth', authRouter); // NOTE: Not secured
app.use('/users', userRouter); // NOTE: Completely secured to users
app.use('/resources', resourceRouter); // NOTE: Partially secured to users
app.use((req, res) => { // Custom 404 middleware
  res.status(404).json({ message: 'The route you\'ve requested doesn\'t exist' });
});
app.use(validationErrorHandler);
app.use(errorHandler);

export default server;
