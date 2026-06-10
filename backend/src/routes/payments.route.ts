import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import {
  adminTransactionDetail,
  adminTransactions,
  markAsTrxCompleted,
} from "src/modules/payments/admin/payment-admin.service.js";
import {
  AdminTransactionsDto,
  CreateCheckoutDto,
  TransactionIdParamDto,
  VerifyPaymentDto,
} from "src/modules/payments/dtos/index.js";
import {
  createCheckout,
  userTransactionDetail,
  userTransactionList,
  verifyPayment,
} from "src/modules/payments/payment.service.js";

declare module "fastify" {
  interface FastifyContextConfig {
    skipAuth?: boolean;
  }
}

const paymentsRoute: FastifyPluginAsyncZod = async (fastify) => {
  fastify.addHook("onRequest", async (req, _reply) => {
    if (req.routeOptions.config.skipAuth) {
      return;
    }
    await fastify.authenticate(req);
  });
  // admin routes
  fastify.get(
    "/payments/admins/",
    {
      schema: {
        querystring: AdminTransactionsDto,
      },
      preValidation: [fastify.authorize("admin")],
    },
    async (req) => adminTransactions(req.query),
  );
  fastify.get(
    "/payments/admins/:id",
    {
      schema: {
        params: TransactionIdParamDto,
      },
      preValidation: [fastify.authorize("admin")],
    },
    async (req) => adminTransactionDetail(req.params.id),
  );
  fastify.patch(
    "/payments/admins/:id",
    {
      schema: {
        params: TransactionIdParamDto,
      },
      preValidation: [fastify.authorize("admin")],
    },
    async (req) => markAsTrxCompleted(req.params.id),
  );
  // payment routes
  fastify.get(
    "/payments/",
    {
      schema: {
        querystring: AdminTransactionsDto,
      },
    },
    async (req) => userTransactionList(req.user.id, req.query),
  );
  fastify.get(
    "/payments/:id",
    {
      schema: {
        params: TransactionIdParamDto,
      },
    },
    async (req) => userTransactionDetail(req.user.id, req.params.id),
  );
  fastify.post(
    "/payments/checkout/:category/:id",
    {
      schema: {
        params: CreateCheckoutDto,
      },
    },
    async (req) => createCheckout(req.user.id, req.params),
  );
  fastify.post(
    "/payments/verify",
    {
      config: {
        skipAuth: true,
      },
      schema: {
        body: VerifyPaymentDto,
      },
    },
    async (req) => verifyPayment(req.body),
  );
};

export default paymentsRoute;
