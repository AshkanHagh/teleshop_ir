import { Hono } from 'hono';
import { service, services } from '../controllers/services.controller';
import { isAuthenticated } from '../middlewares/authorization';
import { validationMiddleware } from '../middlewares/validation';
import { ServiceSchema } from '../schemas/zod.schema';
import { some, every } from 'hono/combine';

const servicesRouter = new Hono();

servicesRouter.get('/', isAuthenticated, services);

servicesRouter.get('/service', some(every(isAuthenticated, validationMiddleware('query', ServiceSchema))), service);

export default servicesRouter;