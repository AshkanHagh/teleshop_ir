import { Hono } from "hono";
import { availableServices, services } from "../controllers/services.controller";

const servicesRouter = new Hono();

servicesRouter.get("/", availableServices);

servicesRouter.get("/detail", services);

export default servicesRouter;