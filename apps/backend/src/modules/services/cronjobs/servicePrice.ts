import { env } from "@env";
import { fetch } from "bun";
import ErrorHandler from "@shared/utils/errorHandler";
import { findManyService, updatePremiumPrice, updateStarPrices, type UpdatesDetail } from "../repository";
import websocket from "@shared/libs/websocket";

let tonCache: number | null = null;
let usdToIrtCache: number | null = null;
let cacheTimer: NodeJS.Timer | number | null = null;
const PROFIT: number = 30000;

const clearCache = () => {
    tonCache = null;
    usdToIrtCache = null;
}
const resetCacheTimer = () => {
    if (cacheTimer) clearTimeout(cacheTimer);
    cacheTimer = setTimeout(clearCache, 15 * 60 * 1000);
};

export type TonPrice = { "the-open-network": { usd: number } };
export type UsdToIrrRate = { conversion_rate: number };
const calculateTonPriceInIrr = async (tonAmount: number, profitInIrr: number) => {
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

            tonCache = tonPriceData["the-open-network"].usd;
            usdToIrtCache = usdToIrtData.conversion_rate;
            resetCacheTimer();
        }
        
        const tonUsdPrice: number = tonCache;
        const usdToIrtConversionRate: number = usdToIrtCache;
        const tonPriceInIrt: number = tonUsdPrice * usdToIrtConversionRate;

        const profitInTon: number = profitInIrr / tonPriceInIrt;
        const totalTonAmount: number = tonAmount + profitInTon;

        const totalTonPriceInIrt: number = Math.round(totalTonAmount * tonPriceInIrt);

        return { totalTonPriceInIrt, totalTonAmount: Math.round(totalTonAmount) };
        
    } catch (error: unknown) {
        const customError: ErrorHandler = error as ErrorHandler;
        throw new ErrorHandler(customError.message, customError.statusCode, "An error occurred");
    }
}

const handelPriceUpdate = async () => {
    try {
        console.log("update");
        const premiums = await findManyService("premiumTable");
        const stars = await findManyService("starTable")

        const updatedPremiumPrices: UpdatesDetail[] = await Promise.all(premiums.map(async premium => {
            const { totalTonAmount, totalTonPriceInIrt } = await calculateTonPriceInIrr(premium.tonQuantity, PROFIT);
            return { totalTonAmount, totalTonPriceInIrr: totalTonPriceInIrt , id: premium.id };
        }));

        const updatedStarPrices: UpdatesDetail[] = await Promise.all(stars.map(async (star, index) => {
            const groupIndex: number = Math.floor(index / 3);
            const profit: number = PROFIT + groupIndex * PROFIT;
            const { totalTonAmount, totalTonPriceInIrt } = await calculateTonPriceInIrr(star.tonQuantity, profit);

            return { totalTonAmount, totalTonPriceInIrr: totalTonPriceInIrt, id: star.id };
        }));
        await Promise.all([updatePremiumPrice(updatedPremiumPrices), updateStarPrices(updatedStarPrices),
            websocket.broadcastToEveryone(JSON.stringify({type: "updated-premium-prices", data: updatedPremiumPrices})),
            websocket.broadcastToEveryone(JSON.stringify({type: "updated-star-prices", data: updatedStarPrices}))
        ]);
        console.log("updated");

    } catch (err: unknown) {
        const error: ErrorHandler = err as ErrorHandler;
        console.log(error.message);
        process.exit(1);
    }
}

setInterval(handelPriceUpdate, 1000 * 60 * 1);