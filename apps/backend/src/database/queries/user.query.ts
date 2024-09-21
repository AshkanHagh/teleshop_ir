import { sql } from 'drizzle-orm';
import { db } from '..';
import { userTable, type DrizzleSelectUser, type DrizzleInsertUser } from '../../models/schema';

export const insertUser = async(detail : DrizzleInsertUser) : Promise<DrizzleSelectUser> => {
    const user = await db.execute(sql<DrizzleSelectUser[]>`
        INSERT INTO ${userTable} (telegram_id, last_name, username) VALUES (
        ${detail.telegram_id}, ${detail.last_name}, ${detail.username}
        ) RETURNING *
    `);
    return user[0] as DrizzleSelectUser;
}

export const selectUserById = async (userId : string) => {
    const user = await db.execute(sql<DrizzleSelectUser[]>`SELECT * FROM ${userTable} WHERE ${userTable.id} = ${userId}`);
    return user[0] as DrizzleSelectUser;
}