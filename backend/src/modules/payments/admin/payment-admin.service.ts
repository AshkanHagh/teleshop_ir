import { fastify } from "src/app.js";
import { AdminTransactionsDto } from "../dtos/index.js";
import { eq, sql } from "drizzle-orm";
import { TransactionTable } from "src/database/schemas/transaction.schema.js";
import { AppError } from "src/lib/errors/exception.js";
import errorType from "src/lib/errors/error-type.js";

export async function adminTransactions(query: AdminTransactionsDto) {
  const transactions = await fastify.db.query.TransactionTable.findMany({
    where: query.filter ? eq(TransactionTable.status, query.filter) : undefined,
    with: {
      user: true,
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
    // removing the +1
    transactions: transactions.slice(0, query.limit),
  };
}

export async function adminTransactionDetail(id: string) {
  const transaction = await fastify.db.query.TransactionTable.findFirst({
    where: eq(TransactionTable.id, id),
    with: {
      premiumPlan: true,
      starPackage: true,
      user: true,
    },
  });
  if (!transaction) {
    throw AppError(errorType.NOT_FOUND, 404);
  }
  // updating the status when admin sees the transaction
  if (transaction?.status === "pending") {
    await fastify.db
      .update(TransactionTable)
      .set({
        status: "progress",
      })
      .where(eq(TransactionTable.id, id));
  }

  return transaction;
}

export async function markAsTrxCompleted(id: string) {
  await fastify.db
    .update(TransactionTable)
    .set({ status: "completed" })
    .where(eq(TransactionTable.id, id));
}
