import type ZarinPal from 'zarinpal-checkout';
import { findServiceWithCondition, type DesiredService, type PaymentService } from '../database/queries/service.query';
import redis from '../libs/redis.config';
import { zarinpal } from '../libs/zarinpal';
import ErrorHandler from '../middlewares/errorHandler';
import { decodeToken, generateJwt, ResourceNotFoundError } from '../utils';
import { orderKeyById, pendingOrderKeyById, premiumKey, starKey, userOrderKeyById } from '../utils/keys';
import type { DrizzleSelectOrder } from '../models/order.model';
import { insertOrder } from '../database/queries/payment.query';
import type { StatusCode } from 'hono/utils/http-status';
import type { DrizzleSelectPremium, DrizzleSelectStar } from '../models/service.model';

// 1. add a hash token and saved in redis and sended in query for client and client send that back to verify route
type PendingIrrPayment = {username : string; userId : string; serviceId : string; service : PaymentService; amount : number};
export const createIrrPaymentService = async <S extends PaymentService>(serviceId : string, service : S, username : string, userId : string) 
: Promise<ZarinPal.PaymentRequestOutput> => {
    try {
        const serviceKey = service === 'premium' ? premiumKey() : starKey()
        const serviceCache = await redis.json.get(serviceKey, `$[?(@.id == "${serviceId}")]`) as DesiredService<S>[] | null;
        const serviceDetail : DesiredService<S> | null = serviceCache ? serviceCache[0] : await findServiceWithCondition(service, serviceId);
        if(!serviceDetail) throw new ResourceNotFoundError();

        const pendingOrderDetail : PendingIrrPayment = {username, userId, serviceId, service, amount : serviceDetail.irr_price};
        const jwtToken : string = generateJwt(pendingOrderDetail, '10m');
        console.log(jwtToken);
        const paymentDescription : string = 'Teleshop`s secure and fast payment gateway allows you to purchase Telegram premium subscriptions and stars with ease';
        const paymentUrl : ZarinPal.PaymentRequestOutput = await zarinpal.PaymentRequest({
            Amount : pendingOrderDetail.amount, CallbackURL : `${process.env.PAYMENT_REDIRECT_BASE_URL}/${jwtToken}`, Description : paymentDescription,
        });
        if(paymentUrl.status !== 100) throw new ErrorHandler(`Payment url failed with status : ${paymentUrl.status}`, 
            paymentUrl.status as StatusCode, 'An error occurred'
        )
        await redis.json.set(pendingOrderKeyById(jwtToken), '$', pendingOrderDetail);
        return paymentUrl;
        
    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error occurred');
    }
}

const deletePendingOrder = async (userId : string, errorMessage : string, errorStatusCode : StatusCode) : Promise<never> => {
    await redis.json.del(pendingOrderKeyById(userId), '$');
    throw new ErrorHandler(errorMessage, errorStatusCode, 'An error occurred');
}

export type OrderedServiceDetail<S extends PaymentService> = S extends 'star' 
? {stars : DrizzleSelectStar['stars']} : {duration : DrizzleSelectPremium['duration']};
export type PaymentCompleted = Pick<DrizzleSelectOrder, 'id' | 'orderPlaced' | 'status'> 
& {service : PaymentService, username : string} & OrderedServiceDetail<PaymentService>;

export const verifyAndCompletePaymentService = async (token : string, authority : string, paymentStatus : 'OK' | 'NOK') : Promise<PaymentCompleted> => {
    try {
        const { userId } = decodeToken(token, process.env.PAYMENT_TOKEN_SECRET_KEY) as PendingIrrPayment;
        const orderCache = await redis.json.get(pendingOrderKeyById(userId), '$') as PendingIrrPayment[] | null;
        if(!orderCache) throw await deletePendingOrder(userId, 'The payment process failed', 402);
        
        const paymentDetail = await zarinpal.PaymentVerification({Amount : orderCache![0].amount, Authority : authority});
        if(paymentStatus !== 'OK' || paymentDetail.status !== 100) throw await deletePendingOrder(userId, 'The payment process failed', 402);
        const orderService : PaymentService = orderCache[0].service
        const serviceId : string = orderCache[0].serviceId;

        const serviceKey : string = orderService === 'premium' ? premiumKey() : starKey();
        const serviceDetail = await redis.json.get(serviceKey, `$[?(@.id == "${serviceId}")]`) as DesiredService<typeof orderService>[] | null;
        if(!serviceDetail) throw await deletePendingOrder(userId, 'The payment process failed', 402);

        const orderedServiceId = orderCache[0].service === 'premium' ? {premiumId : serviceId} : {starId : serviceId}
        const orderDetail : DrizzleSelectOrder = await insertOrder({userId : userId, username : orderCache[0].username, ...orderedServiceId, paymentMethod : 'IRR'});

        const { id, orderPlaced, status } = orderDetail;
        const orderedService : OrderedServiceDetail<typeof orderService> = orderService === 'premium' 
        ? {duration : (serviceDetail[0] as DesiredService<'premium'>).duration} : {stars : (serviceDetail[0] as DesiredService<'star'>).stars};

        const completedPaymentDetail = {...orderDetail, paymentMethod : 'IRR'}
        await redis.pipeline().json.set(orderKeyById(completedPaymentDetail.id), '$', completedPaymentDetail)
        .json.set(userOrderKeyById(userId), '$', [completedPaymentDetail]).json.del(pendingOrderKeyById(userId), '$').exec();
        return { id, orderPlaced, status, username : orderCache[0].username, service : orderService, ...orderedService };
        
    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error occurred');
    }
}

export const paymentCancelService = async (userId : string) => {
    await redis.json.del(pendingOrderKeyById(userId), '$');
    return 'Payment has been canceled';
}