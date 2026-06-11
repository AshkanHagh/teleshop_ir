import { z } from "zod";

export const PlanDto = z.object({
  filter: z.enum(["premium", "star"]),
});

export type PlanDto = z.infer<typeof PlanDto>;
