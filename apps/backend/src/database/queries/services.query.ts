import { db } from '..';
import { premiumTable, starTable, type SelectPremium, type SelectStar } from '../../models/service.model';

export const findManyStar = async () : Promise<SelectStar[]> => {
    return await db.select().from(starTable);
}

export const findManyPremium = async () : Promise<SelectPremium[]> => {
    return await db.select().from(premiumTable);
}