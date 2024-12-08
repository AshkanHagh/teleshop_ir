import { Hono } from "hono";
import { completeOrder, order, orderHistory, orders, ordersHistory } from "../controllers/dashboard.controller";
import { authorizedRoles } from "@shared/middlewares/authorization";

const dashboardRouter = new Hono();

dashboardRouter.get("/admin", authorizedRoles("customer"), orders);

dashboardRouter.get("/admin/:orderId", authorizedRoles("customer"), order);

dashboardRouter.patch("/admin/:orderId", authorizedRoles("customer"), completeOrder);

dashboardRouter.get("/history", ordersHistory);

dashboardRouter.get("/history/:orderId", orderHistory);

export default dashboardRouter;