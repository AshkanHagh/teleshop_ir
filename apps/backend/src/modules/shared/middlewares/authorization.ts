import type { Context, Next } from "hono";
import ErrorHandler from "@shared/utils/errorHandler";
import { CatchAsyncError } from "@shared/utils/catchAsyncError";
import ErrorFactory from "@shared/utils/customErrors";
import { env } from "@env";
import { verifyJwtToken } from "@shared/utils/jwt";
import RedisQuery from "@shared/db/redis/query";
import RedisKeys from "@shared/utils/keys";
import type { InitRoles } from "@shared/models/user.model";

type TokenPayload = {
    id: string,
    role: InitRoles,
    exp: number,
};

export const isAuthenticated = async (context: Context, next: Next): Promise<void> => {
    try {
        const reqToken: string | undefined = context.req.header("authorization");
        if (!reqToken?.startsWith("Bearer ")) {
            throw ErrorFactory.AuthRequiredError("No bearer token provided");
        }
        const accessToken: string = reqToken.split(" ")[1];

        const { id: userId } = await verifyJwtToken(accessToken, env.ACCESS_TOKEN) as TokenPayload;
        if(!userId) throw ErrorFactory.AccessTokenInvalidError(`Invalid access token: ${accessToken}`);

        const isUserCashed = await RedisQuery.jsonGet(RedisKeys.user(userId), "$") as string;
        if(!isUserCashed) throw ErrorFactory.AuthRequiredError("");

        context.set("user", JSON.parse(isUserCashed));
        await next();

    } catch (err: unknown) {
        const error: ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode);
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