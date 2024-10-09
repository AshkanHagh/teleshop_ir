import { handledInitUser, selectUserById } from '../database/queries/user.query';
import type { SelectUser, TelegramUserInitData, TelegramDecodedUser } from '../types';
import ErrorHandler from '../utils/errorHandler';
import crypto from 'crypto';
import { decodeToken, usersKeyById } from '../utils';
import redis from '../libs/redis.config';
import ErrorFactory from '../utils/customErrors'
import { env } from '../../env';

export const validateAndInitUserService = async (initData : string) : Promise<SelectUser> => {
    try {
        const secretKey : Buffer = crypto.createHmac('sha256', 'WebAppData').update(env.BOT_FATHER_SECRET).digest();
        const decodedInitData : URLSearchParams = new URLSearchParams(decodeURIComponent(initData));
        const telegramHash : string | null = decodedInitData.get('hash');
        decodedInitData.delete('hash');
    
        const dataVerificationString : string = Array.from(decodedInitData.entries()).sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`).join('\n');
        // @ts-expect-error
        const computedHash : string = crypto.createHmac('sha256', secretKey).update(dataVerificationString).digest('hex');
        if (computedHash !== telegramHash) throw new ErrorHandler('Invalid hash, data is not trustworthy!');
        
        const { user } = Object.fromEntries(decodedInitData.entries()) as Record<keyof TelegramUserInitData, keyof TelegramDecodedUser>;
        const { last_name : lastName, id : telegramId, username } = JSON.parse(user) as TelegramDecodedUser;
        return await handledInitUser({lastName, telegramId, username});
        
    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error occurred');
    }
}

export const refreshTokenService = async (token : string) : Promise<SelectUser> => {
    try {
        const userCookieDetail : SelectUser = decodeToken(token, env.REFRESH_TOKEN) as SelectUser;
        const cachedUser = await redis.json.get(usersKeyById(userCookieDetail.id), '$') as SelectUser[] | null;

        const user : SelectUser = cachedUser ? cachedUser[0] : await selectUserById(userCookieDetail.id);
        if(!user) throw ErrorFactory.InitRequiredError();
        return user;
        
    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error occurred');
    }
}