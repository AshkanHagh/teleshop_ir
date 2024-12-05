import { z } from "zod";

export const pagination = z.object({
    offset: z.string().default("0"),
    limit: z.string().default("10")
});
export type Pagination = z.infer<typeof pagination>;

export const orderFiltersOptions = z.object({
    filter: z.enum(["completed", "pending", "in_progress", "all"], {message: "Invalid filter options. [all, completed, pending]"})
}).merge(pagination);
export type OrderFiltersOption = z.infer<typeof orderFiltersOptions>;

export const historyFilterOptions = z.object({
    filter: z.enum(["completed", "pending", "in_progress", "all"], {
        message: "Invalid filter options. [completed, pending, in_progress, all]"
    })
}).merge(pagination);
export type HistoryFilterOptions = z.infer<typeof historyFilterOptions>;