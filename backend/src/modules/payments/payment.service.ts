import { and, eq, inArray, sql } from "drizzle-orm";
import { fastify } from "src/app.js";
import { TransactionTable } from "src/database/schemas/transaction.schema.js";
import {
  AdminTransactionsDto,
  CreateCheckoutDto,
  VerifyPaymentDto,
} from "./dtos/index.js";
import errorType from "src/lib/errors/error-type.js";
import { AppError } from "src/lib/errors/exception.js";
import {
  PremiumPlan,
  PremiumPlanTable,
  StarPackage,
  StarPackageTable,
} from "src/database/schemas/index.js";
import { PaymentRequestResponse } from "zarinpal-checkout";

export async function createCheckout(
  userId: string,
  params: CreateCheckoutDto,
) {
  let starPlan: StarPackage | undefined;
  let premiumPlan: PremiumPlan | undefined;

  switch (params.category) {
    case "premium": {
      premiumPlan = await fastify.db.query.PremiumPlanTable.findFirst({
        where: eq(PremiumPlanTable.id, params.id),
      });
      break;
    }
    case "stars": {
      starPlan = await fastify.db.query.StarPackageTable.findFirst({
        where: eq(StarPackageTable.id, params.id),
      });
      break;
    }
  }

  const transactionAmount = starPlan?.irr || premiumPlan?.irr || 0;
  let checkout: PaymentRequestResponse;
  try {
    checkout = await fastify.zarinpal.PaymentRequest({
      Amount: transactionAmount,
      CallbackURL: fastify.config.PAYMENT_REDIRECT_URL,
      Description: "خرید سرویس از تلشاپ",
    });
    if (!checkout.url || !checkout.authority) {
      throw new Error("create checkout failed");
    }
  } catch (error) {
    throw AppError(errorType.PAYMENT_FAILED, 402, error);
  }

  await fastify.db.insert(TransactionTable).values({
    irr: transactionAmount,
    transactionId: checkout.authority,
    type: params.category,
    userId,
    premiumPlanId: premiumPlan?.id,
    starPackageId: starPlan?.id,
  });
  return {
    url: checkout.url,
  };
}

export async function verifyPayment(payload: VerifyPaymentDto) {
  if (!payload.status || payload.status !== "OK") {
    throw AppError(errorType.PAYMENT_FAILED, 402);
  }

  const pendingTransaction = await fastify.db.query.TransactionTable.findFirst({
    where: and(
      eq(TransactionTable.transactionId, payload.authority),
      inArray(TransactionTable.status, ["checkout_pending", "failed"]),
    ),
  });
  if (!pendingTransaction) {
    throw AppError(errorType.NOT_FOUND, 404);
  }

  let refId: string;
  try {
    const verification = await fastify.zarinpal.PaymentVerification({
      Amount: pendingTransaction.irr,
      Authority: payload.authority,
    });
    refId = String(verification.refId);
  } catch (error) {
    await fastify.db
      .update(TransactionTable)
      .set({ status: "failed" })
      .where(eq(TransactionTable.id, pendingTransaction.id));
    throw AppError(errorType.PAYMENT_FAILED, 402, error);
  }

  // mark pending and replace authority with the real zarinpal refId
  // pending here means the checkout completed now we wait for admin to take action
  const [completed] = await fastify.db
    .update(TransactionTable)
    .set({
      status: "pending",
      transactionId: refId,
    })
    .where(eq(TransactionTable.id, pendingTransaction.id))
    .returning();

  return completed;
}

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
