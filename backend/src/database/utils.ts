import { timestamp, uuid } from "drizzle-orm/pg-core";

export const id = uuid().primaryKey().defaultRandom();
export const createdAt = timestamp({ withTimezone: true })
  .notNull()
  .$defaultFn(() => new Date());
export const updatedAt = timestamp({ withTimezone: true })
  .notNull()
  .$defaultFn(() => new Date())
  .$onUpdate(() => new Date());
