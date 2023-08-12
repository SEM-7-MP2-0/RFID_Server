import { serve, setup } from '../utils/swagger.utils';
import { Express } from 'express';
import AuthRoute from '../routes/auth';
import StudentRoute from '../routes/students';
import FacultyRoute from '../routes/faculty';

const initRoutes = (app: Express) => {
  app.use('/api-docs', serve, setup);
  app.use('/auth', AuthRoute);
  app.use('/students', StudentRoute);
  app.use('/faculty', FacultyRoute);
};

export default initRoutes;
