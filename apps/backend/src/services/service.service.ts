import type { ServicesSchema, ServiceOption } from '../schemas/zod.schema';
import ErrorHandler from '../middlewares/errorHandler';
import redis from '../libs/redis.config';
import { premiumKey, servicesKey, starKey } from '../utils/keys';
import type { DrizzleSelectPremium, DrizzleSelectStar } from '../models/service.model';
import { findMany } from '../database/queries/service.query';

export const servicesService = async () : Promise<ServicesSchema[]> => {
    try {
        const servicesCache = await redis.json.get(servicesKey(), '$') as ServicesSchema[][] | null;
        if(!servicesCache) throw new ErrorHandler('We are sorry there is a problem with server. please try latter');
        return servicesCache[0];

    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error occurred')
    } 
};

export type ConditionalService<Condition> = Condition extends 'stars' ? DrizzleSelectStar : DrizzleSelectPremium;
export const serviceService = async <Service extends ServiceOption>(service : Service) => {
    try {
        const stars = async () : Promise<ConditionalService<Service>[]> => {
            const starsCache = await redis.json.get(starKey(), '$') as DrizzleSelectStar[][] | null;
            const stars : DrizzleSelectStar[] = starsCache ? starsCache[0] : await findMany('starTable');
            return stars.sort((a, b) => +a.stars - +b.stars) as ConditionalService<Service>[]
        }
        const premium = async () : Promise<ConditionalService<Service>[]> => {
            const premiumCache = await redis.json.get(premiumKey(), '$') as DrizzleSelectPremium[][] | null;
            const premium : DrizzleSelectPremium[] = premiumCache ? premiumCache[0] : await findMany('premiumTable');
            return premium as ConditionalService<Service>[];
        }

        const serviceDataFetchers : Record<ServiceOption, () => Promise<ConditionalService<Service>[]>> = {premium, stars}
        return await serviceDataFetchers[service]();

    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error occurred')
    } 
}