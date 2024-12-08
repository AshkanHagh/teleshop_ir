import ErrorHandler from "@shared/utils/errorHandler";
import { findFirstOrder, findManyOrders, findManyOrdersByUserId, updateOrderStatus, type OrdersFilter } from "../repository";
import type { SelectOrder } from "@shared/models/order.model";

export const ordersService = async (filter: OrdersFilter, offset: number, limit: number) => {
    try {
        return await findManyOrders(filter, offset, limit);
        
    } catch (err: unknown) {
        const error: ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.statusCode, error.kind, error.developMessage, error.clientMessage);
    }
}

type OrderDetails = {
    id: string
    status: SelectOrder["status"],
    orderPlaced: string
    username: string
    service: {
        irrPrice: number
        tonQuantity: number,
        serviceName: "premium" | "star",
        duration: string | undefined, 
        stars: number | undefined
    }
}

export const orderService = async (orderId: string) => {
    try {
        const orderDetail = await findFirstOrder(orderId) as unknown as OrderDetails;
        if(orderDetail.status === "pending") {
            await updateOrderStatus(orderId, "in_progress");
        }
        return orderDetail

    } catch (err: unknown) {
        const error: ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.statusCode, error.kind, error.developMessage, error.clientMessage);
    }
}

export const completeOrderService = async (orderId: string) => {
    try {
        await updateOrderStatus(orderId, "completed");
        
    } catch (err: unknown) {
        const error: ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.statusCode, error.kind, error.developMessage, error.clientMessage);
    }
}

export const ordersHistoryService = async (
    userId: string, 
    filter: OrdersFilter,
    offset: number, 
    limit: number
) => 
{
    try {
        return await findManyOrdersByUserId(userId, filter, offset, limit);

    } catch (err: unknown) {
        const error: ErrorHandler = err as ErrorHandler;
        console.log(error);
        throw new ErrorHandler(error.statusCode, error.kind, error.developMessage, error.clientMessage);
    }
}

export const orderHistoryService = async (orderId: string) => {
    try {
        return await findFirstOrder(orderId) as unknown as OrderDetails;
        
    } catch (err: unknown) {
        const error: ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.statusCode, error.kind, error.developMessage, error.clientMessage);
    }
}