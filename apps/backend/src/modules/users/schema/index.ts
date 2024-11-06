import { z } from 'zod';

export const telegramInitHashData = z.object({
    initData : z.string({message : 'initData must provided'}).min(10, 'initialData must be at least 10 characters long')
    .max(1000, 'initialData cannot be longer than 1000 characters')
});
export type TelegramInitHashData = z.infer<typeof telegramInitHashData>;

export const cookieOptions = z.object({
    expires : z.date({message : 'Cookie expires must be a valid date'}),
    maxAge : z.number({message : 'Cookie maxAge must be a integer'}).min(60 * 1000, {message : 'Cookie maxAge must not be blow a 1m'}),
    sameSite : z.enum(['strict', 'lax', 'none'], {message : 'Invalid sameSite option : strict | lax | none'}),
    httpOnly : z.boolean().default(true),
    secure : z.boolean().default(true)
});
export type CookieOptions = z.infer<typeof cookieOptions>;