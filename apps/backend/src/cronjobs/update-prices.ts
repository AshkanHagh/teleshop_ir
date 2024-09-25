import { fetch } from 'bun';
import ErrorHandler from '../middlewares/errorHandler';
import cron from 'node-cron';
import redis from '../libs/redis.config';
import { premiumKey, starKey } from '../utils/keys';
import type { DrizzleSelectPremium, DrizzleSelectStar } from '../models/service.model';
import type { Pipeline } from '@upstash/redis';
import { updatePremiumTonAndRialPrice, updateStarPrices, type UpdatesDetail } from '../database/queries/service.query';

let tonCache : number | null = null;
let usdToIrrCache : number | null = null;
let cacheTimer : NodeJS.Timer | number | null = null;

const clearCache = () => {
    tonCache = null;
    usdToIrrCache = null;
}

const resetCacheTimer = () => {
    if (cacheTimer) clearTimeout(cacheTimer);
    cacheTimer = setTimeout(clearCache, 15 * 60 * 1000);
};

export type TonPrice = { 'the-open-network' : { usd : number } };
export type UsdToIrrRate = { conversion_rate : number };
const calculateTonPriceInIrr = async (tonAmount : number, profitInIrr : number) => {
    try {
        if (tonCache === null || usdToIrrCache === null) {
            const [tonPriceResponse, usdToIrrResponse] = await Promise.all([
                fetch(process.env.COINGECKO_API!),
                fetch(process.env.EXCHANGERATE_API!)
            ]);
            const [tonPriceData, usdToIrrData]: [TonPrice, UsdToIrrRate] = await Promise.all([
                tonPriceResponse.json() as Promise<TonPrice>,
                usdToIrrResponse.json() as Promise<UsdToIrrRate>
            ]);

            tonCache = tonPriceData['the-open-network'].usd;
            usdToIrrCache = usdToIrrData.conversion_rate;
            resetCacheTimer();
        }
        const tonUsdPrice : number = tonCache;
        const usdToIrrConversionRate : number = usdToIrrCache;

        const tonPriceInIrr : number = tonUsdPrice * usdToIrrConversionRate;
        const profitInTon : number = parseFloat((profitInIrr / tonPriceInIrr).toFixed(2));
        const totalTonAmount : number = parseFloat((tonAmount + profitInTon).toFixed(2));
        const totalTonPriceInIrr : number = parseFloat((totalTonAmount * tonPriceInIrr).toFixed(3));

        return { totalTonPriceInIrr, totalTonAmount };
        
    } catch (error : unknown) {
        const customError : ErrorHandler = error as ErrorHandler;
        throw new ErrorHandler(customError.message, customError.statusCode, 'An error occurred');
    }
}

cron.schedule('*/15 * * * *', async () => {
    try {
        const premiums = await redis.json.get(premiumKey(), '$') as DrizzleSelectPremium[][] | null;
        const stars = await redis.json.get(starKey(), '$') as DrizzleSelectStar[][] | null;
        const pipeline : Pipeline<[]> = redis.pipeline();

        const updatedPremiumPrices : UpdatesDetail[] = await Promise.all(premiums!.flat().map(async premium => {
            const { totalTonAmount, totalTonPriceInIrr } = await calculateTonPriceInIrr(premium.ton_quantity, 30000);
            const { irr_price, ton_quantity, ...rest } = premium
            pipeline.json.set(premiumKey(), `$[?(@.id == "${premium.id}")]`, {
                ...rest, irr_price : totalTonPriceInIrr, ton_quantity : totalTonAmount
            });
            return { totalTonAmount, totalTonPriceInIrr, id : rest.id };
        }));

        const updatedStarPrices : UpdatesDetail[] = await Promise.all(stars!.flat().map(async (star, index) => {
            const groupIndex : number = Math.floor(index / 3);
            const profit : number = 30000 + groupIndex * 30000;
            const { totalTonAmount, totalTonPriceInIrr } = await calculateTonPriceInIrr(star.ton_quantity, profit);

            const { irr_price, ton_quantity, ...rest } = star;
            pipeline.json.set(starKey(), `$[?(@.id == "${star.id}")]`, {
                ...rest, irr_price : totalTonPriceInIrr, ton_quantity : totalTonAmount
            });
            return { totalTonAmount, totalTonPriceInIrr, id : rest.id };
        }));

        await Promise.all([updatePremiumTonAndRialPrice(updatedPremiumPrices), updateStarPrices(updatedStarPrices), pipeline.exec()]);
        
    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        console.log(error.message);
    }
});