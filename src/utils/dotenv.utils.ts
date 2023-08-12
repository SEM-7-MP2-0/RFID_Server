import dotenv from 'dotenv';

dotenv.config();

const getEnv = (key: string): string | undefined => {
  return process.env[key];
};

const getEnvInt = (key: string): number | undefined => {
  const value = getEnv(key);
  return value ? parseInt(value) : undefined;
};

export { getEnv, getEnvInt };
