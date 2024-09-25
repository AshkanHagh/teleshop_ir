import type { Context } from 'hono';
import { CatchAsyncError } from '../middlewares/catchAsyncError';
import { serviceIdSchema, type CreateOrderSchema, type VerifyPaymentQuerySchema } from '../schemas/zod.schema';
import { createIrrPaymentService, paymentCancelService, verifyAndCompletePaymentService, type PaymentCompleted } from '../services/payment.service';
import { validationZodSchema } from '../utils';

export const createIrrPayment = CatchAsyncError(async (context : Context) => {
    const { username, service } = context.req.validated.json as CreateOrderSchema;
    const { serviceId } = context.req.param();
    const { id : userId } = context.get('user');

    const validatedServiceId : string = validationZodSchema(serviceIdSchema, serviceId) as string;
    const paymentUrl = await createIrrPaymentService(validatedServiceId, service, username, userId);
    return context.json({success : true, paymentUrl});
});

export const verifyAndCompletePayment = CatchAsyncError(async (context : Context) => {
    const { authority, status, token } = context.req.validated.query as VerifyPaymentQuerySchema;

    const paymentDetail : PaymentCompleted = await verifyAndCompletePaymentService(token, authority, status);
    return context.json({success : true, paymentDetail});
});

export const paymentCancel = CatchAsyncError(async (context : Context) => {
    const { id : userId } = context.get('user');
    const message : string = await paymentCancelService(userId);
    return context.json({success : true, message});
})