import { env } from '../../env';
import { fetch } from 'bun';
import ErrorHandler from '../utils/errorHandler';
import redis from '../libs/redis.config';
import { premiumKey, starKey } from '../utils/keys';
import { updatePremiumPrice, updateStarPrices, type UpdatesDetail } from '../database/queries/service.query';
import type { SelectPremium, SelectStar } from '../types';
import websocket from '../libs/websocket';
import RedisMethod from '../database/cache';
import type { ChainableCommander } from 'ioredis';

let tonCache : number | null = null;
let usdToIrtCache : number | null = null;
let cacheTimer : NodeJS.Timer | number | null = null;
const PROFIT : number = 30000;

const clearCache = () => {
    tonCache = null;
    usdToIrtCache = null;
}
const resetCacheTimer = () => {
    if (cacheTimer) clearTimeout(cacheTimer);
    cacheTimer = setTimeout(clearCache, 15 * 60 * 1000);
};

export type TonPrice = { 'the-open-network' : { usd : number } };
export type UsdToIrrRate = { conversion_rate : number };
const calculateTonPriceInIrr = async (tonAmount : number, profitInIrr : number) => {
    try {
        if (tonCache === null || usdToIrtCache === null) {
            const [tonPriceResponse, usdToIrrResponse] = await Promise.all([
                fetch(env.COINGECKO_API!),
                fetch(env.EXCHANGERATE_API!)
            ]);
            const [tonPriceData, usdToIrtData]: [TonPrice, UsdToIrrRate] = await Promise.all([
                tonPriceResponse.json() as Promise<TonPrice>,
                usdToIrrResponse.json() as Promise<UsdToIrrRate>
            ]);

            tonCache = tonPriceData['the-open-network'].usd;
            usdToIrtCache = usdToIrtData.conversion_rate;
            resetCacheTimer();
        }
        const tonUsdPrice : number = tonCache;
        const usdToIrtConversionRate : number = usdToIrtCache;

        const tonPriceInIrt : number = tonUsdPrice * usdToIrtConversionRate;
        const profitInTon : number = parseFloat((profitInIrr / tonPriceInIrt).toFixed(2));
        const totalTonAmount : number = parseFloat((tonAmount + profitInTon).toFixed(2));
        const totalTonPriceInIrt : number = Math.floor(parseFloat((totalTonAmount * tonPriceInIrt).toFixed(3)));

        return { totalTonPriceInIrt, totalTonAmount };
        
    } catch (error : unknown) {
        const customError : ErrorHandler = error as ErrorHandler;
        throw new ErrorHandler(customError.message, customError.statusCode, 'An error occurred');
    }
}

const handelPriceUpdate = async () => {
    try {
        const premiums = await RedisMethod.jsonget(premiumKey(), '$') as SelectPremium[][] | null;
        const stars = await RedisMethod.jsonget(starKey(), '$') as SelectStar[][] | null;
        const pipeline : ChainableCommander = redis.pipeline();

        const updatedPremiumPrices : UpdatesDetail[] = await Promise.all(premiums!.flat().map(async premium => {
            const { totalTonAmount, totalTonPriceInIrt } = await calculateTonPriceInIrr(premium.tonQuantity, PROFIT);
            const { irrPrice, tonQuantity, ...rest } = premium
            RedisMethod.pipelineJsonset(pipeline, premiumKey(), `$[?(@.id == "${premium.id}")]`, {...rest, irrPrice : totalTonPriceInIrt,
                tonQuantity : totalTonAmount
            }, null);
            return { totalTonAmount, totalTonPriceInIrr : totalTonPriceInIrt , id : rest.id };
        }));

        const updatedStarPrices : UpdatesDetail[] = await Promise.all(stars!.flat().map(async (star, index) => {
            const groupIndex : number = Math.floor(index / 3);
            const profit : number = PROFIT + groupIndex * PROFIT;
            const { totalTonAmount, totalTonPriceInIrt } = await calculateTonPriceInIrr(star.tonQuantity, profit);

            const { irrPrice, tonQuantity, ...rest } = star;
            RedisMethod.pipelineJsonset(pipeline, starKey(), `$[?(@.id == "${star.id}")]`, {
                ...rest, irrPrice : totalTonPriceInIrt, tonQuantity : totalTonAmount
            });
            return { totalTonAmount, totalTonPriceInIrr : totalTonPriceInIrt, id : rest.id };
        }));
        await Promise.all([updatePremiumPrice(updatedPremiumPrices), updateStarPrices(updatedStarPrices), pipeline.exec(),
            websocket.broadcastToEveryone(JSON.stringify({type : 'updated-premium-prices', data : updatedPremiumPrices})),
            websocket.broadcastToEveryone(JSON.stringify({type : 'updated-star-prices', data : updatedStarPrices}))
        ]);

    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        console.log(error.message);
        process.exit(1);
    }
}

setInterval(handelPriceUpdate, 1000 * 60 * 15);