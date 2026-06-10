import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import {
  adminTransactionDetail,
  adminTransactions,
  markAsTrxCompleted,
} from "src/modules/payments/admin/payment-admin.service.js";
import {
  AdminTransactionsDto,
  TransactionIdParamDto,
} from "src/modules/payments/dtos/index.js";
import {
  userTransactionDetail,
  userTransactionList,
} from "src/modules/payments/payment.service.js";

const paymentsRoute: FastifyPluginAsyncZod = async (fastify) => {
  fastify.addHook("onRequest", fastify.authenticate);
  // admin routes
  fastify.get(
    "/payments/admins/",
    {
      schema: {
        querystring: AdminTransactionsDto,
      },
      preValidation: fastify.authorize("admin"),
    },
    async (req) => {
      return await adminTransactions(req.query);
    },
  );
  fastify.get(
    "/payments/admins/:id",
    {
      schema: {
        params: TransactionIdParamDto,
      },
      preValidation: fastify.authorize("admin"),
    },
    async (req) => {
      return await adminTransactionDetail(req.params.id);
    },
  );
  fastify.patch(
    "/payments/admins/:id",
    {
      schema: {
        params: TransactionIdParamDto,
      },
      preValidation: fastify.authorize("admin"),
    },
    async (req) => {
      return await markAsTrxCompleted(req.params.id);
    },
  );
  // payment routes
  fastify.get(
    "/payments/",
    {
      schema: {
        querystring: AdminTransactionsDto,
      },
    },
    async (req) => {
      return await userTransactionList(req.user.id, req.query);
    },
  );
  fastify.get(
    "/payments/:id",
    {
      schema: {
        params: TransactionIdParamDto,
      },
    },
    async (req) => {
      return await userTransactionDetail(req.user.id, req.params.id);
    },
  );
};

export default paymentsRoute;
