import { fetch } from 'bun';
import ErrorHandler from '../middlewares/errorHandler';
import cron from 'node-cron';

export type TonPrice = { 'the-open-network' : { usd : number } };
export type UsdToIrrRate = { conversion_rate : number };
const calculatePremiumTonPriceInIrr = async (tonAmount : number, profitInIrr : number) => {
    try {
        const [tonPriceResponse, usdToIrrResponse] = await Promise.all([
            fetch(process.env.COINGECKO_API),
            fetch(process.env.EXCHANGERATE_API),
        ]);

        const tonPriceData : TonPrice = await tonPriceResponse.json() as TonPrice;
        const tonUsdPrice : number = tonPriceData['the-open-network'].usd;

        const usdToIrrData : UsdToIrrRate = await usdToIrrResponse.json() as UsdToIrrRate;
        const usdToIrrConversionRate : number = usdToIrrData.conversion_rate;

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

cron.schedule('*/1 * * * *', async () => {
    try {
        
    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        console.log(error.message);
    }
});