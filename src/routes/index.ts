import { serve, setup } from '../utils/swagger.utils';
import express, { Express } from 'express';
import AuthRoute from '../routes/auth';
import StudentRoute from '../routes/students';
import FacultyRoute from '../routes/faculty';

const initRoutes = (app: Express) => {
  app.use('/api-docs', serve, setup);
  app.use('/auth', AuthRoute);
  app.use('/students', StudentRoute);
  app.use('/faculty', FacultyRoute);
  app.use('/uploads', express.static('uploads'));
};

export default initRoutes;
