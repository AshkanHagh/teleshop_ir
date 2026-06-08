import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.coerce.number().default(6610),
  NODE_ENV: z.enum(["production", "development"]).default("development"),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  ACCESS_TOKEN: z.string(),
  REFRESH_TOKEN: z.string(),
  ACCESS_TOKEN_EXPIRE: z.coerce.number().default(5),
  REFRESH_TOKEN_EXPIRE: z.coerce.number().default(1),
  ORIGIN: z.string(),
  BOT_FATHER_SECRET: z.string(),
  NOBITEX_API: z.string(),
  ZARINPAL_MERCHANT_ID: z.string(),
  ZARINPAL_SANDBOX: z.coerce.boolean().default(false),
  PAYMENT_REDIRECT_BASE_URL: z.string(),
  PAYMENT_DESCRIPTION: z.string(),
});

export type Env = z.infer<typeof EnvSchema>;
export const env: Env = EnvSchema.parse(process.env);
