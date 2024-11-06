import { eq } from 'drizzle-orm';
import { db } from '@shared/db';
import type { SelectUserTable , InsertUser } from '@types';
import { userTable } from '@shared/db/schemas/user.model';

export const handledInitUser = async(detail : InsertUser) : Promise<SelectUserTable> => {
    const user = (await db.select().from(userTable).where(eq(
        userTable.telegramId, detail.telegramId
    )))[0]
    return user ? user : (await db.insert(userTable).values(detail).returning())[0];
}

export const SelectUserTableById = async (userId : string) => {
    const [user] : SelectUserTable[] = await db.select().from(userTable).where(eq(userTable.id, userId));
    return user;
}