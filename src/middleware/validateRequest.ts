import { NextFunction, Request, Response } from 'express';
import log from '../log/index';
import { ObjectSchema } from 'yup';

const validate =
  (schema: ObjectSchema<any>) =>
  async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      await schema.validate({
        body: req.body,
        params: req.params,
        query: req.query,
        file: req.file,
      });
      log.info('Validating schema');
      return next();
    } catch (err: any) {
      log.error(err);
      return res.status(409).json({
        message: err.message,
      });
    }
  };

export default validate;
