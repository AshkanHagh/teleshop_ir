import { InitData, parse, validate } from "@tma.js/init-data-node";
import { FastifyReply } from "fastify";
import { FastifyRequest } from "fastify";
import errorType from "src/lib/errors/error-type.js";
import { AppError } from "src/lib/errors/exception.js";
import { refreshTokens, verifyToken } from "./utils.js";
import { eq } from "drizzle-orm";
import { fastify } from "src/app.js";
import { UserTable } from "src/database/schemas/index.js";

export async function verifyInitData(reply: FastifyReply, payload: string) {
  let initData: InitData;
  try {
    initData = parse(payload);
    validate(payload, fastify.config.TELEGRAM_BOT_TOKEN, {
      expiresIn: 60 * 60,
    });
    if (!initData.user) {
      throw AppError(errorType.AUTH_USER_NOT_FOUND, 401);
    }
  } catch (error) {
    throw AppError(errorType.INVALID_INIT_DATA, 401, error);
  }

  const fullname = `${initData.user.first_name} ${initData.user.last_name}`;
  const username = initData.user.username || "UNKNOWN";
  const user = await fastify.db
    .insert(UserTable)
    .values({
      telegramId: initData.user.id,
      username,
      fullname,
      roles: ["customer"],
    })
    .onConflictDoUpdate({
      target: UserTable.telegramId,
      set: {
        fullname,
        username,
      },
    })
    .returning();

  const tokens = await refreshTokens(reply, user[0]);
  return {
    user: user[0],
    accessToken: tokens.accessToken,
  };
}

export async function refreshToken(req: FastifyRequest, reply: FastifyReply) {
  const refreshToken = req.cookies["refresh"];
  if (!refreshToken) {
    throw AppError(errorType.AUTH_COOKIE_NOT_FOUND, 401);
  }

  const decoded = verifyToken<{ userId: string }>(
    refreshToken,
    fastify.config.REFRESH_TOKEN_SECRET,
  );
  const user = await fastify.db.query.UserTable.findFirst({
    where: eq(UserTable.id, decoded.userId),
  });
  if (!user) {
    throw AppError(errorType.INVALID_JWT_TOKEN, 401);
  }

  const tokens = await refreshTokens(reply, user);
  return {
    accessToken: tokens.accessToken,
  };
}
