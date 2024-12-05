import type { Context } from "hono";
import { CatchAsyncError } from "@shared/utils/catchAsyncError";
import { getCookie } from "hono/cookie";
import type { TelegramUserSafeData } from "../schema";
import { refreshTokenService, validateTelegramAuthService } from "../services/auth.service";
import type { SelectUser } from "@shared/models/user.model";
import { createCookie } from "../utils/createCookie";
import ErrorFactory from "@shared/utils/customErrors";

export const signInAndSignup = CatchAsyncError(async (context: Context) => {
    const { initData: userSafeData } = context.var.json as TelegramUserSafeData;

    const userDetail: SelectUser = await validateTelegramAuthService(userSafeData);
    const accessToken: string = await createCookie(context, userDetail);

    return context.json({success: true, user: userDetail, accessToken});
});

export const refreshToken = CatchAsyncError(async (context: Context) => {
    const refreshToken: string | undefined = getCookie(context, "refresh_token");
    if (!refreshToken) throw ErrorFactory.TokenRefreshError("No refresh token cookie exists");

    const userDetail: SelectUser = await refreshTokenService(refreshToken);

    const accessToken: string = await createCookie(context, userDetail);
    return context.json({success: true, accessToken});
});