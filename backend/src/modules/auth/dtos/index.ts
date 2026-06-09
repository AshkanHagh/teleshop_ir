import { z } from "zod";

export const VerifyInitDataDto = z.object({
  initData: z.string().max(5_000),
});

export type VerifyInitDataDto = z.infer<typeof VerifyInitDataDto>;
