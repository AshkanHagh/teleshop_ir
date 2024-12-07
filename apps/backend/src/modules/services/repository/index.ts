import { db } from "@shared/db/drizzle";
import { premiumTable, starTable, type SelectPremium, type SelectServices, type SelectStar } from "@shared/models/services.model";
import { eq } from "drizzle-orm";

export const getServices = async (): Promise<SelectServices[]> => {
    return await db.query.servicesTable.findMany();
}

const findManyStars = async (): Promise<SelectStar[]> => {
    return await db.query.starTable.findMany({
        orderBy: (fields, func) => func.asc(fields.stars)
    })
}

const findManyPremium = async (): Promise<SelectPremium[]> => {
    return await db.query.premiumTable.findMany();
}

export type Service<F> = F extends "premium" ? { premiums:  SelectPremium[] } : { stars: SelectStar[] }; 

export const findManyServiceByName = async (service: "premium" | "star"): Promise<Service<typeof service>> => {
    return service == "premium" 
        ? { premiums: await findManyPremium() }
        : { stars: await findManyStars() };
}

export type UpdatePayload = {
    id: string,
    irr: number,
}

export const updateServicesIrrPrice = async (premiums: UpdatePayload[], stars: UpdatePayload[]) => {
    await db.transaction(async trx => {
        await Promise.all(premiums.map(async premium => {
            await trx.update(premiumTable).set({irr: premium.irr}).where(eq(premiumTable.id, premium.id));
        }));

        await Promise.all(stars.map(async star => {
            await trx.update(starTable).set({irr: star.irr}).where(eq(starTable.id, star.id));
        }));
    });
}