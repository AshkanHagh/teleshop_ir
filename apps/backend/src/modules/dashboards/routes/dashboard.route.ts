import { Hono } from "hono";
import {
  completeOrder,
  order,
  orderHistory,
  orders,
  ordersHistory,
} from "../controllers/dashboard.controller";
import { authorizedRoles } from "@shared/middlewares/authorization";

const dashboardRouter = new Hono();

dashboardRouter.get("/admin", authorizedRoles("admin"), orders);

dashboardRouter.get("/admin/:orderId", authorizedRoles("admin"), order);

dashboardRouter.patch(
  "/admin/:orderId",
  authorizedRoles("admin"),
  completeOrder,
);

dashboardRouter.get("/history", ordersHistory);

dashboardRouter.get("/history/:orderId", orderHistory);

export default dashboardRouter;
