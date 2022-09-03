import { Sequelize } from 'sequelize-typescript';
import * as models from './models';
import dotenv from 'dotenv';

dotenv.config();

const db = new Sequelize( // Connect the database
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

export default db;