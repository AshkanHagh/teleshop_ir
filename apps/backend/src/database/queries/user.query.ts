import { eq } from 'drizzle-orm';
import { db } from '..';
import { userTable, type InsertUser, type SelectUser } from '../../models/schema';
import { hgetall } from '../cache';

export type InitUserState = 'cache' | 'default';
export type CachedUserDetail = Omit<SelectUser, 'auth_date' | 'telegram_id'> & {auth_date : string, telegram_id : string};
export type HandlingInitStateDetail<State extends InitUserState = 'cache' | 'default'> = State extends 'default' 
? {userDetail : SelectUser, state : State} : {userDetail : CachedUserDetail, state : State}

export const handelInitializingUser = async <State extends InitUserState>(detail : InsertUser) 
: Promise<HandlingInitStateDetail<State>> => {
    const checkUserCache : CachedUserDetail = await hgetall(`user_telegram:${detail.telegram_id}`);
    if(Object.keys(checkUserCache).length) return {userDetail : checkUserCache, state : 'cache'} as HandlingInitStateDetail<State>;

    const [userDetail] : SelectUser[] = await db.insert(userTable).values({...detail}).returning();
    return {userDetail, state : 'default'} as HandlingInitStateDetail<State>;
}

export const SelectFirstUser = async (userId : string) : Promise<SelectUser> => {
    const [userDetail] : SelectUser[] = await db.select().from(userTable).where(eq(userTable.id, userId));
    return userDetail
}