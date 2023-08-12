import swaggerJsDoc, { Options } from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';

const swaggerOptions: Options = {
  swaggerDefinition: {
    info: {
      title: 'RFID Attendance API',
      version: '1.0.0',
      description: 'RFID Attendance API',
      contact: {
        name: 'Salman Adhikari',
        email: 'salmanad5s3@gmail.com',
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/model/*.ts'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
const setup = swaggerUI.setup(swaggerDocs);
const serve = swaggerUI.serve;

export { serve, setup };
