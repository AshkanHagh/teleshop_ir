import { scanOrdersCache, type ConditionalOrderCache } from '../database/cache/dashboard.cache';
import ErrorHandler from '../middlewares/errorHandler';
import type { OrdersFilterByStatusSchema } from '../schemas/zod.schema';
import { findFirstOrder, findManyOrders, findOrdersHistory, updateOrderStatus, type FindOrdersHistoryRT, 
    type OrderPlaced 
} from '../database/queries/payment.query';
import redis from '../libs/redis.config';
import { orderKeyById, premiumKey, starKey, userOrderKeyById } from '../utils/keys';
import type { DrizzleSelectOrder } from '../models/order.model';
import type { DrizzleSelectPremium, DrizzleSelectStar } from '../models/service.model';
import { ResourceNotFoundError } from '../utils';
import type { Pipeline } from '@upstash/redis';

export const ordersService = async (status : OrdersFilterByStatusSchema['status'], offset : number, limit : number) 
: Promise<ConditionalOrderCache[]> => {
    try {
        const ordersCache = await scanOrdersCache(status) as DeepNotNull<ConditionalOrderCache[]>;
        const totalOrders : number = ordersCache.length;
        const next : boolean = (offset + limit) > totalOrders ? false : true;

        if(!ordersCache) {
            const orders = (await findManyOrders(status, offset, limit)).map(({id, orderPlaced, premiumId, username}) => ({
                id, orderPlaced, username, service : premiumId ? 'premium' : 'star'
            })) as ConditionalOrderCache[];
            const totalOrders : number = orders.length;
            return orders.concat({ next : (offset + limit) > totalOrders ? false : true } as DeepNotNull<ConditionalOrderCache[]> 
            & {next : boolean});
        }

        return ordersCache.splice(offset, limit + offset).sort((a, b) => 
            new Date(b.orderPlaced).getTime() - new Date(a.orderPlaced).getTime()
        ).concat({ next } as DeepNotNull<ConditionalOrderCache[]> & {next : boolean})
        
    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error ocurred');
    }
}

type CachedServicesPipeline = (DrizzleSelectPremium | DrizzleSelectStar);
type CachedOrders = {orderCache : DrizzleSelectOrder, orderServiceCache : CachedServicesPipeline}

const findOrderDetailAndRelationsCache = async (orderId : string) : Promise<CachedOrders | null> => {
    const orderCache = await redis.json.get(orderKeyById(orderId), '$') as DrizzleSelectOrder[] | null;
    if(!orderCache) return null;

    const orderServiceCache = await redis.json.get(orderCache[0].premiumId ? premiumKey() : starKey(),
        `$[?(@.id == "${orderCache[0].premiumId ? orderCache[0].premiumId : orderCache[0].starId}")]`
    ) as CachedServicesPipeline[] | null;
    if(!orderServiceCache) return null;
    return { orderCache : orderCache[0], orderServiceCache : orderServiceCache[0] };
}

const updateStatus = async (orderId : string, userId : string, status : DrizzleSelectOrder['status']) : Promise<void> => {
    const pipeline = redis.pipeline().json.set(orderKeyById(orderId), '$.status', JSON.stringify(status))
    .json.set(userOrderKeyById(userId), '$.status', JSON.stringify(status));
    await Promise.all([updateOrderStatus(orderId, status), pipeline.exec()])
}

type PrimeTypes = string | number | boolean
export type DeepNotNull<T> = T extends PrimeTypes | Date ? NonNullable<T> : T extends object 
? { [K in keyof T] : DeepNotNull<NonNullable<T[K]>> } : NonNullable<T>

type PremiumOrStar = {duration? : DrizzleSelectPremium['duration'], stars? : DrizzleSelectStar['stars']}
export type OrderWithService<S = 'premium' | 'star'> = Pick<DrizzleSelectPremium, 'irr_price' | 'ton_quantity' | 'id'>
& S extends 'star' ? {stars? : DrizzleSelectStar['stars']} : {duration? : DrizzleSelectPremium['duration']};

export const orderService = async (orderId : string) : Promise<OrderWithService> => {
    try {
        const orderDetaiLCache = await findOrderDetailAndRelationsCache(orderId) as CachedOrders | null;
        if(!orderDetaiLCache) {
            const orderDetail : OrderPlaced= await findFirstOrder(orderId);
            if(!orderDetail) throw new ResourceNotFoundError();

            const filteredOrder = Object.fromEntries(Object.entries(orderDetail).filter(([_, value]) => value !== null)) as DeepNotNull<OrderPlaced>;
            const { star, premium, ...rest } = filteredOrder;
            await updateStatus(orderId,filteredOrder.userId, 'in_progress');
            return { ...rest, service : { star , premium } } as OrderWithService;
        }

        const { orderCache, orderServiceCache } = orderDetaiLCache;
        const premiumOrStar : PremiumOrStar = orderCache.premiumId ? {duration : (orderServiceCache as DrizzleSelectPremium).duration} 
        : {stars : (orderServiceCache as DrizzleSelectStar).stars};
        const { irr_price, ton_quantity, id : serviceId, } = orderServiceCache;
        const { id, orderPlaced, username, status } = orderCache;

        await updateStatus(orderId, orderCache.userId, 'in_progress')
        return { id, status, orderPlaced, username, service : { ...premiumOrStar, irr_price, ton_quantity, id : serviceId } } as OrderWithService;

    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error ocurred');
    }
}

