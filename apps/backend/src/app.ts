import { Hono, type Context } from 'hono';
import { cors } from 'hono/cors';
import authRoute from './routes/auth.route';
import { createRouteNotFoundError, ErrorMiddleware } from './utils';

const app = new Hono();

app.use(cors({origin : process.env.ORIGIN, credentials : true}));

app.all('/', (context : Context) => context.json({success : true, message : 'Welcome to teleshop-backend'}));
app.route('/api/auth', authRoute);

app.notFound((context : Context) => {throw createRouteNotFoundError(`Route : ${context.req.url} not found`)});
app.onError(ErrorMiddleware);

export default app;