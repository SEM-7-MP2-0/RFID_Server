import { decodeAccessToken } from '../utils/jwt.utils';
import log from '../log/index';
import { NextFunction, Response, Request } from 'express';

const deserializeUser = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    log.info('Deserializing user');
    if (req.headers.authorization) {
      const token = req.headers.authorization;
      log.info(token);
      const user = decodeAccessToken(token);
      req.user = user.user;
      next();
    } else {
      return res.status(401).send('Unauthorized');
    }
  } catch (err) {
    log.error(err);
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }
};

export default deserializeUser;
