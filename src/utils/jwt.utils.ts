import jwt from 'jsonwebtoken';
import { getEnv } from './dotenv.utils';
import log from '../log/index';
import { AccessTokenUser } from '../@types/utils';

const createAccessToken = (user: AccessTokenUser): string => {
  return jwt.sign({ user }, getEnv('ACCESS_TOKEN_SECRET')!, {
    expiresIn: getEnv('ACCESS_TOKEN_LIFETIME'),
  });
};

const decodeAccessToken = (token: string): any => {
  log.info(token);
  return jwt.verify(token, getEnv('ACCESS_TOKEN_SECRET')!);
};

export { createAccessToken, decodeAccessToken };
