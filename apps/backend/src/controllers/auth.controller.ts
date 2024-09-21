import type { Context } from 'hono';
import { CatchAsyncError } from '../middlewares/catchAsyncError';
import type { InitializingUserSchema } from '../schemas/zod.schema';
import { validateAndInitUserService, refreshTokenService } from '../services/auth.service';
import { sendToken } from '../utils/jwt';
import type { DrizzleSelectUser } from '../models/user.model';
import { getCookie } from 'hono/cookie';

export const validateAndInitializeUser = CatchAsyncError(async (context : Context) => {
    const { initData } = context.req.validated.json as InitializingUserSchema;
    const user : DrizzleSelectUser = await validateAndInitUserService(initData);

    const accessToken : string = sendToken(context, user);
    return context.json({success : true, user, accessToken});
});

export const refreshToken = CatchAsyncError(async (context : Context) => {
    const refreshTokenCookie : string | undefined = getCookie(context, 'refresh_token');
    const user : DrizzleSelectUser = await refreshTokenService(refreshTokenCookie ?? '');

    const accessToken : string = sendToken(context, user);
    return context.json({success : true, accessToken});
});