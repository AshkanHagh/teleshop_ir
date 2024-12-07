import type { Context } from "hono";
import { CatchAsyncError } from "@shared/utils/catchAsyncError";
import { createOrderService, verifyPaymentService } from "../services/payment.service";

type OrderPayload = {
    username: string,
    service: "premium" | "star"
}

export const createOrder = CatchAsyncError(async (context: Context) => {
    const { username, service } = await context.req.json() as OrderPayload;
    const { serviceId } = context.req.param();
    const { id } = context.get("user");

    const zarinpalCheckoutUrl = await createOrderService(service, serviceId, username, id);

    return context.json({success: true, paymentUrl: zarinpalCheckoutUrl});
});

type ZarinpalVerifyQueryParams = {
    Authority: string,
    Status: "OK" | "NOK"
}

export const verifyPayment = CatchAsyncError(async (context: Context) => {
    const { Authority, Status } = context.req.query() as ZarinpalVerifyQueryParams;

    await verifyPaymentService(Authority, Status);
    return context.json({success: true, message: "Purchase completed successfully"});
});