import type { Context } from 'hono';
import { CatchAsyncError } from '../middlewares/catchAsyncError';
import { completeOrderService, orderHistoryService, orderService, ordersHistoryService, ordersService, 
} from '../services/dashboard.service';
import type { MarketOrder, OrderHistory, OrderMarket, PickService, PublicOrder, SelectOrder } from '../types';
import type { HistoryFilterOptions, OrderFiltersOption } from '../schemas/zod.schema';

export const orders = CatchAsyncError(async (context : Context) => {
    const { filter, offset, limit } = context.req.validated.query as OrderFiltersOption;
    const orders : PublicOrder[] = await ordersService(filter, +offset, +limit);
    return context.json({success : true, orders, next : (+offset + +limit) >= orders.length ? false : true});
});

export const order = CatchAsyncError(async (context : Context) => {
    const { orderId } = context.req.param() as { orderId : string };
    const orderDetail :  OrderMarket<PickService> = await orderService(orderId);
    return context.json({success : true, orderDetail});
});

export const completeOrder = CatchAsyncError(async (context : Context) => {
    const { orderId } = context.req.param() as { orderId : string };
    const status : {status : SelectOrder['status']} = await completeOrderService(orderId);
    return context.json({success : true, ...status});
});

export const ordersHistory = CatchAsyncError(async (context : Context) => {
    const { offset, limit, filter } = context.req.validated.query as HistoryFilterOptions;
    const { id : userId } = context.get('user');

    const histories : MarketOrder[] = await ordersHistoryService(userId, filter, +offset, +limit);
    return context.json({success : true, orders : histories, next : (+offset + +limit) >= orders.length ? false : true});
});

export const orderHistory = CatchAsyncError(async (context : Context) => {
    const { id : userId } = context.get('user');
    const { orderId } = context.req.param();

    const orderHistory : OrderHistory = await orderHistoryService(userId, orderId);
    return context.json({success : true, orderDetail : orderHistory});
})