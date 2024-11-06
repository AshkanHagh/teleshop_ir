import { createInsertSchema } from 'drizzle-zod';
import { orderTable } from './schemas/order.model';
import { premiumTable, starTable } from './schemas/services.model';
import { userTable } from './schemas/user.model';

export const InsertOrderTableSchema = createInsertSchema(orderTable);
export const InsertPremiumTableSchema = createInsertSchema(premiumTable);
export const insertUserSchema = createInsertSchema(userTable);
export const InsertStarTableSchema = createInsertSchema(starTable);