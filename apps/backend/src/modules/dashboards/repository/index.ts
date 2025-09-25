import { db } from "@shared/db/drizzle";
import {
  orderedServiceTable,
  orderTable,
  type SelectOrder,
} from "@shared/models/order.model";
import { premiumTable, starTable } from "@shared/models/services.model";
import { eq, sql } from "drizzle-orm";

export type OrdersFilter = "completed" | "pending" | "in_progress" | "all";

export const findManyOrders = async (
  filter: OrdersFilter,
  offset: number,
  limit: number,
) => {
  const orders = await db.execute(
    sql`
        SELECT 
            o.id AS "id",
            o.username AS "username",
            o.status AS "status",
            o.order_placed AS "orderPlaced",
            CASE
                WHEN s.type = 'star' THEN 'star'
                WHEN s.type = 'premium' THEN 'premium'
                ELSE 'Unknown'
            END AS "serviceName"
        FROM ${orderTable} o
        LEFT JOIN ${orderedServiceTable} s ON o.service_id = s.id
        ${filter !== "all" ? sql`WHERE o.status = ${filter}` : sql``}
        ORDER BY 
            CASE 
                WHEN o.status = 'pending' THEN 1
                WHEN o.status = 'in_progress' THEN 2
                WHEN o.status = 'completed' THEN 3
                ELSE 4
            END ASC,
            o.order_placed DESC
        OFFSET ${offset} LIMIT ${limit + offset + 1}`,
  );

  if (orders.length < 11) {
    return { next: false, orders };
  }

  return { next: true, orders: orders.slice(0, 11) };
};

export const findFirstOrder = async (id: string) => {
  return await db.execute(
    sql`
        SELECT 
            o.id AS "id",
            o.username AS "username",
            o.status AS "status",
            o.order_placed AS "orderPlaced",
            o.transaction_id AS "transactionId",
            JSON_BUILD_OBJECT(
                'serviceName', 
                CASE
                    WHEN s.type = 'star' THEN 'star'
                    WHEN s.type = 'premium' THEN 'premium'
                    ELSE 'Unknown'
                END,
                CASE
                    WHEN s.type = 'star' THEN 'stars'
                    WHEN s.type = 'premium' THEN 'duration'
                END,
                CASE
                    WHEN s.type = 'star' THEN CAST(st.stars AS VARCHAR)
                    WHEN s.type = 'premium' THEN p.duration
                    ELSE NULL
                END,
                'irr', 
                CASE
                    WHEN s.type = 'star' THEN st.irr
                    WHEN s.type = 'premium' THEN p.irr
                    ELSE NULL
                END,
                'ton',
                CASE
                    WHEN s.type = 'star' THEN st.ton
                    WHEN s.type = 'premium' THEN p.ton
                    ELSE NULL
                END
            ) AS "service"
        FROM ${orderTable} o
        LEFT JOIN ${orderedServiceTable} s ON o.service_id = s.id
        LEFT JOIN ${starTable} st ON s.star_id = st.id
        LEFT JOIN ${premiumTable} p ON s.premium_id = p.id

        WHERE o.id = ${id}
        `,
  );
};

export const updateOrderStatus = async (
  id: string,
  status: SelectOrder["status"],
) => {
  await db.update(orderTable).set({ status }).where(eq(orderTable.id, id));
};

export const findManyOrdersByUserId = async (
  userId: string,
  filter: OrdersFilter,
  offset: number,
  limit: number,
) => {
  const orders = await db.execute(
    sql`
        SELECT 
            o.id AS "id",
            o.status AS "status",
            o.order_placed AS "orderPlaced",
            CASE
                WHEN s.type = 'star' THEN 'star'
                WHEN s.type = 'premium' THEN 'premium'
                ELSE 'Unknown'
            END AS "serviceName"
        FROM ${orderTable} o
        LEFT JOIN ${orderedServiceTable} s ON o.service_id = s.id
        ${filter !== "all" ? sql`WHERE o.status = ${filter} AND s.user_id = ${userId}` : sql`WHERE s.user_id = ${userId}`}
        ORDER BY 
            CASE 
                WHEN o.status = 'pending' THEN 1
                WHEN o.status = 'in_progress' THEN 2
                WHEN o.status = 'completed' THEN 3
                ELSE 4
            END ASC,
            o.order_placed DESC
        OFFSET ${offset} LIMIT ${limit + offset + 1}`,
  );

  if (orders.length < 11) {
    return { next: false, orders };
  }

  return { next: true, orders: orders.slice(0, 11) };
};
