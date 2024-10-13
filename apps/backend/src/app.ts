import './cronjobs/servicePrice';
import { Hono, type Context } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import authRoute from './routes/auth.route';
import servicesRoute from './routes/service.route';
import paymentRoute from './routes/payment.route';
import dashboardRoute from './routes/dashboard.route';

import { ErrorMiddleware } from './utils';
import ErrorFactory from './utils/customErrors';
import { env } from '../env';

const app = new Hono();

app.use(cors({origin : env.ORIGIN, credentials : true}));
app.use(logger());

app.all('/', (context : Context) => context.json({success : true, message : 'Welcome to teleshop-backend'}));
app.route('/api/auth', authRoute);
app.route('/api/services', servicesRoute);
app.route('/api/payments', paymentRoute);
app.route('/api/dashboard', dashboardRoute);

app.notFound((context : Context) => {throw ErrorFactory.RouteNowFoundError(`Route : ${context.req.url} not found`)});
app.onError(ErrorMiddleware);

export default app;