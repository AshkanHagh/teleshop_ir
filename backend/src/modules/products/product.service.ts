import { fastify } from "src/app.js";
import { PlanDto } from "./dtos/index.js";
import { asc } from "drizzle-orm";
import { StarPackageTable } from "src/database/schemas/star-package.schema.js";

export async function categories() {
  return fastify.db.query.CategoryTable.findMany();
}

export async function plans(query: PlanDto) {
  switch (query.filter) {
    case "premium": {
      return await fastify.db.query.PremiumPlanTable.findMany();
    }
    case "star": {
      return await fastify.db.query.StarPackageTable.findMany({
        orderBy: asc(StarPackageTable.stars),
      });
    }
  }
}
