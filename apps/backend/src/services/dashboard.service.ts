import type { CachedServicesPipeline, DeepNotNull, OrderAndServiceCache, OrderMarket, PublicService, SelectOrder, SelectPremium,
    SelectStar, ManyOrdersWithRelationsRT, OrderHistory, PickService, MarketOrder, OrderServiceSpecifier, PaginatedOrders,
    ServiceSpecifier
} from '../types';
import ErrorHandler from '../utils/errorHandler';
import type { HistoryFilterOptions, OrderFiltersOption } from '../schemas/zod.schema';
import redis from '../libs/redis.config';
import { orderKeyById, premiumKey, starKey, userOrderKeyById } from '../utils/keys';
import ErrorFactory from '../utils/customErrors';
import { findManyOrders, findFirstOrder, findOrdersHistory, updateOrderStatus, type FindFirstOrderRT } from '../database/queries/service.query';
import { scanOrdersCache } from '../database/cache/dashboard.cache';
import RedisMethod from '../database/cache';
import type { ChainableCommander } from 'ioredis';

export const ordersService = async (status : OrderFiltersOption['filter'], offset : number, limit : number) 
: Promise<PaginatedOrders | never[]> => {
    try {
        const ordersCache : PaginatedOrders | null = await scanOrdersCache(status, offset, limit);
        if(!ordersCache) {
            const { next, service } = await findManyOrders(status, offset, limit)
            if(!service) return [];
            const modifiedOrders : Pick<PaginatedOrders, 'service'>['service'] = service.map(({premiumId, ...rest}) => ({
                ...rest, service : premiumId ? 'premium' : 'star'
            }));
            return { service : modifiedOrders, next };
        }
        return ordersCache;
        
    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error ocurred');
    }
}

const searchOrderCache = async (orderId : string) : Promise<OrderAndServiceCache | null> => {
    const orderCache = await RedisMethod.jsonget(orderKeyById(orderId), '$') as SelectOrder[] | null;
    if(!orderCache) return null;

    const orderServiceCache = await RedisMethod.jsonget(orderCache[0].premiumId ? premiumKey() : starKey(),
        `$[?(@.id == "${orderCache[0].premiumId ? orderCache[0].premiumId : orderCache[0].starId}")]`
    ) as CachedServicesPipeline[] | null;
    if(!orderServiceCache) return null;
    const { irrPrice, tonQuantity, ...rest } = orderServiceCache[0];
    return { order : orderCache[0], service : rest };
}

const updateOrderStatusFn = async (orderId : string, userId : string, status : SelectOrder['status']) : Promise<void> => {
    const pipeline = redis.pipeline();
    RedisMethod.pipelineJsonset(pipeline, orderKeyById(orderId), '$.status', status, null);
    RedisMethod.pipelineJsonset(pipeline, userOrderKeyById(userId), `$[?(@.id == "${orderId}")].status`, status, null);
    await Promise.all([updateOrderStatus(orderId, status), pipeline.exec()])
}

const specifyService = <T>(service : T, premiumId : string) : OrderServiceSpecifier => {
    return premiumId ? { serviceName : 'premium', duration : (service as ServiceSpecifier<'premium'>).duration } 
    : { serviceName : 'star', stars : (service as ServiceSpecifier<'star'>).stars };
}

const handelCacheMiss = async <S extends PickService>(orderId : string) => {
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
        const orderCache = await RedisMethod.jsonget(orderKeyById(orderId), '$') as SelectOrder[] | null;
        const orderDetail : SelectOrder | null = orderCache ? orderCache[0] : await findFirstOrder(orderId, false, false)
        if(!orderDetail) throw ErrorFactory.ResourceNotFoundError()
        await updateOrderStatusFn(orderId, orderDetail.userId, 'completed');
        return { status : 'completed' }
        
    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error occurred');
    }
}

export const handelHistoriesCashMiss = async (userId : string, status : HistoryFilterOptions['filter'], 
offset : number, limit : number) : Promise<PaginatedHistories> => {
    const { next, service } : Awaited<ManyOrdersWithRelationsRT> = await findOrdersHistory(userId, status, offset, limit);
    const modifiedHistories : MarketOrder[] = service ? service.map(order => {
        const { premium, star, ...rest } = order;
        const service = premium ? {duration : premium.duration, service : 'premium'} : {stars : star!.stars, service : 'star'}
        return {...rest, service}
    }) : [];
    return { service : modifiedHistories, next }
}

export type PaginatedHistories = {service : MarketOrder[], next : boolean};
export const ordersHistoryService = async (userId : string, status : HistoryFilterOptions['filter'],
offset : number, limit : number) : Promise<PaginatedHistories> => {
    try {
        const historiesCache : SelectOrder[] | null = await RedisMethod.jsonget(userOrderKeyById(userId), 
            status === 'all' ? '.' : `$.[?(@.status == "${status}")]`
        );
        if(!historiesCache || !historiesCache.length) return await handelHistoriesCashMiss(userId, status, offset, limit);
        historiesCache.sort((a, b) => new Date(b.orderPlaced).getTime() - new Date(a.orderPlaced).getTime());
        const paginatedHistories : SelectOrder[] = historiesCache.slice(offset, offset + limit);
        const next : boolean = offset + limit < paginatedHistories.length;

        const pipeline : ChainableCommander = redis.pipeline();
        const servicesIdSet = new Set(paginatedHistories.map(({premiumId, starId}) => ({premiumId, starId})));
        servicesIdSet.forEach(service => {
            RedisMethod.pipelineJsonget(pipeline, service.premiumId ? premiumKey() : starKey(), 
                `$[?(@.id == "${service.premiumId ? service.premiumId : service.starId}")]`
            )
        })

        const serviceMarketingMap = new Map<string, PublicService['premium' | 'stars']>();
        (await pipeline.exec())!.map(data => {
            const service = data[1] as (SelectPremium | SelectStar);
            if(!serviceMarketingMap.has(service.id)) {
                serviceMarketingMap.set(service.id, (service as SelectPremium).duration
                    ? <PublicService['premium']>{duration : (service as SelectPremium).duration, serviceName : 'premium'} 
                    : <PublicService['stars']>{stars : (service as SelectStar).stars, serviceName : 'star'}
                );
            }
        })
        
        const modifiedHistories : MarketOrder[] = paginatedHistories.map(order => {
            const { premiumId, starId, userId, irrPrice, tonQuantity, ...rest } = order;
            return { ...rest, service : serviceMarketingMap.get(premiumId ? premiumId! : starId!) }
        });
        return { service : modifiedHistories, next }
        
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
    // @ts-expect-error type error
    return {...rest, service : {...servicePrice, ...publicService}}
}

export const orderHistoryService = async (currentUserId : string, orderId : string) : Promise<OrderHistory> => {
    try {
        const order = await RedisMethod.jsonget(userOrderKeyById(currentUserId), `$[?(@.id == "${orderId}")]`) as SelectOrder[] | null;
        if(!order) return handelHistoryCashMiss(currentUserId);
        const serviceDetail = await RedisMethod.jsonget(order[0].premiumId ? premiumKey() : starKey(), 
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
