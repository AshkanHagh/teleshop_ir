import { Hono } from 'hono';
import { service, services } from '../controllers/services.controller';
import { isAuthenticated } from '../middlewares/authorization';
import { validationMiddleware } from '../middlewares/validation';
import { ServiceSchema } from '../schemas/zod.schema';

const servicesRouter = new Hono();

servicesRouter.get('/', isAuthenticated, services);

servicesRouter.get('/service', validationMiddleware('query', ServiceSchema), isAuthenticated, service);

export default servicesRouter;