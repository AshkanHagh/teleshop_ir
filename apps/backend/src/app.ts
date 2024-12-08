import "./modules/services/cronjobs/servicePrice";
import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import authRoute from "@modules/auth/routes/auth.route";
import servicesRoute from "@modules/services/routes/services.route";
import paymentRoute from "@modules/payments/routes/payment.route";
import dashboardRoute from "@modules/dashboards/routes/dashboard.route";

import { ErrorMiddleware } from "@shared/utils/errorHandler";
import ErrorFactory from "@shared/utils/customErrors";
import { env } from "@env";
import { isAuthenticated } from "@shared/middlewares/authorization";

const app = new Hono();

app.use(cors({
    origin: env.ORIGIN,
    allowHeaders: [
        "Cookie", "Cache-Control", "Content-Type", "Content-Length", "Host", "User-Agent", 
        "Accept", "Accept-Encoding", "Connection", "Authorization"
    ],
    allowMethods: ["POST", "GET", "DELETE", "PATCH"],
    credentials: true
}));
app.use(logger());

app.all("/", (context: Context) => context.json({success: true, message: "Welcome to teleshop-backend"}));
app.route("/api/auth", authRoute);
app.route("/api/payments", paymentRoute);

app.use(isAuthenticated);

app.route("/api/services", servicesRoute);
app.route("/api/dashboard", dashboardRoute);

app.notFound((context: Context) => {
    throw ErrorFactory.RouteNotFoundError(`Route: ${context.req.url} not found`)
});
app.onError(ErrorMiddleware);

export default app;