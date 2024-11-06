import { Hono } from 'hono';
import { productIntroduction, products } from '../controllers/product.controller';
import { isAuthenticated } from '@shared/middlewares//authorization';
import { validationMiddleware } from '@shared/middlewares//validation';
import { serviceFilterOptions } from '../schema';
import { some, every } from 'hono/combine';

const servicesRouter = new Hono();

servicesRouter.get('/', isAuthenticated, productIntroduction);

servicesRouter.get('/pick-service', some(every(isAuthenticated, validationMiddleware('query', serviceFilterOptions))), products);

export default servicesRouter;