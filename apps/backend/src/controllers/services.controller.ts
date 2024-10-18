import type { Context } from 'hono';
import { CatchAsyncError } from '../middlewares/catchAsyncError';
import { serviceService, servicesService } from '../services/service.service';
import type { ServiceFilterOptions } from '../schemas/zod.schema';
import type { PickServiceType, SelectServices } from '../types';

export const services = CatchAsyncError(async (context : Context) => {
    const services : SelectServices[] = await servicesService();
    return context.json({success : true, services : services});
});

export const service = CatchAsyncError(async (context : Context) => {
    const { service } = context.var.query as ServiceFilterOptions;
    const serviceDetail : PickServiceType<typeof service>[] = await serviceService(service);
    return context.json({success : true, service : serviceDetail});
})