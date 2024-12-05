import type { DeepNotNull, OrderMarket, PublicService, SelectOrderTable, ManyOrdersWithRelationsRT, OrderHistory, 
    PickService, MarketOrder, OrderServiceSpecifier, PaginatedOrders, ServiceSpecifier
} from "@types";
import ErrorHandler from "@shared/utils/errorHandler";
import type { HistoryFilterOptions, OrderFiltersOption } from "../schema";
import ErrorFactory from "@shared/utils/customErrors";
import { findManyOrders, findFirstOrder, findOrdersHistory, updateOrderStatus, type FindFirstOrderRT } from "../db/queries";

export const ordersService = async (status: OrderFiltersOption["filter"], offset: number, limit: number) 
: Promise<PaginatedOrders | never[]> => {
    try {
        const { next, service } = await findManyOrders(status, offset, limit);
        if(!service) return [];
        const modifiedOrders: Pick<PaginatedOrders, "service">["service"] = service.map(({premiumId, ...rest}) => ({
            ...rest, service: premiumId ? "premium": "star"
        }));

        const statusOrder = { pending: 1, in_progress: 2, completed: 3 };
        modifiedOrders.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
        return { service: modifiedOrders, next };
        
    } catch (err: unknown) {
        const error: ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, "An error ocurred");
    }
}

const updateOrderStatusFn = async (orderId: string, status: SelectOrderTable["status"]): Promise<void> => {
    updateOrderStatus(orderId, status)
}

const specifyService = <T>(service: T, premiumId: string | undefined): OrderServiceSpecifier => {
    return premiumId ? { serviceName: "premium", duration: (service as ServiceSpecifier<"premium">).duration } 
   : { serviceName: "star", stars: (service as ServiceSpecifier<"star">).stars };
}

export const orderService = async <S extends PickService>(orderId: string): Promise<OrderMarket<S>> => {
    try {
        const orderDetail = await findFirstOrder(orderId, true, true);
        if(!orderDetail) throw ErrorFactory.ResourceNotFoundError();
        
        const filteredOrder = Object.fromEntries(Object.entries(orderDetail).filter(([_, value]) => value !== null)) as 
        DeepNotNull<FindFirstOrderRT<true, true>>;
        const { star, premium, irrPrice, tonQuantity, userId, ...rest } = filteredOrder;
        const specifiedService: OrderServiceSpecifier = specifyService(
            {stars: star?.stars || undefined, duration: premium?.duration || undefined}, premium?.id ?? undefined
        );
        await updateOrderStatusFn(orderId, "in_progress");
        return {...rest, service: { id: star?.id || premium.id, irrPrice, tonQuantity, ...specifiedService, 
            ...specifiedService 
        }} as OrderMarket<S>;

    } catch (err: unknown) {
        const error: ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, "An error ocurred");
    }
}

export const completeOrderService = async (orderId: string): Promise<{status: SelectOrderTable["status"]}> => {
    try {
        const orderDetail: SelectOrderTable | null = await findFirstOrder(orderId, false, false)
        if(!orderDetail) throw ErrorFactory.ResourceNotFoundError()
        await updateOrderStatusFn(orderId, "completed");
        return { status: "completed" }
        
    } catch (err: unknown) {
        const error: ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, "An error occurred");
    }
}

export type PaginatedHistories = {service: MarketOrder[], next: boolean};
export const ordersHistoryService = async (userId: string, status: HistoryFilterOptions["filter"],
offset: number, limit: number): Promise<PaginatedHistories> => {
    try {
        const { next, service }: Awaited<ManyOrdersWithRelationsRT> = await findOrdersHistory(userId, status, offset, limit);
        const modifiedHistories: MarketOrder[] = service ? service.map(order => {
            const { premium, star, ...rest } = order;
            const service = premium ? {duration: premium.duration, service: "premium"}: {stars: star!.stars, service: "star"}
            return {...rest, service}
        }): [];
        const statusOrder = { pending: 1, in_progress: 2, completed: 3 };
        modifiedHistories.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
        return { service: modifiedHistories, next }
        
    } catch (err: unknown) {
        const error: ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, "An error occurred");
    }
}

export const orderHistoryService = async (orderId: string): Promise<OrderHistory> => {
    try {
        const order: Awaited<FindFirstOrderRT<true, true>> = await findFirstOrder(orderId, true, true);
        if(!order) throw ErrorFactory.ResourceNotFoundError();
        
        const { userId, star, premium, tonQuantity, irrPrice, ...rest } = order;
        const servicePrice: Pick<SelectOrderTable, "irrPrice" | "tonQuantity"> = { irrPrice, tonQuantity }
        const publicService: PublicService["premium" | "stars"] = premium ? <PublicService["premium"]>{
            duration: premium.duration, serviceName: "premium"
        }: <PublicService["stars"]>{stars: star!.stars, serviceName: "star"};
        // @ts-expect-error type error
        return {...rest, service: {...servicePrice, ...publicService}}
        
    } catch (err: unknown) {
        const error: ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, "An error occurred");
    }
}
