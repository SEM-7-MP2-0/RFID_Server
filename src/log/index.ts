import logger, { LoggerOptions } from 'pino';
import dayjs from 'dayjs';

const logOptions: LoggerOptions = {
  transport: {
    target: 'pino-pretty',
  },
  base: {
    pid: false,
  },
  timestamp: () => `,"time":"${dayjs().format()}"`,
};

const log = logger(logOptions);

export default log;
