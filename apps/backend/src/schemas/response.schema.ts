import z from 'zod';
import { selectUserSchema } from '../models/schema';
import { landingPageSchema } from './zod.schema';

export const polBarzakhResponseSchema = z.object({
    success : z.boolean(),
    user : selectUserSchema,
    accessToken : z.string()
});
export type PolBarzakhResponseSchema = z.infer<typeof polBarzakhResponseSchema>;

export const refreshTokenResponseSchema = z.object({
    success : z.boolean(),
    accessToken : z.string()
});
export type RefreshTokenResponseSchema = z.infer<typeof refreshTokenResponseSchema>;

export const landingPageResponseSchema = z.object({
    success : z.boolean(),
    landingPage : landingPageSchema
});
export type LandingPageResponseSchema = z.infer<typeof landingPageResponseSchema>;

export const servicesResponseSchema = z.object({
    success : z.boolean(),
    service : z.array(z.any())
});
export type ServicesResponseSchema = z.infer<typeof servicesResponseSchema>;