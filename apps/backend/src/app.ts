import { Hono, type Context } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { createRouteNotFoundError, ErrorMiddleware } from './utils';

const app = new Hono();

app.use(logger());
app.use(cors({origin : process.env.ORIGIN, credentials : true}));

app.all('/', (context : Context) => context.json({success : true, message : 'Welcome to teleshop-backend'}));

app.notFound((context : Context) => {throw createRouteNotFoundError(`Route : ${context.req.url} not found`)});
app.onError(ErrorMiddleware);

export default app;