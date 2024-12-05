import { Hono } from "hono";
import { validationMiddleware } from "@shared/middlewares//validation";
import { some, every } from "hono/combine";
import { isAuthenticated } from "@shared/middlewares//authorization";
import { createIrrPayment, verifyAndCompletePayment } from "../controllers/payment.controller";
import { paymentQuery, placeOrder } from "../schema";

const paymentRouter = new Hono();

paymentRouter.post("/irr/:serviceId", some(every(isAuthenticated, validationMiddleware("json", placeOrder))), createIrrPayment);

paymentRouter.get("/irr/verify", some(every(validationMiddleware("query", paymentQuery))), verifyAndCompletePayment);

export default paymentRouter;