import ErrorHandler from '../utils/errorHandler';
import { premiumKey, servicesKey, starKey } from '../utils/keys';
import { findManyService } from '../database/queries/service.query';
import type { PickServiceType, SelectPremium, SelectServices, SelectStar } from '../types';
import type { ServiceFilterOption } from '../schemas/zod.schema';
import RedisMethod from '../database/cache';

export const servicesService = async () : Promise<SelectServices[]> => {
    try {
        const servicesCache = await RedisMethod.jsonget(servicesKey(), '$') as SelectServices[][] | null;
        if(!servicesCache) throw new ErrorHandler('We are sorry there is a problem with server. please try latter');
        return servicesCache.flat();

    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error occurred')
    } 
};

export const serviceService = async <Filter extends ServiceFilterOption>(filter : Filter) : Promise<PickServiceType<Filter>[]> => {
    try {
        const handelStar = async () : Promise<PickServiceType<Filter>[]> => {
            const starsCache = await RedisMethod.jsonget(starKey(), '$') as SelectStar[][] | null;
            const stars : SelectStar[] = starsCache ? starsCache[0] : await findManyService('starTable');
            return stars.sort((a, b) => +a.stars - +b.stars) as PickServiceType<Filter>[]
        }
        const handelPremium = async () : Promise<PickServiceType<Filter>[]> => {
            const premiumCache = await RedisMethod.jsonget(premiumKey(), '$') as SelectPremium[][] | null;
            const premium : SelectPremium[] = premiumCache ? premiumCache[0] : await findManyService('premiumTable');
            return premium as PickServiceType<Filter>[];
        }

        const serviceDataFetchers : Record<ServiceFilterOption, () => Promise<PickServiceType<Filter>[]>> = {
            premium : handelPremium, star : handelStar
        }
        return await serviceDataFetchers[filter]();

    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error occurred')
    } 
}