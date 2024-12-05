import type { Context, Next } from "hono";
import ErrorHandler from "@shared/utils/errorHandler";
import { validationZodSchema } from "@shared/utils/validation";
import { usersKeyById } from "@shared/utils/keys";
import { bearerToken } from "../schemas";
import { CatchAsyncError } from "@shared/utils/catchAsyncError";
import ErrorFactory from "@shared/utils/customErrors";
import { env } from "@env";
import Redis from "@shared/db/caching";
import { verifyJwtToken } from "@shared/utils/jwt";
import type { TokenPayload } from "@shared/types";

export const isAuthenticated = async (context: Context, next: Next): Promise<void> => {
    try {
        const reqToken: string | undefined = context.req.header("authorization");
        if (!reqToken?.startsWith("Bearer ")) {
            throw ErrorFactory.AuthRequiredError("No bearer token provided");
        }
        const accessToken: string = reqToken.split(" ")[1];

        const { id: userId } = await verifyJwtToken(accessToken, env.ACCESS_TOKEN) as TokenPayload;
        if(!userId) throw ErrorFactory.AccessTokenInvalidError(`Invalid access token: ${accessToken}`);

        const isUserCashed = await Redis.hgetall(usersKeyById(userId)) as SelectUserTable[] | null;
        if(!currentUserCache || !currentUserCache.length) throw ErrorFactory.InitRequiredError();
        const user = changeUserRolesToArrayFromHashCache(currentUserCache[0]);
        context.set("user", user);
        await next();

    } catch (err: unknown) {
        const error: ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, "An error occurred");
    }
}

export const authorizedRoles = (...authorizedRoles: InitRoles) => {
    return CatchAsyncError(async (context: Context, next: Next) => {
        const { roles } = context.get("user");
        if(!authorizedRoles.some(authorizedRole => roles.some(role => authorizedRole === role))) {
            throw ErrorFactory.UnAuthorizedRoleError(roles.join(" "))
        };
        await next();
    })
}