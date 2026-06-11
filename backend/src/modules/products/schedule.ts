import { sql } from "drizzle-orm";
import { FastifyInstance } from "fastify";
import ky from "ky";
import cron from "node-cron";
import { PremiumPlanTable } from "src/database/schemas/premium-plan.schema.js";
import { StarPackageTable } from "src/database/schemas/star-package.schema.js";
import { logError } from "src/lib/errors/exception.js";
import { broadcast } from "src/lib/websocket/manager.js";

type NavasanTon = {
  ton: {
    value: string;
    change: string;
    timestamp: number;
    date: string;
  };
};

async function updateProductPrices(fastify: FastifyInstance, usdPrice: number) {
  const [premiumPlans, starPlans] = await Promise.all([
    fastify.db
      .update(PremiumPlanTable)
      .set({
        irr: sql`${PremiumPlanTable.ton} * ${usdPrice}`,
      })
      .returning(),
    fastify.db
      .update(StarPackageTable)
      .set({
        irr: sql`${StarPackageTable.ton} * ${usdPrice}`,
      })
      .returning(),
  ]);

  return {
    premiumPlans,
    starPlans,
  };
}

export function startProductCronJob(fastify: FastifyInstance) {
  cron.schedule("* * * * *", async () => {
    fastify.log.info("products price update cronjob started");
    try {
      const usdResult = await ky
        .get(
          `http://api.navasan.tech/latest/?api_key=${fastify.config.NAVASAN_API_TOKEN}&item=ton`,
        )
        .json<NavasanTon>();

      const plans = await updateProductPrices(
        fastify,
        parseInt(usdResult.ton.value),
      );
      broadcast({
        event: "premium",
        data: plans.premiumPlans,
      });
      broadcast({
        event: "star",
        data: plans.starPlans,
      });
    } catch (error) {
      logError(error as Error, "cronjob");
    }
  });
}
