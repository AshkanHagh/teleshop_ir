import z from 'zod';
import { drizzleSelectUserSchema } from '../models/schema';
import { servicesSchema } from './zod.schema';

export const polBarzakhResponseSchema = z.object({
    success : z.boolean(),
    user : drizzleSelectUserSchema,
    accessToken : z.string()
});
export type PolBarzakhResponseSchema = z.infer<typeof polBarzakhResponseSchema>;

export const refreshTokenResponseSchema = z.object({
    success : z.boolean(),
    accessToken : z.string()
});
export type RefreshTokenResponseSchema = z.infer<typeof refreshTokenResponseSchema>;

export const servicesResponseSchema = z.object({
    success : z.boolean(),
    services : servicesSchema
});
export type ServicesResponseSchema = z.infer<typeof servicesResponseSchema>;

export const serviceResponseSchema = z.object({
    success : z.boolean(),
    service : z.array(z.any())
});
export type ServiceResponseSchema = z.infer<typeof serviceResponseSchema>;