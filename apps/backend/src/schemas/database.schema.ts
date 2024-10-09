import { createInsertSchema } from 'drizzle-zod';
import { orderTable } from '../models/order.model';
import { premiumTable, starTable } from '../models/service.model';
import { userTable } from '../models/user.model';

export const insertOrderSchema = createInsertSchema(orderTable);
export const insertPremiumSchema = createInsertSchema(premiumTable);
export const insertUserSchema = createInsertSchema(userTable);
export const InsertStarSchema = createInsertSchema(starTable);