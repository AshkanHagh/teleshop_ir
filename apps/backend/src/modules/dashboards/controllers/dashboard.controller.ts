import type { Context } from 'hono';
import { CatchAsyncError } from '@shared/utils/catchAsyncError';
import { completeOrderService, orderHistoryService, orderService, ordersHistoryService, ordersService, type PaginatedHistories, 
} from '../services/dashboard.service';
import type { OrderHistory, OrderMarket, PaginatedOrders, PickService, SelectOrderTable } from '@types';
import type { HistoryFilterOptions, OrderFiltersOption } from '../schema';

export const orders = CatchAsyncError(async (context : Context) => {
    const { filter, offset, limit } = context.var.query as OrderFiltersOption;
    const orders : PaginatedOrders | never[] = await ordersService(filter, +offset, +limit);
    return context.json({success : true, ...orders});
});

export const order = CatchAsyncError(async (context : Context) => {
    const { orderId } = context.req.param() as { orderId : string };
    const orderDetails :  OrderMarket<PickService> = await orderService(orderId);
    return context.json({success : true, orderDetails});
});

export const completeOrder = CatchAsyncError(async (context : Context) => {
    const { orderId } = context.req.param() as { orderId : string };
    const status : {status : SelectOrderTable['status']} = await completeOrderService(orderId);
    return context.json({success : true, ...status});
});

export const ordersHistory = CatchAsyncError(async (context : Context) => {
    const { offset, limit, filter } = context.var.query as HistoryFilterOptions;
    const { id : userId } = context.get('user');

    const { next, service } : PaginatedHistories = await ordersHistoryService(userId, filter, +offset, +limit);
    return context.json({success : true, orders : service, next});
});

export const orderHistory = CatchAsyncError(async (context : Context) => {
    const { orderId } = context.req.param();
    const orderHistory : OrderHistory = await orderHistoryService(orderId);
    return context.json({success : true, orderDetails : orderHistory});
})