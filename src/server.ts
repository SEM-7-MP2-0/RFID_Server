import app from './bin/www';
import { getEnv } from './utils/dotenv.utils';
import connectDb from './db/connect';
const PORT = getEnv('PORT') || 3000;
import log from './log/index';
import { Request, Response } from 'express';

app.get('/', (req: Request, res: Response) => {
  return res.send('Hello World');
});

app.listen(PORT, async () => {
  await connectDb();
  log.info(`http://localhost:${PORT}`);
});
