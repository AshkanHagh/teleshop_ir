import { eq } from 'drizzle-orm';
import { db } from '..';
import type { SelectUser , InsertUser } from '../../types';
import { userTable } from '../schema/user.model';

export const handledInitUser = async(detail : InsertUser) : Promise<SelectUser> => {
    const currentUser = await db.select().from(userTable).where(eq(userTable.telegramId, detail.telegramId));
    return currentUser.length ? currentUser[0] : (await db.insert(userTable).values(detail).returning())[0];
}

export const selectUserById = async (userId : string) => {
    const [user] : SelectUser[] = await db.select().from(userTable).where(eq(userTable.id, userId));
    return user;
}