import { TransactionType } from "src/database/schemas/index.js";
import z from "zod";

export const AdminTransactionsDto = z.object({
  filter: z.enum(["completed", "pending", "progress"]).optional(),
  limit: z.coerce.number(),
  offset: z.coerce.number(),
});

export type AdminTransactionsDto = z.infer<typeof AdminTransactionsDto>;

export const TransactionIdParamDto = z.object({
  id: z.uuid(),
});

export const CreateCheckoutDto = z.object({
  category: z.enum(TransactionType.enumValues),
  id: z.uuid(),
});

export type CreateCheckoutDto = z.infer<typeof CreateCheckoutDto>;

export const VerifyPaymentDto = z.object({
  authority: z.string(),
  status: z.string(),
});

export type VerifyPaymentDto = z.infer<typeof VerifyPaymentDto>;
