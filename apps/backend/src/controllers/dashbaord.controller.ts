import type { Context } from 'hono';
import { CatchAsyncError } from '../middlewares/catchAsyncError';
import type { OrdersFilterByStatusSchema } from '../schemas/zod.schema';
import { completeOrderService, orderHistoryService, orderService, ordersHistoryService, ordersService, 
    type OrderHistory, type OrdersHistory 
} from '../services/dashboard.service';
import type { DrizzleSelectOrder } from '../models/order.model';

export const orders = CatchAsyncError(async (context : Context) => {
    const { status, offset, limit } = context.req.validated.query as OrdersFilterByStatusSchema;
    const orders = await ordersService(status, +offset, +limit);
    return context.json({success : true, orders});
});

export const order = CatchAsyncError(async (context : Context) => {
    const { orderId } = context.req.param() as { orderId : string };
    const orderDetail = await orderService(orderId);
    return context.json({success : true, orderDetail});
});

export const completeOrder = CatchAsyncError(async (context : Context) => {
    const { orderId } = context.req.param() as { orderId : string };
    const status : {status : DrizzleSelectOrder['status']} = await completeOrderService(orderId);
    return context.json({success : true, ...status});
});

export const ordersHistory = CatchAsyncError(async (context : Context) => {
    const { offset, limit, status } = context.req.validated.query as OrdersFilterByStatusSchema;
    const { id : userId } = context.get('user');

    const history : OrdersHistory[] = await ordersHistoryService(userId, status, +offset, +limit);
    return context.json({success : true, history});
});

export const orderHistory = CatchAsyncError(async (context : Context) => {
    const { id : userId } = context.get('user');
    const { orderId } = context.req.param();

    const orderDetail : OrderHistory = await orderHistoryService(userId, orderId);
    return context.json({success : true, orderDetail});
})