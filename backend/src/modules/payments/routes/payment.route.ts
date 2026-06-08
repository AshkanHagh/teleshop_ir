import { Hono } from "hono";
import { createOrder, verifyPayment } from "../controllers/payment.controller";
import { isAuthenticated } from "@shared/middlewares/authorization";

const paymentRouter = new Hono();

paymentRouter.post("/irr/:serviceId", isAuthenticated, createOrder);

paymentRouter.get("/irr/verify", verifyPayment);

export default paymentRouter;
