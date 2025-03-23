import express from 'express';
import cors from 'cors';
import notFound from './middleware/notFound';
import globalErrorHandelar from './middleware/globalErrorHandelar';
import router from './router';
import cookieParser from 'cookie-parser';
import cron from 'node-cron';
import httpStatus from 'http-status';
import AppError from './app/error/AppError';
import { unauthorizedUser } from './utility/unauthorizedUser';
const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

//To execute the function every 12 hours later
cron.schedule('0 */12 * * *', () => {
  try {
    unauthorizedUser.UnauthorizedUserChecker();
  } catch (error) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Cron failed issues', '');
  }
});

app.get('/', (req, res) => {
  res.send({ status: true, message: 'Well Come To Interview Task Server' });
});

app.use('/api/v1', router);

app.use(notFound);
app.use(globalErrorHandelar);

export default app;
