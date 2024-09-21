import { Hono, type Context } from 'hono';
import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json'
import { logger } from 'hono/logger';

import authRoute from './routes/auth.route';
import servicesRouter from './routes/service.route';
import doc from './swaggerDocs';

import { createRouteNotFoundError, ErrorMiddleware } from './utils';

const app = new Hono();

app.use(cors({origin : process.env.ORIGIN, credentials : true}));
app.use(prettyJSON());
app.use(logger());

app.all('/', (context : Context) => context.json({success : true, message : 'Welcome to teleshop-backend'}));
app.route('/api/auth', authRoute);
app.route('/api/services', servicesRouter);
app.route('/', doc);

app.notFound((context : Context) => {throw createRouteNotFoundError(`Route : ${context.req.url} not found`)});
app.onError(ErrorMiddleware);

export default app;