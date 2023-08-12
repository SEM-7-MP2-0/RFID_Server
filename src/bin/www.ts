import express from 'express';
import initMiddleware from '../config/initMiddleware';
import initRoutes from '../routes';
const app = express();

initMiddleware(app);
initRoutes(app);

export default app;
