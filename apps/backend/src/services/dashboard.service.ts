import type { CachedServicesPipeline, DeepNotNull, OrderAndServiceCache, OrderMarket, PublicOrder, 
    PublicService, SelectOrder, SelectPremium, SelectStar, ManyOrdersWithRelationsRT, OrderHistory, 
    PickService, MarketOrder, OrderServiceSpecifier
} from '../types';
import { scanOrdersCache } from '../database/cache/dashboard.cache';
import ErrorHandler from '../utils/errorHandler';
import type { HistoryFilterOptions, OrderFiltersOption } from '../schemas/zod.schema';
import redis from '../libs/redis.config';
import { orderKeyById, premiumKey, starKey, userOrderKeyById } from '../utils/keys';
import type { Pipeline } from '@upstash/redis';
import ErrorFactory from '../utils/customErrors';
import { historyWorker } from '../workers/workerPools';
import { findManyOrders, findFirstOrder, findOrdersHistory, updateOrderStatus, type FindFirstOrderRT } from '../database/queries/service.query';

export const ordersService = async (status : OrderFiltersOption['filter'], offset : number, limit : number) 
: Promise<PublicOrder[]> => {
    try {
        const paginatedOrdersCache = await scanOrdersCache(status, offset, limit) as DeepNotNull<PublicOrder[]>;
        if(!paginatedOrdersCache) {
            const orders = (await findManyOrders(status, offset, limit)).map(({premiumId, ...rest}) => ({
                ...rest, service : premiumId ? 'premium' : 'star'
            })) as PublicOrder[];
            return orders ? orders : [];
        }
        return paginatedOrdersCache;
        
    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error ocurred');
    }
}

const searchOrderCache = async (orderId : string) : Promise<OrderAndServiceCache | null> => {
    const orderCache = await redis.json.get(orderKeyById(orderId), '$') as SelectOrder[] | null;
    if(!orderCache) return null;

    const orderServiceCache = await redis.json.get(orderCache[0].premiumId ? premiumKey() : starKey(),
        `$[?(@.id == "${orderCache[0].premiumId ? orderCache[0].premiumId : orderCache[0].starId}")]`
    ) as CachedServicesPipeline[] | null;
    if(!orderServiceCache) return null;
    const { irrPrice, tonQuantity, ...rest } = orderServiceCache[0];
    return { order : orderCache[0], service : rest };
}

const updateOrderStatusFn = async (orderId : string, userId : string, status : SelectOrder['status']) : Promise<void> => {
    const pipeline = redis.pipeline().json.set(orderKeyById(orderId), '$.status', JSON.stringify(status))
    .json.set(userOrderKeyById(userId), `$[?(@.id == "${orderId}")].status`, JSON.stringify(status));
    await Promise.all([updateOrderStatus(orderId, status), pipeline.exec()])
}

type ServiceSpecifier<T extends 'star' | 'premium'> = T extends 'premium' 
? {duration : SelectPremium['duration']} : {stars : SelectStar['stars']};
const specifyService = <T>(service : T, premiumId : string) : OrderServiceSpecifier => {
    return premiumId ? { serviceName : 'premium', duration : (service as ServiceSpecifier<'premium'>).duration } 
    : { serviceName : 'star', stars : (service as ServiceSpecifier<'star'>).stars };
}

async function handelCacheMiss<S extends PickService>(orderId : string) {
    const orderDetail = await findFirstOrder(orderId, true, true);
    if(!orderDetail) throw ErrorFactory.ResourceNotFoundError();
    
    const filteredOrder = Object.fromEntries(Object.entries(orderDetail).filter(([_, value]) => value !== null)) as 
    DeepNotNull<FindFirstOrderRT<true, true>>;
    const { star, premium, irrPrice, tonQuantity, userId, ...rest } = filteredOrder;
    const specifiedService : OrderServiceSpecifier = specifyService({stars : star?.stars || undefined, 
        duration : premium?.duration || undefined}, premium.id!
    );
    await updateOrderStatusFn(orderId, userId, 'in_progress');
    return {...rest, service : { id : star?.id || premium.id, irrPrice, tonQuantity, ...specifiedService, 
        ...specifiedService 
    }} as OrderMarket<S>;
}

export const orderService = async <S extends PickService>(orderId : string) : Promise<OrderMarket<S>> => {
    try {
        const orderDetaiLCache : OrderAndServiceCache | null = await searchOrderCache(orderId);
        if(!orderDetaiLCache) return await handelCacheMiss<S>(orderId);
        const { order, service } = orderDetaiLCache;
        const specifiedService : OrderServiceSpecifier = specifyService(service, order.premiumId!);

        const { id, orderPlaced, username, status, irrPrice, tonQuantity, userId } = order;
        await updateOrderStatusFn(orderId, userId, 'in_progress')
        return { id, status, orderPlaced, username, service : {...specifiedService, irrPrice, tonQuantity, id : service.id}} as OrderMarket<S>;

    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error ocurred');
    }
}

