import type { Context } from 'hono';
import { CatchAsyncError } from '../middlewares/catchAsyncError';
import { serviceService, servicesService, type ConditionalService } from '../services/service.service';
import type { ServiceOptionSchema, ServicesSchema } from '../schemas/zod.schema';

export const services = CatchAsyncError(async (context : Context) => {
    const services : ServicesSchema[] = await servicesService();
    return context.json({success : true, services : services});
});

export const service = CatchAsyncError(async (context : Context) => {
    const { service } = context.req.validated.query as ServiceOptionSchema;
    const serviceDetail : ConditionalService<typeof service>[] = await serviceService(service);
    return context.json({success : true, service : serviceDetail});
})