import mongoose from 'mongoose';
import { getEnv } from '../utils/dotenv.utils';
import log from '../log/index';

const connectDb = async (): Promise<typeof mongoose | void> => {
  try {
    const connection = await mongoose.connect(getEnv('MONGODB_URI')!);
    log.info(`MongoDB Connected: ${connection.connection.host}`);
    return connection;
  } catch (err) {
    log.error(`MongoDB Connection Error: ${err}`);
  }
};

export default connectDb;
