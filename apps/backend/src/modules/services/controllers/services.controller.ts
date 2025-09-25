import type { Context } from "hono";
import { CatchAsyncError } from "@shared/utils/catchAsyncError";
import {
  availableServices_service,
  services_service,
  type ServicesFilter,
} from "../services/services.service";
import ErrorFactory from "@shared/utils/customErrors";

export const availableServices = CatchAsyncError(async (context: Context) => {
  const availableServices = await availableServices_service();

  return context.json({ success: true, services: availableServices });
});

export const services = CatchAsyncError(async (context: Context) => {
  const query = context.req.query() as { filter: ServicesFilter };
  if (!query.filter) throw ErrorFactory.ValidationError("No filter provided");

  const services = await services_service(query.filter);

  return context.json({ success: true, service: services });
});
