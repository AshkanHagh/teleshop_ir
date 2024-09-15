import type { Context } from 'hono';
import { CatchAsyncError } from '../utils';
import type { InitializingUserSchema } from '../schemas/zod.schema';
import { validateAndInitializeUserService, refreshTokenService } from '../services/auth.service';
import { sendToken } from '../utils/jwt';
import type { SelectUser } from '../models/user.model';
import { getCookie } from 'hono/cookie';

export const validateAndInitializeUser = CatchAsyncError(async (context : Context) => {
    const { initialData } = context.req.validated.json as InitializingUserSchema;
    const userDetail : SelectUser = await validateAndInitializeUserService(initialData);

    const accessToken : string = sendToken(context, userDetail);
    return context.json({success : true, userDetail, accessToken});
});

export const refreshToken = CatchAsyncError(async (context : Context) => {
    const refreshTokenCookie : string | undefined = getCookie(context, 'refresh_token');
    const user : SelectUser = await refreshTokenService(refreshTokenCookie ?? '');

    const accessToken : string = sendToken(context, user);
    return context.json({success : true, accessToken});
});