export const completeOrderService = async (orderId : string) : Promise<{status : SelectOrder['status']}> => {
    try {
        const orderCache = await redis.json.get(orderKeyById(orderId), '$') as SelectOrder[] | null;
        const orderDetail : SelectOrder | null = orderCache ? orderCache[0] : await findFirstOrder(orderId, false, false)
        if(!orderDetail) throw ErrorFactory.ResourceNotFoundError()
        await updateOrderStatusFn(orderId, orderDetail.userId, 'completed');
        return {status : 'completed'}
        
    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error occurred');
    }
}

export const handelHistoriesCashMiss = async (userId : string, status : HistoryFilterOptions['filter'], 
offset : number, limit : number) : Promise<MarketOrder[]> => {
    const orders : Awaited<ManyOrdersWithRelationsRT> = await findOrdersHistory(userId, status, offset, limit);
    return orders ? orders.map(order => {
        const { premiumId, starId, userId, star, premium, irrPrice, tonQuantity, ...rest } = order;
        const service = premium ? {duration : premium.duration, service : 'premium'} : {stars : star!.stars, service : 'star'}
        return {...rest, service}
    }) : [];
}

export const ordersHistoryService = async (userId : string, status : HistoryFilterOptions['filter'],
offset : number, limit : number) : Promise<MarketOrder[]> => {
    try {
        const historiesCache = await redis.json.get(userOrderKeyById(userId), '$') as DeepNotNull<SelectOrder>[][] | null;
        if(!historiesCache) return await handelHistoriesCashMiss(userId, status, offset, limit);

        const sortedAndFilteredHistories : DeepNotNull<SelectOrder>[] = await historyWorker.runWorker({
            histories : historiesCache.flat(), status
        }) as DeepNotNull<SelectOrder>[]
        if(!sortedAndFilteredHistories.length) return await handelHistoriesCashMiss(userId, status, offset, limit);

        const pipeline : Pipeline<[]> = redis.pipeline();
        const serviceIdMap : Map<string, string> = new Map();
        sortedAndFilteredHistories.forEach(order => {
            if(!serviceIdMap.has(order.premiumId || order.starId)) {
                serviceIdMap.set(order.premiumId || order.starId, 'done');
                pipeline.json.get(order.premiumId ? premiumKey() : starKey(), 
                    `$[?(@.id == "${order.premiumId ? order.premiumId : order.starId}")]`
                )
            }
        })

        const servicesMap = new Map<string, PublicService['premium' | 'stars']>();
        (await pipeline.exec() as CachedServicesPipeline[][]).flatMap(([service]) => {
            const premiumService : SelectPremium['duration'] = (service as SelectPremium).duration;
            servicesMap.set(service.id, premiumService 
                ? <PublicService['premium']>{duration : premiumService, serviceName : 'premium'} 
                : <PublicService['stars']>{stars : (service as SelectStar).stars, serviceName : 'star'}
            );
        });
        return sortedAndFilteredHistories.map(order => {
            const { premiumId, starId, userId, irrPrice, tonQuantity, ...rest } = order;
            return { ...rest, service : servicesMap.get(premiumId ? premiumId! : starId!) }
        }) as MarketOrder[]
        
    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error occurred');
    }
}

export const handelHistoryCashMiss = async (currentUserId : string) : Promise<OrderHistory> => {
    const order : Awaited<FindFirstOrderRT<true, true>> = await findFirstOrder(currentUserId, true, true);
    if(!order) throw ErrorFactory.ResourceNotFoundError();
    
    const { userId, star, premium, tonQuantity, irrPrice, ...rest } = order;
    const servicePrice : Pick<SelectOrder, 'irrPrice' | 'tonQuantity'> = { irrPrice, tonQuantity }
    const publicService : PublicService['premium' | 'stars'] = premium ? <PublicService['premium']>{
        duration : premium.duration, serviceName : 'premium'
    } : <PublicService['stars']>{stars : star!.stars, serviceName : 'star'};
    // @ts-ignore
    return {...rest, service : {...servicePrice, ...publicService}}
}

export const orderHistoryService = async (currentUserId : string, orderId : string) : Promise<OrderHistory> => {
    try {
        const order = await redis.json.get(userOrderKeyById(currentUserId), `$[?(@.id == "${orderId}")]`) as SelectOrder[] | null;
        if(!order) return handelHistoryCashMiss(currentUserId);
        const serviceDetail = await redis.json.get(order[0].premiumId ? premiumKey() : starKey(), 
            `$[?(@.id == "${order[0].premiumId ? order[0].premiumId : order[0].starId}")]`
        ) as CachedServicesPipeline[] | null;

        const { premiumId, starId, userId, irrPrice, tonQuantity, ...rest } = order[0];
        const { duration, stars } = {stars : (serviceDetail![0] as SelectStar).stars, duration : (serviceDetail![0] as SelectPremium).duration}
        const service = (serviceDetail![0] as SelectPremium) ? <PublicService['premium']>{duration, serviceName : 'premium'} 
        : <PublicService['stars']>{stars, serviceName : 'star'};
        return {...rest, service : {irrPrice, tonQuantity, ...service}} as OrderHistory
        
    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error occurred');
    }
}