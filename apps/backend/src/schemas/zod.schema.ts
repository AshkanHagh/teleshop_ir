import { z } from 'zod';

export const initializingUserSchema = z.object({
    initialData : z.string().min(10, 'initialData must be at least 10 characters long')
    .max(1000, 'initialData cannot be longer than 1000 characters')
});
export type InitializingUserSchema = z.infer<typeof initializingUserSchema>;

export const cookieOptionsSchema = z.object({
    expires : z.date({message : 'Cookie expires must be a valid date'}),
    maxAge : z.number({message : 'Cookie maxAge must be a integer'}).min(60 * 1000, {message : 'Cookie maxAge must not be blow a 1m'}),
    sameSite : z.enum(['strict', 'lax', 'none'], {message : 'Invalid sameSite option : strict | lax | none'}),
    httpOnly : z.boolean().default(true),
    secure : z.boolean().default(true)
});
export type CookieOptionsSchema = z.infer<typeof cookieOptionsSchema>;

export const bearerTokenSchema = z.string({message : 'Access token must provided'})
.min(1, {message : 'Access token must be at least 1 character'}).trim()
.regex(/^(bearer\s+)?[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/i, {message : 'Invalid jwt token format'});
export type BearerTokenSchema = z.infer<typeof bearerTokenSchema>;