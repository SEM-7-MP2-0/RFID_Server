import express from 'express';
import cors from 'cors';
import { Express } from 'express';

const initMiddleware = (app: Express) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());
};

export default initMiddleware;
