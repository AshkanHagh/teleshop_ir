import type { Context } from 'hono';
import { CatchAsyncError } from '../middlewares/catchAsyncError';
import { type PlaceOrder, verifyId, type PaymentQuery } from '../schemas/zod.schema';
import { createIrrPaymentService, verifyAndCompletePaymentService } from '../services/payment.service';
import { type PlacedOrder } from '@types';
import { validationZodSchema } from '@utils/.';

export const createIrrPayment = CatchAsyncError(async (context : Context) => {
    const { username, service } = context.var.json as PlaceOrder;
    const { serviceId } = context.req.param();
    const { id : userId } = context.get('user');

    const validatedServiceId : string = validationZodSchema(verifyId, serviceId) as string;
    const paymentUrl = await createIrrPaymentService(validatedServiceId, service, username, userId);
    return context.json({success : true, paymentUrl});
});

export const verifyAndCompletePayment = CatchAsyncError(async (context : Context) => {
    const { Authority, Status } = context.var.query as PaymentQuery;
    const paymentDetail : PlacedOrder = await verifyAndCompletePaymentService(Authority, Status);
    return context.json({success : true, paymentDetail});
});