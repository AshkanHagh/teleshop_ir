import type { Context } from 'hono';
import { CatchAsyncError } from '../middlewares/catchAsyncError';
import { serviceIdSchema, type CreateOrderSchema } from '../schemas/zod.schema';
import { createIrrPaymentService } from '../services/payment.service';
import { validationZodSchema } from '../utils';

export const createIrrPayment = CatchAsyncError(async (context : Context) => {
    const { username, service } = context.req.validated.json as CreateOrderSchema;
    const { serviceId } = context.req.param();
    const { id : userId } = context.get('user');

    const validatedServiceId : string = validationZodSchema(serviceIdSchema, serviceId) as string;
    const paymentUrl = await createIrrPaymentService(validatedServiceId, service, username, userId);
    return context.json({success : true, paymentUrl});
})