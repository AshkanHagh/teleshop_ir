import { Hono } from "hono";
import { validationPayload } from "@shared/middlewares/validation";
import { signInAndSignup, refreshToken } from "../controllers/auth.controller";
import { every, some } from "hono/combine";
import { telegramUserSafeData } from "../schema";

const authRouter = new Hono();

authRouter
  .post(
    "/pol-barzakh",
    some(every(validationPayload("json", telegramUserSafeData))),
    signInAndSignup,
  )
  .get("/refresh", refreshToken);

export default authRouter;
