import fp from "fastify-plugin";
import { FastifyRequest } from "fastify";
import { AppError } from "src/lib/errors/exception.js";
import errorType from "src/lib/errors/error-type.js";
import { verifyToken } from "src/modules/auth/utils.js";
import { eq } from "drizzle-orm";
import { User, UserRole, UserTable } from "src/database/schemas/user.schema.js";
import { FastifyPlugin } from "src/lib/fastify/constants.js";

declare module "fastify" {
  interface FastifyRequest {
    user: User;
  }
  interface FastifyInstance {
    authenticate(req: FastifyRequest): Promise<void>;
    authorize(...roles: UserRole[]): (req: FastifyRequest) => void;
  }
}

export default fp(
  async (fastify) => {
    fastify.decorate("user", null);

    fastify.decorate("authenticate", async (req: FastifyRequest) => {
      const token = req.headers.authorization;
      if (!token || !token?.startsWith("Bearer ")) {
        throw AppError(errorType.AUTH_TOKEN_NOT_FOUND, 401);
      }
      const accessToken = token.split(" ")[1];

      const decoded = verifyToken<{ userId: string }>(
        accessToken,
        fastify.config.ACCESS_TOKEN_SECRET,
      );

      const user = await fastify.db.query.UserTable.findFirst({
        where: eq(UserTable.id, decoded.userId),
      });
      if (!user) {
        throw AppError(errorType.INVALID_JWT_TOKEN, 401);
      }
      req.user = user;
    });

    fastify.decorate("authorize", (...roles: UserRole[]) => {
      return (req: FastifyRequest) => {
        const isAllowed = roles.some((authorizedRole) => {
          return req.user.roles.some((role) => authorizedRole === role);
        });

        if (!isAllowed) {
          throw AppError(errorType.PERMISSION_DENIED, 403);
        }
      };
    });
  },
  { dependencies: [FastifyPlugin.Env] },
);
