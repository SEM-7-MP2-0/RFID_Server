import bcrypt from 'bcrypt';
import { getEnvInt } from './dotenv.utils';

const saltRounds: number = getEnvInt('SALT_ROUNDS')!;

const encryptPassword = async (password: string): Promise<string> => {
  const salt: string = await bcrypt.genSalt(saltRounds);
  const hash: string = await bcrypt.hash(password, salt);
  return hash;
};

const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  const isMatch: boolean = await bcrypt.compare(password, hash);
  return isMatch;
};

export { encryptPassword, comparePassword };
