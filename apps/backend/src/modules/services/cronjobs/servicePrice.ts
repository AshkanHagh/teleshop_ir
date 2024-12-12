import { env } from "@env";
import { fetch } from "bun";
import websocket from "@shared/libs/websocket";
import { findManyServiceByName, updateServicesIrrPrice, type Service } from "../repository";
import { logger } from "@shared/libs/winston";

type NobitexResponse =  {
    status: string,
    lastUpdate: number,
    lastTradePrice: string,
    asks: string[],
    bids: string[]
}

type ServicesPayload = {
    id: string,
    ton: number
}

const PROFIT: number = 30000;

const fetchTonIrrPrice = async (premiums: ServicesPayload[], stars: ServicesPayload[]) => {
    try {
        let response = await fetch(`${env.NOBITEX_API}/TONIRT`);
        let { lastTradePrice } = await response.json() as NobitexResponse;

        const updatedPremiumPrices = premiums.map(premium => {
            return {
                id: premium.id,
                irr: parseInt((premium.ton * parseInt(lastTradePrice)).toFixed(3))
            }
        });

        const updatedStarsPrices = stars.map(star => {
            return {
                id: star.id,
                irr: parseInt(((star.ton * parseInt(lastTradePrice)) + PROFIT).toFixed(3))
            }
        });

        return { premiums: updatedPremiumPrices, stars: updatedStarsPrices };

    } catch (error: unknown) {
        console.log(error);
    }
}

const handelPriceUpdate = async () => {
    try {
        logger.info("Updating services irr price started");

        const premiums = await findManyServiceByName("premium");
        const stars = await findManyServiceByName("star");
        
        const prices = await fetchTonIrrPrice(premiums, stars);
        console.log(prices);
        if(prices) {
            await updateServicesIrrPrice(prices.premiums, prices.stars);

            await Promise.all([
                websocket.broadcastToEveryone(JSON.stringify({
                    type: "premium", 
                    prices: prices.premiums
                })),
                websocket.broadcastToEveryone(JSON.stringify({
                    type: "star", 
                    prices: prices.stars
                }))
            ]);
        }

    } catch (err: unknown) {
        console.log(err);
    }
}

setInterval(handelPriceUpdate, 1000 * 60 * 30);