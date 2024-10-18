import { createInsertSchema } from 'drizzle-zod';
import { orderTable } from '../database/schema/order.model';
import { premiumTable, starTable } from '../database/schema/services.model';
import { userTable } from '../database/schema/user.model';

export const insertOrderSchema = createInsertSchema(orderTable);
export const insertPremiumSchema = createInsertSchema(premiumTable);
export const insertUserSchema = createInsertSchema(userTable);
export const InsertStarSchema = createInsertSchema(starTable);