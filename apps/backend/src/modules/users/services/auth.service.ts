import { handledInitUser, SelectUserTableById } from '../db/queries';
import type { SelectUserTable, TelegramUserInitData, TelegramDecodedUser } from '@types';
import ErrorHandler from '@shared/utils/errorHandler';
import crypto from 'crypto';
import { decodeToken } from '@shared/utils/jwt';
import { usersKeyById } from '@shared/utils/keys';
import ErrorFactory from '@shared/utils/customErrors';
import { env } from '@env';
import Redis from '@shared/db/caching';

export const validateAndInitUserService = async (initData : string) : Promise<SelectUserTable> => {
    try {
        const secretKey : Buffer = crypto.createHmac('sha256', 'WebAppData').update(env.BOT_FATHER_SECRET).digest();
        const decodedInitData : URLSearchParams = new URLSearchParams(decodeURIComponent(initData));
        const telegramHash : string | null = decodedInitData.get('hash');
        decodedInitData.delete('hash');
    
        const dataVerificationString : string = Array.from(decodedInitData.entries()).sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`).join('\n');
        const computedHash: string = crypto.createHmac('sha256', Uint8Array.from(secretKey)).update(dataVerificationString).digest('hex');
        if (computedHash !== telegramHash) throw new ErrorHandler('Invalid hash, data is not trustworthy!');
        
        const { user } = Object.fromEntries(decodedInitData.entries()) as Record<keyof TelegramUserInitData, keyof TelegramDecodedUser>;
        const { last_name, id, username } = JSON.parse(user) as TelegramDecodedUser;
        return await handledInitUser({ lastName : last_name, telegramId : id, username });
        
    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error occurred');
    }
};

export const refreshTokenService = async (token : string) : Promise<SelectUserTable> => {
    try {
        const userCookie : string = await decodeToken(token, env.REFRESH_TOKEN) as string;
        const userCache : SelectUserTable | null | undefined = await Redis.hgetall(usersKeyById(userCookie.userId));
        const user : SelectUserTable = userCache ? userCache : await SelectUserTableById(userCookie.userId);
        if(!user) throw ErrorFactory.InitRequiredError();
        return user;
        
    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error occurred');
    }
};
