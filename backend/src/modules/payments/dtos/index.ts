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
