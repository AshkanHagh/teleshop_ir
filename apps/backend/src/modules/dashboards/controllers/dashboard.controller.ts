import type { Context } from "hono";
import { CatchAsyncError } from "@shared/utils/catchAsyncError";
import { completeOrderService, orderHistoryService, orderService, ordersHistoryService, ordersService } from "../services/dashboard.service";

type OrdersQueryParams = {
    filter: "completed" | "pending" | "in_progress" | "all";
    offset: string,
    limit: string
}

export const orders = CatchAsyncError(async (context: Context) => {
    const { filter, offset, limit } = context.req.query() as OrdersQueryParams;

    const orders = await ordersService(filter, +offset, +limit);

    return context.json({success: true, ...orders});
});

export const order = CatchAsyncError(async (context: Context) => {
    const { orderId } = context.req.param() as { orderId: string };

    const orderDetails = await orderService(orderId);
    return context.json({success: true, orderDetails});
});

export const completeOrder = CatchAsyncError(async (context: Context) => {
    const { orderId } = context.req.param() as { orderId: string };
    await completeOrderService(orderId);

    return context.json({success: true, message: "order completed successfully"});
});

export const ordersHistory = CatchAsyncError(async (context: Context) => {
    const { offset, limit, filter } = context.req.query() as OrdersQueryParams;
    const { id: userId } = context.get("user");

    const orders = await ordersHistoryService(userId, filter, +offset, +limit);
    return context.json({success: true, ...orders});
});

export const orderHistory = CatchAsyncError(async (context: Context) => {
    const { orderId } = context.req.param();
    const orderHistory = await orderHistoryService(orderId);
    return context.json({success: true, orderDetails: orderHistory});
})