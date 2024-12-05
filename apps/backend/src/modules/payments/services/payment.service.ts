import { findServiceWithCondition, InsertOrderTableFn } from "../db/queries";
import { zarinpal } from "@shared/libs/zarinpal";
import ErrorHandler from "@shared/utils/errorHandler";
import { pendingOrderKeyById } from "@shared/utils/keys";
import type { PendingZarinPalOrder, PickDurationOrStar, PickService, PickServiceType, PlacedOrder, SelectOrderTable } from "@types";
import ErrorFactory from "@shared/utils/customErrors";
import type { StatusCode } from "hono/utils/http-status";
import { env } from "@env";
import type { PaymentRequest, PaymentVerification } from "zarinpal-checkout-v4/lib/types";
import Redis from "@shared/db/caching";

export const createIrrPaymentService = async <S extends PickService>(serviceId: string, service: S, username: string, 
userId: string): Promise<string> => {
    try {
        const serviceDetail: PickServiceType<S> | null = await findServiceWithCondition(service, serviceId);
        if(!serviceDetail) throw ErrorFactory.ResourceNotFoundError();

        const paymentDescription: string = env.PAYMENT_DISCRIPTION;
        const zarinpalResponse = await zarinpal.requestPayment(<PaymentRequest>{
            amount: serviceDetail.irrPrice, callback_url: `${env.PAYMENT_REDIRECT_BASE_URL}`, 
            description: paymentDescription, currency: "IRT"
        });
        if(zarinpalResponse.code !== 100) {
            throw new ErrorHandler(`Payment url failed with status: ${zarinpalResponse.code}`, 400, "An error occurred");
        }
        const pendingOrderDetail: PendingZarinPalOrder = {username, userId, serviceId, service, 
            irrPrice: serviceDetail.irrPrice, tonQuantity: serviceDetail.tonQuantity
        };
        await Redis.hset(pendingOrderKeyById(zarinpalResponse.authority), pendingOrderDetail, 1000 * 60 * 10);
        return zarinpalResponse.url;
        
    } catch (err: unknown) {
        const error: ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, "An error occurred");
    }
}

const deletePendingOrder = async (userId: string, errorMessage: string, errorStatusCode: StatusCode): Promise<never> => {
    await Redis.hdel(pendingOrderKeyById(userId));
    throw new ErrorHandler(errorMessage, errorStatusCode, "An error occurred");
}

export const verifyAndCompletePaymentService = async (authority: string, paymentStatus: "OK" | "NOK"): Promise<PlacedOrder> => {
    try {
        const pendingOrderDetail = await Redis.hgetall(pendingOrderKeyById(authority)) as PendingZarinPalOrder[] | null;
        if(!pendingOrderDetail) throw await deletePendingOrder(authority, "The payment process failed. no pending order founded", 402);
        const { userId: currentUserId, irrPrice, tonQuantity, service: serviceName, serviceId, username } = pendingOrderDetail[0];

        if(paymentStatus !== "OK") throw await deletePendingOrder(authority, "The payment process has been ended", 402);
        const zarinPalPaymentState = await zarinpal.verifyPayment(<PaymentVerification>{ amount: irrPrice, authority });
        if(zarinPalPaymentState.code !== 100) throw await deletePendingOrder(authority, "The payment process failed", 402);

        const serviceDetail = await findServiceWithCondition(serviceName, serviceId);
        if(!serviceDetail) throw await deletePendingOrder(authority, "The payment process failed", 402);

        const orderedServiceId = serviceName === "premium" ? {premiumId: serviceId}: {starId: serviceId}
        const order: SelectOrderTable = await InsertOrderTableFn({userId: currentUserId, username, ...orderedServiceId, 
            paymentMethod: "IRR", irrPrice, tonQuantity, transactionId: zarinPalPaymentState.ref_id
        });
        const { id, orderPlaced, status } = order;

        const pickedDurationOrStars: PickDurationOrStar<typeof serviceName> = serviceName === "premium"
        ? { duration: (serviceDetail as PickServiceType<"premium">).duration }
       : { stars: (serviceDetail as PickServiceType<"star">).stars }

        return { id, orderPlaced, status, username, transactionId: zarinPalPaymentState.ref_id, service: serviceName, 
            ...pickedDurationOrStars 
        } as PlacedOrder;
        
    } catch (err: unknown) {
        const error: ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, "An error occurred");
    }
}