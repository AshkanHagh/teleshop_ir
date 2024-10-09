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

export const authorizationHeader = z.object({
    authorization : z.string({message : 'Header authorization must provided'}).startsWith('Bearer', {
        message : 'Token must starts with Bearer'
    })
});

export const bearerToken = z.string({message : 'Access token must provided'}).min(1, {
    message : 'Access token must be at least 1 character'
}).trim().regex(/^(bearer\s+)?[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/i, {message : 'Invalid jwt token format'});
export type BearerToken = z.infer<typeof bearerToken>;

export const options = ['star', 'premium'] as const;
export type ServiceFilterOption = typeof options[number];
export const serviceFilterOptions = z.object({
    service : z.enum(options, { message : 'Invalid service option' })
});
export type ServiceFilterOptions = z.infer<typeof serviceFilterOptions>;

export const placeOrder = z.object({
    username : z.string({message : 'username must provided'}).regex(/^(?!\d)[a-zA-Z0-9_]{5,32}$/, {
        message : 'Invalid Telegram username format'
    }),
    service : z.enum(['star', 'premium'])
});
export type PlaceOrder = z.infer<typeof placeOrder>;

export const verifyId = z.string({message : 'id params must provided'});

export const paymentQuery = z.object({
    Authority : z.string({message : 'Invalid payment there is no Authority query'}),
    Status : z.enum(['OK', 'NOK'])
});
export type PaymentQuery = z.infer<typeof paymentQuery>;

export const pagination = z.object({
    offset : z.string().default('0'),
    limit : z.string().default('10')
});
export type Pagination = z.infer<typeof pagination>;

export const orderFiltersOptions = z.object({
    filter : z.enum(['all', 'completed', 'pending'], {message : 'Invalid filter options. [all, completed, pending]'})
}).merge(pagination);
export type OrderFiltersOption = z.infer<typeof orderFiltersOptions>;

export const historyFilterOptions = z.object({
    filter : z.enum(['completed', 'pending', 'in_progress', 'all'], {
        message : 'Invalid filter options. [completed, pending, in_progress, all]'
    })
}).merge(pagination);
export type HistoryFilterOptions = z.infer<typeof historyFilterOptions>;