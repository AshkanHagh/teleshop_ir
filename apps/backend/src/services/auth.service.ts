import { insertUser, selectUserById } from '../database/queries/user.query';
import { drizzleInsertUserSchema, type DrizzleInsertUser, type DrizzleSelectUser } from '../models/schema';
import ErrorHandler from '../middlewares/errorHandler';
import crypto from 'crypto';
import { decodeToken, createInitializingRequiredError, validationZodSchema } from '../utils';
import { usersKeyById } from '../utils/keys';
import redis from '../libs/redis.config';
import type { TelegramInitData, TelegramSelectUser } from '../types';

export const validateAndInitUserService = async (initData : string) : Promise<DrizzleSelectUser> => {
    try {
        const secretKey : Buffer = crypto.createHmac('sha256', 'WebAppData').update(process.env.BOT_FATHER_SECRET).digest();
        const parsedInitData : URLSearchParams = new URLSearchParams(decodeURIComponent(initData));
        const providedHash : string | null = parsedInitData.get('hash');
        parsedInitData.delete('hash');
    
        const dataVerificationString : string = Array.from(parsedInitData.entries()).sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`).join('\n');
        const computedHash : string = crypto.createHmac('sha256', secretKey).update(dataVerificationString).digest('hex');
        if (computedHash !== providedHash) throw new ErrorHandler('Invalid hash, data is not trustworthy!');
        
        const { user } = Object.fromEntries(parsedInitData.entries()) as Record<keyof TelegramInitData, keyof TelegramInitData>;
        const { last_name, id : telegram_id, username } = JSON.parse(user) as TelegramSelectUser;

        const validatedUserData = validationZodSchema(drizzleInsertUserSchema, {last_name, telegram_id, username}) as DrizzleInsertUser;
        const userCacheDetail = await redis.json.get(usersKeyById(telegram_id.toString()), '$') as DrizzleSelectUser[] | null;
        return userCacheDetail ? userCacheDetail[0] : await insertUser(validatedUserData);
        
    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error occurred');
    }
}

export const refreshTokenService = async (token : string) : Promise<DrizzleSelectUser> => {
    try {
        const userCookieDetail : DrizzleSelectUser = decodeToken(token, process.env.REFRESH_TOKEN) as DrizzleSelectUser;
        const cachedUser =await redis.json.get(usersKeyById(userCookieDetail.id), '$') as DrizzleSelectUser[] | null;
        const user : DrizzleSelectUser = cachedUser ? cachedUser[0] : await selectUserById(userCookieDetail.id);
        if(!user) throw createInitializingRequiredError();
        return user;
        
    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error occurred');
    }
}