export const completeOrderService = async (orderId : string) : Promise<{status : DrizzleSelectOrder['status']}> => {
    try {
        const orderDetail = await redis.json.get(orderKeyById(orderId), '$') as DrizzleSelectOrder[] | null;
        if(!orderDetail) throw new ResourceNotFoundError();
        await updateStatus(orderId, orderDetail[0].userId, 'completed');
        return {status : 'completed'}
        
    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error occurred');
    }
}

type HistoryServiceMap<S = 'star' | 'premium'> = S extends 'premium' ? {duration : DrizzleSelectPremium['duration'], service : 'premium'} 
: {stars : DrizzleSelectStar['stars'], service : 'star'};
export type OrdersHistory = Omit<DrizzleSelectOrder, 'userId' | 'premiumId' | 'starId'> & {service : HistoryServiceMap, next : boolean}

export const ordersHistoryDB = async (userId : string, status : OrdersFilterByStatusSchema['status'], 
offset : number, limit : number) : Promise<OrdersHistory[]> => {
    const orders : FindOrdersHistoryRT = await findOrdersHistory(userId, status, offset, limit);
    if(!orders) throw new ResourceNotFoundError();
    const next = (offset + limit) > orders.length ? false : true;

    return orders.map(order => {
        const { premiumId, starId, userId, star, premium, ...rest } = order;
        const service = premium ? {duration : premium.duration, service : 'premium'} : {stars : star!.stars, service : 'star'}
        return {...rest, service}
    }).concat({next} as OrdersHistory) as OrdersHistory[]
}

export const ordersHistoryService = async (userId : string, status : OrdersFilterByStatusSchema['status'],
offset : number, limit : number) : Promise<OrdersHistory[]> => {
    try {
        const ordersCache = await redis.json.get(userOrderKeyById(userId), '$') as DeepNotNull<DrizzleSelectOrder>[][] | null;
        if(!ordersCache) return await ordersHistoryDB(userId, status, offset, limit)
        const next : boolean = (offset + limit) > ordersCache.length ? false : true;

        const sortedOrdersCache : DrizzleSelectOrder[] = ordersCache!.flat().filter(order => 
            status === 'completed' ? order.status === 'completed' : order.status != 'completed'
        ).sort((a, b) => new Date(b.orderPlaced).getTime() - new Date(a.orderPlaced).getTime()).slice(offset, limit + offset);

        const pipeline : Pipeline<[]> = redis.pipeline();
        sortedOrdersCache.forEach(order => pipeline.json.get(order.premiumId ? premiumKey() : starKey(), 
            `$[?(@.id == "${order.premiumId ? order.premiumId : order.starId}")]`
        ))

        const servicesMap = new Map<string, HistoryServiceMap>();
        (await pipeline.exec() as CachedServicesPipeline[][]).flat().forEach(service => {
            const premiumService : DrizzleSelectPremium['duration'] = (service as DrizzleSelectPremium).duration;
            servicesMap.set(service.id, premiumService ? {duration : premiumService, service : 'premium'} : {
                stars : (service as DrizzleSelectStar).stars, service : 'star'
            })
        });
        return sortedOrdersCache.map(order => {
            const { premiumId, starId, userId, ...rest } = order;
            return {...rest, service : servicesMap.get(premiumId ? premiumId! : starId!)}
        }).concat({next} as OrdersHistory) as OrdersHistory[]
        
    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error occurred');
    }
}

export type OrderHistory = Omit<DrizzleSelectOrder, 'userId' | 'premiumId' | 'starId'> & {
    service : HistoryServiceMap & Pick<DrizzleSelectStar, 'ton_quantity' | 'irr_price'>;
};

export const orderHistoryDB = async (currentUserId : string) : Promise<OrderHistory> => {
    const order : OrderPlaced = await findFirstOrder(currentUserId);
    if(!order) throw new ResourceNotFoundError();
    
    const { userId, star, premium, ...rest } = order;
    const servicePrice = star ? {irr_price : star.irr_price, ton_quantity : star.ton_quantity} : {
        irr_price : premium!.irr_price, ton_quantity : premium!.ton_quantity
    }
    const service : HistoryServiceMap = premium ? {duration : premium.duration, service : 'premium'} : {
        stars : star!.stars, service : 'star'
    }
    return {...rest, service : {...servicePrice, ...service} }
}

export const orderHistoryService = async (userId : string, orderId : string) : Promise<OrderHistory> => {
    try {
        const order = await redis.json.get(userOrderKeyById(userId), `$[?(@.id == "${orderId}")]`) as DrizzleSelectOrder[] | null;
        if(!order) return orderHistoryDB(userId);
        if(!order) throw new ResourceNotFoundError()
        const serviceDetail = await redis.json.get(order[0].premiumId ? premiumKey() : starKey(), 
            `$[?(@.id == "${order[0].premiumId ? order[0].premiumId : order[0].starId}")]`
        ) as CachedServicesPipeline[] | null;

        const { id, orderPlaced, paymentMethod, status, username } = order[0];
        const service = (serviceDetail![0] as DrizzleSelectPremium) 
        ? {duration : (serviceDetail![0] as DrizzleSelectPremium).duration, service : 'premium'} 
        : {stars : (serviceDetail![0] as DrizzleSelectStar).stars, service : 'star'}
        const { irr_price, ton_quantity } = serviceDetail![0];
        return {id, status, orderPlaced, username, paymentMethod, service : {irr_price, ton_quantity, ...service}} as OrderHistory
        
    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error occurred');
    }
}