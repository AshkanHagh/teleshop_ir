import { Hono } from 'hono';
import { validationMiddleware } from '../middlewares/validation';
import { createOrderSchema, verifyPaymentQuerySchema } from '../schemas/zod.schema';
import { some, every } from 'hono/combine';
import { isAuthenticated } from '../middlewares/authorization';
import { createIrrPayment, paymentCancel, verifyAndCompletePayment } from '../controllers/payment.controller';

const paymentRouter = new Hono();

paymentRouter.post('/irr/:serviceId', some(every(isAuthenticated, validationMiddleware('json', createOrderSchema))), createIrrPayment);

paymentRouter.get('/irr/verify', some(every(validationMiddleware('query', verifyPaymentQuerySchema))), verifyAndCompletePayment);

paymentRouter.get('/irr/cancel', paymentCancel);

export default paymentRouter;