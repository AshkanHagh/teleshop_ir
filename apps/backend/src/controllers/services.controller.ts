import type { Context } from 'hono';
import { CatchAsyncError } from '../utils';
import { landingPageService, retrieveServices, type FilteredServiceResponse } from '../services/services.service';
import { type LandingPage, type ServiceFilterSchema } from '../schemas/zod.schema';

export const landingPage = CatchAsyncError(async (context : Context) => {
    const landingPage : LandingPage[] = await landingPageService();
    return context.json({success : true, landingPage});
});

export const services = CatchAsyncError(async (context : Context) => {
    const { service } = context.req.validated.query as ServiceFilterSchema;
    const services : FilteredServiceResponse<typeof service>[] = await retrieveServices(service);
    return context.json({success : true, services});
})