import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { PlanDto } from "src/modules/products/dtos/index.js";
import { categories, plans } from "src/modules/products/product.service.js";

const productsRoute: FastifyPluginAsyncZod = async (fastify) => {
  fastify.addHook("onRequest", fastify.authenticate);

  fastify.get("/products/categories", categories);
  fastify.get(
    "/products/plans",
    {
      schema: { querystring: PlanDto },
    },
    (req) => {
      return plans(req.query);
    },
  );
};

export default productsRoute;
