import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { refreshToken, verifyInitData } from "src/modules/auth/auth.service.js";
import { VerifyInitDataDto } from "src/modules/auth/dtos/index.js";

const authRoute: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post(
    "/auth/verify-account",
    { schema: { body: VerifyInitDataDto } },
    (req, reply) => {
      return verifyInitData(reply, req.body.initData);
    },
  );
  fastify.get("/auth/refresh", refreshToken);
};

export default authRoute;
