import { Hono } from 'hono';
import { landingPage, services } from '../controllers/services.controller';
import { isAuthenticated } from '../middlewares/authorization';
import { validationMiddleware } from '../middlewares/validation';
import { serviceFilterSchema } from '../schemas/zod.schema';

const servicesRouter = new Hono();

servicesRouter.get('/landing', isAuthenticated, landingPage);

servicesRouter.get('/', validationMiddleware('query', serviceFilterSchema), isAuthenticated, services);

export default servicesRouter;