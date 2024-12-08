import { db } from "@shared/db/drizzle";
import { userTable, type InsertUser, type SelectUser } from "@shared/models/schema";

export const insertUser = async(userPayload: InsertUser): Promise<SelectUser> => {
    let userDetail = await db
        .insert(userTable)
        .values(userPayload)
        .onConflictDoUpdate({
            target: [userTable.telegramId],
            set: {
                fullname: userPayload.fullname,
                username: userPayload.username,
            }
        })
        .returning()

    return userDetail[0];
}

export const findUserById = async (id: string): Promise<SelectUser | undefined> => {
    return await db.query.userTable.findFirst({
        where: (fields, func) => func.eq(fields.id, id)
    });
}