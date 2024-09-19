import { handelInitializingUser, SelectFirstUser, type CachedUserDetail, type HandlingInitStateDetail, 
    type InitUserState 
} from '../database/queries/user.query';
import { insertUserSchema, type InsertUser, type SelectUser } from '../models/schema';
import ErrorHandler from '../utils/errorHandler';
import crypto from 'crypto';
import { decodeToken, createInitializingRequiredError, validationZodSchema } from '../utils';
import { hgetall } from '../database/cache';

export const transformUserDetail  = (userDetail : (SelectUser | CachedUserDetail), state : InitUserState = 'cache') : SelectUser => {
    return state === 'default' ? userDetail as SelectUser : {...userDetail, telegram_id : +userDetail.telegram_id}
}

export type TelegramUser = {
    id : number; first_name : string; last_name : string; username : string; language_code : string; 
    allows_write_to_pm : boolean;
};
export type TelegramInitData = {
    user : TelegramUser; chat_instance : string; chat_type : 'private' | 'group' | 'supergroup' | 'channel';
    auth_date : number; hash : string;
};

export const validateAndInitializeUserService = async (initData : string) : Promise<SelectUser> => {
    try {
        const secret : Buffer = crypto.createHmac('sha256', 'WebAppData').update(process.env.BOT_FATHER_SECRET).digest();
        const parsedInitData : URLSearchParams = new URLSearchParams(decodeURIComponent(initData));
        const providedHash : string | null = parsedInitData.get('hash');
        parsedInitData.delete('hash');
    
        const dataCheckString : string = Array.from(parsedInitData.entries()).sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`).join('\n');
        const computedHash : string = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');
        if (computedHash !== providedHash) throw new ErrorHandler('Invalid hash, data is not trustworthy!');
        
        const { user } = Object.fromEntries(parsedInitData.entries()) as Record<keyof TelegramInitData, keyof TelegramInitData>;
        const { last_name, id : telegram_id, username } = JSON.parse(user) as TelegramUser;

        const validatedInitData : InsertUser = validationZodSchema(insertUserSchema, {last_name, telegram_id, username}) as InsertUser;
        const { userDetail, state } : HandlingInitStateDetail = await handelInitializingUser(validatedInitData);
        return transformUserDetail (userDetail, state);
        
    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error occurred');
    }
}

export const refreshTokenService = async (token : string) : Promise<SelectUser> => {
    try {
        const userInCookie : SelectUser = decodeToken(token, process.env.REFRESH_TOKEN) as SelectUser;
        const cachedUser : CachedUserDetail = await hgetall(`user:${userInCookie.id}`);
        const user : SelectUser = Object.keys(cachedUser).length ? transformUserDetail (cachedUser) 
        : await SelectFirstUser(userInCookie.id);

        if(!user) throw createInitializingRequiredError();
        return user;
        
    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error occurred');
    }
}