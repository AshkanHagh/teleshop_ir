import { Hono } from "hono";
import { every, some } from "hono/combine";
import { authorizedRoles, isAuthenticated } from "@shared/middlewares//authorization";
import { completeOrder, order, orderHistory, orders, ordersHistory } from "../controllers/dashboard.controller";
import { validationMiddleware } from "@shared/middlewares//validation";
import { historyFilterOptions, orderFiltersOptions } from "../schema";

const dashboardRouter = new Hono();

dashboardRouter.get("/admin", some(every(isAuthenticated, authorizedRoles("admin"), validationMiddleware("query", 
    orderFiltersOptions
))), orders);

dashboardRouter.get("/admin/:orderId", some(every(isAuthenticated, authorizedRoles("admin"))), order);

dashboardRouter.patch("/admin/:orderId", some(every(isAuthenticated, authorizedRoles("admin"))), completeOrder);

dashboardRouter.get("/history", some(every(isAuthenticated, validationMiddleware("query", historyFilterOptions))), ordersHistory);

dashboardRouter.get("/history/:orderId", isAuthenticated, orderHistory);

export default dashboardRouter;