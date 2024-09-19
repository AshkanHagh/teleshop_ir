import type { Context } from 'hono';
import { CatchAsyncError } from '../utils';
import type { InitializingUserSchema } from '../schemas/zod.schema';
import { validateAndInitializeUserService, refreshTokenService } from '../services/auth.service';
import { sendToken } from '../utils/jwt';
import type { SelectUser } from '../models/user.model';
import { getCookie } from 'hono/cookie';

export const validateAndInitializeUser = CatchAsyncError(async (context : Context) => {
    const { initData } = context.req.validated.json as InitializingUserSchema;
    const user : SelectUser = await validateAndInitializeUserService(initData);

    const accessToken : string = sendToken(context, user);
    return context.json({success : true, user, accessToken});
});

export const refreshToken = CatchAsyncError(async (context : Context) => {
    const refreshTokenCookie : string | undefined = getCookie(context, 'refresh_token');
    const user : SelectUser = await refreshTokenService(refreshTokenCookie ?? '');

    const accessToken : string = sendToken(context, user);
    return context.json({success : true, accessToken});
});