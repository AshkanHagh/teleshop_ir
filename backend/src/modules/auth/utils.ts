import { FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import { fastify } from "src/app.js";
import { User } from "src/database/schemas/user.schema.js";
import errorType from "src/lib/errors/error-type.js";
import { AppError } from "src/lib/errors/exception.js";

export async function refreshTokens(reply: FastifyReply, user: User) {
  const accessToken = jwt.sign(
    {
      userId: user.id,
      roles: user.roles,
    },
    fastify.config.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" },
  );
  const refreshToken = jwt.sign(
    {
      userId: user.id,
      roles: user.roles,
    },
    fastify.config.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" },
  );

  reply
    .setCookie("access", accessToken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 15,
      path: "/",
    })
    .setCookie("refresh", refreshToken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

  return {
    refreshToken,
    accessToken,
  };
}

export function verifyToken<T>(token: string, secret: string) {
  try {
    const result = jwt.verify(token, secret);
    return result as T;
  } catch (error) {
    throw AppError(errorType.INVALID_JWT_TOKEN, 401, error);
  }
}
