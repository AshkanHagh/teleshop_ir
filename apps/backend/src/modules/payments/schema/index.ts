import { z } from "zod";

export const placeOrder = z.object({
    username: z.string({message: "username must provided"}).regex(/^(?!\d)[a-zA-Z0-9_]{5,32}$/, {
        message: "Invalid Telegram username format"
    }),
    service: z.enum(["star", "premium"])
});
export type PlaceOrder = z.infer<typeof placeOrder>;

export const verifyId = z.string({message: "id params must provided"});

export const paymentQuery = z.object({
    Authority: z.string({message: "Invalid payment there is no Authority query"}),
    Status: z.enum(["OK", "NOK"])
});
export type PaymentQuery = z.infer<typeof paymentQuery>;