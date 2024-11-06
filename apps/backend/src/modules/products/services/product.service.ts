import ErrorHandler from '@shared/utils/errorHandler';
import { servicesKey } from '@shared/utils/keys';
import { findManyService } from '../db/queries';
import type { PickServiceType, SelectPremiumTable, ProductIntroduction, SelectStarTable } from '@types';
import type { ServiceFilterOption } from '../schema';
import Redis from '@shared/db/caching';

export const productIntroductionService = async () : Promise<ProductIntroduction[]> => {
    try {
        const productsForIntroductionRow = await Redis.lrange(servicesKey()) as string[]
        const productsForIntroduction = productsForIntroductionRow.map(product => JSON.parse(product));
        if(!productsForIntroduction || !productsForIntroduction.length) {
            throw new ErrorHandler('No products for introduction. please report this issue');
        }
        return productsForIntroduction.flat();

    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error occurred')
    } 
};

export const productsService = async <Filter extends ServiceFilterOption>(filter : Filter) : Promise<PickServiceType<Filter>[]> => {
    try {
        const findProductStar = async () : Promise<PickServiceType<Filter>[]> => {
            const stars : SelectStarTable[] = await findManyService('starTable');
            return stars.sort((a, b) => +a.stars - +b.stars) as PickServiceType<Filter>[];
        }
        const findProductPremium = async () : Promise<PickServiceType<Filter>[]> => {
            const premiums : SelectPremiumTable[] = await findManyService('premiumTable');
            return premiums as PickServiceType<Filter>[];
        }

        const productPicker : Record<ServiceFilterOption, () => Promise<PickServiceType<Filter>[]>> = {
            premium : findProductPremium, star : findProductStar
        }
        return await productPicker[filter]();

    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error occurred')
    } 
}