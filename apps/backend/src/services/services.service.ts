import { smembers } from '../database/cache';
import { findManyPremium, findManyStar } from '../database/queries/services.query';
import type { SelectPremium, SelectStar } from '../models/service.model';
import type { LandingPage, ServiceFilterOption } from '../schemas/zod.schema';
import ErrorHandler from '../utils/errorHandler';

export const landingPageService = async () : Promise<LandingPage[]> => {
    try {
        const landingPageCache : string[] = await smembers('landing_page');
        const landingPageDetail : LandingPage[] = landingPageCache.map(landing => JSON.parse(landing));
        return landingPageDetail;

    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error occurred')
    } 
};

export type FilteredServiceResponse<Condition> = Condition extends 'stars' ? SelectStar : SelectPremium;
export const retrieveServices = async (filterOption : ServiceFilterOption) => {
    try {
        const fetchStarData = async () : Promise<FilteredServiceResponse<typeof filterOption>[]> => {
            const starsCache : string[] = await smembers('stars');
            const starsDetail : SelectStar[] = starsCache.length ? starsCache.map(star => JSON.parse(star)) : await findManyStar(); 
            return starsDetail.sort((a, b) => +a.stars - +b.stars) as FilteredServiceResponse<typeof filterOption>[]
        }
        const fetchPremiumData = async () : Promise<FilteredServiceResponse<typeof filterOption>[]> => {
            const premiumCache : string[] = await smembers('premiums');
            const premiumDetail : SelectPremium[] = premiumCache.length ? premiumCache.map(premium => JSON.parse(premium)) 
            : await findManyPremium();
            return premiumDetail as FilteredServiceResponse<typeof filterOption>[];
        }

        const serviceDataFetchers : Record<ServiceFilterOption, () => Promise<FilteredServiceResponse<typeof filterOption>[]>> = {
            premium : fetchPremiumData, stars : fetchStarData
        }
        return await serviceDataFetchers[filterOption]();

    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error occurred')
    } 
}