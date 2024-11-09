import type { Context } from 'hono';
import { CatchAsyncError } from '@shared/utils/catchAsyncError';
import type { TelegramInitHashData } from '../schema';
import { validateAndInitUserService, refreshTokenService } from '../services/auth.service';
import { sendToken } from '../utils/jwt';
import type { SelectUserTable } from '@types';
import { getCookie } from 'hono/cookie';

export const validateAndInitializeUser = CatchAsyncError(async (context : Context) => {
    const { initData } = context.var.json as TelegramInitHashData;
    const user : SelectUserTable = await validateAndInitUserService(initData);

    const accessToken : string = await sendToken(context, user);
    return context.json({success : true, user, accessToken});
});

export const refreshToken = CatchAsyncError(async (context : Context) => {
    const refreshTokenCookie : string | undefined = getCookie(context, 'refresh_token');
    const user : SelectUserTable = await refreshTokenService(refreshTokenCookie);

    const accessToken : string = await sendToken(context, user[0]);
    return context.json({success : true, accessToken});
});