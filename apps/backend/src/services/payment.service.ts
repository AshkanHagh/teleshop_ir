import { findServiceWithCondition } from '@queries/service.query';
import redis from '@libs/redis.config';
import { zarinpal } from '@libs/zarinpal';
import ErrorHandler from '@utils/errorHandler';
import { orderKeyById, pendingOrderKeyById, premiumKey, starKey, userOrderKeyById } from '@utils/keys';
import { insertOrder } from '@queries/service.query';
import type { PendingZarinPalOrder, PickDurationOrStar, PickService, PickServiceType, PlacedOrder, SelectOrder } from '@types';
import ErrorFactory from '@utils/customErrors';
import type { StatusCode } from 'hono/utils/http-status';
import { env } from '@env';
import type { PaymentRequest, PaymentVerification } from 'zarinpal-checkout-v4/lib/types';
import RedisMethod from '@cache/.';
import type { ChainableCommander } from 'ioredis';

export const createIrrPaymentService = async <S extends PickService>(serviceId : string, service : S, username : string, 
userId : string) : Promise<string> => {
    try {
        const serviceKey = service === 'premium' ? premiumKey() : starKey();
        const serviceCache = await RedisMethod.jsonget(serviceKey, `$[?(@.id == "${serviceId}")]`) as PickServiceType<S> | null;
        const serviceDetail : PickServiceType<S> | null = serviceCache ? serviceCache : await findServiceWithCondition(service, serviceId);
        if(!serviceDetail) throw ErrorFactory.ResourceNotFoundError();

        const paymentDescription : string = env.PAYMENT_DISCRIPTION;
        const zarinpalResponse = await zarinpal.requestPayment(<PaymentRequest>{
            amount : serviceDetail.irrPrice, callback_url : `${env.PAYMENT_REDIRECT_BASE_URL}/api/payments/irr/verify`, 
            description : paymentDescription, currency : 'IRT'
        });
        if(zarinpalResponse.code !== 100) throw new ErrorHandler(`Payment url failed with status : ${zarinpalResponse.code}`, 
            400, 'An error occurred'
        )
        const pendingOrderDetail : PendingZarinPalOrder = {username, userId, serviceId, service, 
            irrPrice : serviceDetail.irrPrice, tonQuantity : serviceDetail.tonQuantity
        };
        await RedisMethod.jsonset(pendingOrderKeyById(zarinpalResponse.authority), '$', pendingOrderDetail, 60 * 8);
        return zarinpalResponse.url;
        
    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error occurred');
    }
}

const deletePendingOrder = async (userId : string, errorMessage : string, errorStatusCode : StatusCode) : Promise<never> => {
    await RedisMethod.jsondel(pendingOrderKeyById(userId), '.');
    throw new ErrorHandler(errorMessage, errorStatusCode, 'An error occurred');
}

export const verifyAndCompletePaymentService = async (authority : string, paymentStatus : 'OK' | 'NOK') : Promise<PlacedOrder> => {
    try {
        const pendingOrderDetail = await RedisMethod.jsonget(pendingOrderKeyById(authority), '$') as PendingZarinPalOrder[] | null;
        if(!pendingOrderDetail) throw await deletePendingOrder(authority, 'The payment process failed. no pending order founded', 402);
        const { userId : currentUserId, irrPrice, tonQuantity, service : serviceName, serviceId, username } = pendingOrderDetail[0];

        if(paymentStatus !== 'OK') throw await deletePendingOrder(authority, 'The payment process has been ended', 402);
        const zarinPalPaymentState = await zarinpal.verifyPayment(<PaymentVerification>{ amount : irrPrice, authority });
        if(zarinPalPaymentState.code !== 100) throw await deletePendingOrder(authority, 'The payment process failed', 402);

        const serviceCacheKey : string = serviceName === 'premium' ? premiumKey() : starKey();
        const serviceDetail = await RedisMethod.jsonget(serviceCacheKey, `$[?(@.id == "${serviceId}")]`) as PickServiceType<typeof serviceName>[] | null;
        if(!serviceDetail) throw await deletePendingOrder(authority, 'The payment process failed', 402);

        const orderedServiceId = serviceName === 'premium' ? {premiumId : serviceId} : {starId : serviceId}
        const order : SelectOrder = await insertOrder({userId : currentUserId, username, ...orderedServiceId, 
            paymentMethod : 'IRR', irrPrice, tonQuantity, transactionId : zarinPalPaymentState.ref_id
        });
        const { id, orderPlaced, status } = order;
        const ordersHistory = await RedisMethod.jsonget(userOrderKeyById(currentUserId), '$') as SelectOrder[][] | null;
        const pipeline : ChainableCommander = redis.pipeline();
        ordersHistory ? RedisMethod.pipelineJsonArrappend(pipeline, userOrderKeyById(currentUserId), '$', order, null) 
        : RedisMethod.pipelineJsonset(pipeline, userOrderKeyById(currentUserId), '$', [order], null);

        const pickedDurationOrStars : PickDurationOrStar<typeof serviceName> = serviceName === 'premium'
        ? { duration : (serviceDetail[0] as PickServiceType<'premium'>).duration }
        : { stars : (serviceDetail[0] as PickServiceType<'star'>).stars }

        RedisMethod.pipelineJsondel(pipeline, pendingOrderKeyById(currentUserId), '.');
        RedisMethod.pipelineJsonset(pipeline, orderKeyById(order.id), '$', order, null);
        await pipeline.exec();
        return { id, orderPlaced, status, username, transactionId : zarinPalPaymentState.ref_id, service : serviceName, 
            ...pickedDurationOrStars 
        } as PlacedOrder;
        
    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error occurred');
    }
}