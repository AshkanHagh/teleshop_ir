import { z } from "zod";

export const options = ["star", "premium"] as const;
export type ServiceFilterOption = typeof options[number];
export const serviceFilterOptions = z.object({
    service: z.enum(options, { message: "Invalid service option" })
});
export type ServiceFilterOptions = z.infer<typeof serviceFilterOptions>;