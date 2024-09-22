import { Hono } from 'hono';
import { validationMiddleware } from '../middlewares/validation';
import { createOrderSchema } from '../schemas/zod.schema';
import { some, every } from 'hono/combine';
import { isAuthenticated } from '../middlewares/authorization';
import { createIrrPayment } from '../controllers/payment.controller';

const paymentRouter = new Hono();

paymentRouter.post('/irr/:serviceId', some(every(isAuthenticated, validationMiddleware('json', createOrderSchema))), createIrrPayment);

export default paymentRouter;