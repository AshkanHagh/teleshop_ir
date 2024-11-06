import './modules/products/cronjobs/servicePrice';
import { Hono, type Context } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import authRoute from '@modules/users/routes/auth.route';
import servicesRoute from '@modules/products/routes/product.route';
import paymentRoute from '@modules/payments/routes/payment.route';
import dashboardRoute from '@modules/dashboards/routes/dashboard.route';

import { ErrorMiddleware } from '@shared/utils/errorHandler';
import ErrorFactory from '@shared/utils/customErrors';
import { env } from '@env';

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