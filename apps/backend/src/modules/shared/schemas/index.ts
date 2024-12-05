import { z } from "zod";

export const cookieOptions = z.object({
    expires: z.date({message: "Cookie expires must be a valid date"}),
    maxAge: z.number({message: "Cookie maxAge must be a integer"}).min(60 * 1000, {message: "Cookie maxAge must not be blow a 1m"}),
    sameSite: z.enum(["strict", "lax", "none"], {message: "Invalid sameSite option: strict | lax | none"}),
    httpOnly: z.boolean().default(true),
    secure: z.boolean().default(true)
});
export type CookieOptions = z.infer<typeof cookieOptions>;

export const bearerToken = z.string({message: "Access token must provided"}).min(1, {
    message: "Access token must be at least 1 character"
}).trim().regex(/^(bearer\s+)?[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/i, {message: "Invalid jwt token format"});
export type BearerToken = z.infer<typeof bearerToken>;