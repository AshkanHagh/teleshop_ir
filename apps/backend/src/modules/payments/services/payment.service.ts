import { zarinpal } from "@shared/libs/zarinpal";
import ErrorHandler from "@shared/utils/errorHandler";
import RedisKeys from "@shared/utils/keys";
import ErrorFactory from "@shared/utils/customErrors";
import { env } from "@env";
import type { PaymentRequest, PaymentVerification } from "zarinpal-checkout-v4/lib/types";
import { findServicePriceByNameAndId, insertOrder } from "../repository";
import RedisQuery from "@shared/db/redis/query";

type PendingOrderPayload = {
    serviceId: string,
    username: string,
    ton: number,
    irr: number,
    userId: string,
    serviceName: "premium" | "star",
}

export const createOrderService = async (
    service: "premium" | "star", 
    serviceId: string, 
    username: string, 
    userId: string
): Promise<string> => 
{
    try {
        const servicePrice = await findServicePriceByNameAndId(service, serviceId);
        console.log(servicePrice);
        if(!servicePrice) throw ErrorFactory.ResourceNotFoundError("Service not found");
        console.log(servicePrice);

        const { irr, ton } = servicePrice;

        const zarinpalCheckout = await zarinpal.requestPayment(
            <PaymentRequest>{
                amount: irr, 
                callback_url: `${env.PAYMENT_REDIRECT_BASE_URL}`, 
                description: env.PAYMENT_DESCRIPTION, 
                currency: "IRT",
            }
        );
        console.log(zarinpalCheckout);
        if(zarinpalCheckout.code !== 100) {
            throw ErrorFactory.BadRequestError(
                `Payment url failed with status: ${zarinpalCheckout.code}`
            );
        }

        const pendingOrderPayload = <PendingOrderPayload>{
            username, 
            userId, 
            serviceId, 
            serviceName: service, 
            ton, 
            irr,
        };

        await RedisQuery.jsonSet(
            RedisKeys.pendingOrder(zarinpalCheckout.authority), 
            "$", 
            JSON.stringify(pendingOrderPayload),
            1000 * 60 * 10
        )
        console.log(zarinpalCheckout.url);
        return zarinpalCheckout.url;
        
    } catch (err: unknown) {
        const error: ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode);
    }
}

export const verifyPaymentService = async (authority: string, paymentStatus: "OK" | "NOK") => {
    try {
        if(paymentStatus !== "OK") {
            throw ErrorFactory.PaymentFailedError(authority, "The payment process has been ended");
        }

        const orderDetail = await RedisQuery.jsonGet(RedisKeys.pendingOrder(authority), "$") as string | null;
        if(!orderDetail) {
            throw ErrorFactory.PaymentFailedError(authority, "The payment process failed. no pending order founded");
        }

        const {
            irr,
            serviceId,
            serviceName,
            ton,
            userId,
            username
        } = JSON.parse(orderDetail)[0] as PendingOrderPayload;

        
        const isPaymentDetailValid = await zarinpal.verifyPayment(<PaymentVerification>{ amount: irr, authority });
        if(isPaymentDetailValid.code !== 100) {
            throw ErrorFactory.PaymentFailedError(authority, "The payment process failed");
        }

        let isPremiumOrStarId = serviceName == "premium" ? { premiumId: serviceId } : { starId: serviceId }
        await Promise.all([
            await insertOrder(
                {
                    irr,
                    ton,
                    transactionId: isPaymentDetailValid.ref_id,
                    username,
                },
                {
                    type: serviceName,
                    userId,
                    ...isPremiumOrStarId,
                }
            ),
            await RedisQuery.jsonDel(RedisKeys.pendingOrder(authority), "$")
        ])

    } catch (err: unknown) {
        await RedisQuery.jsonDel(RedisKeys.pendingOrder(authority), "$");

        const error: ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode);
    }
}