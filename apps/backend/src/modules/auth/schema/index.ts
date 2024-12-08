import { z } from "zod";

export const telegramUserSafeData = z.object({
    initData: z
        .string({message: "InitData is missing"})
        .min(10, {message: "Invalid initData"})
        .max(1000, {message: "invalid initData"})
});

export type TelegramUserSafeData = z.infer<typeof telegramUserSafeData>;