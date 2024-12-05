import { eq } from "drizzle-orm";
import { db } from "@shared/db/drizzle";
import { userTable, type InsertUser, type SelectUser } from "@shared/models/schema";

export const checkUsrExistsOrInsertUser = async(userTelegramDetail: InsertUser): Promise<SelectUser> => {
    const isUserExists: SelectUser[] = await db
        .select()
        .from(userTable)
        .where(eq(
            userTable.telegramId, userTelegramDetail.telegramId
        ))


    return isUserExists[0]
        ? isUserExists[0] 
        : (await db.insert(userTable).values(userTelegramDetail).returning())[0];
}

export const findUserById = async (id: string) => {
    const [user]: SelectUser[] = await db.select().from(userTable).where(eq(userTable.id, id));
    return user;
}