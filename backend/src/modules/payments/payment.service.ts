import { and, eq, sql } from "drizzle-orm";
import { fastify } from "src/app.js";
import { TransactionTable } from "src/database/schemas/transaction.schema.js";
import { AdminTransactionsDto } from "./dtos/index.js";
import errorType from "src/lib/errors/error-type.js";
import { AppError } from "src/lib/errors/exception.js";

export async function userTransactionList(
  userId: string,
  query: AdminTransactionsDto,
) {
  const transactions = await fastify.db.query.TransactionTable.findMany({
    where: and(
      eq(TransactionTable.userId, userId),
      query.filter ? eq(TransactionTable.status, query.filter) : undefined,
    ),
    with: {
      premiumPlan: true,
      starPackage: true,
    },
    orderBy: [
      sql`CASE
            WHEN ${TransactionTable.status} = 'pending' THEN 1
            WHEN ${TransactionTable.status} = 'progress' THEN 2
            WHEN ${TransactionTable.status} = 'completed' THEN 3
            ELSE 4
          END ASC`,
      sql`${TransactionTable.createdAt} DESC`,
    ],
    offset: query.offset,
    limit: query.limit + 1,
  });

  if (transactions.length < query.limit + 1) {
    return { next: false, transactions };
  }
  return {
    next: true,
    transactions: transactions.slice(0, query.limit),
  };
}

export async function userTransactionDetail(userId: string, id: string) {
  const transaction = await fastify.db.query.TransactionTable.findFirst({
    where: and(
      eq(TransactionTable.id, id),
      eq(TransactionTable.userId, userId),
    ),
    with: {
      premiumPlan: true,
      starPackage: true,
    },
  });
  if (!transaction) {
    throw AppError(errorType.NOT_FOUND, 404);
  }
  return transaction;
}
