import ErrorHandler from "@shared/utils/errorHandler";
import { findManyServiceByName, getServices, type Service } from "../repository";
import RedisQuery from "@shared/db/redis/query";
import RedisKeys from "@shared/utils/keys";
import ErrorFactory from "@shared/utils/customErrors";
import type { SelectPremium, SelectServices, SelectStar } from "@shared/models/services.model";

export const availableServices_service = async (): Promise<SelectServices[]> => {
    try {
        let isServicesCashed = await RedisQuery.jsonGet(RedisKeys.productsKey(), ".") as SelectServices[] | null;
        let availableServices = isServicesCashed ? isServicesCashed : await getServices();

        if (!availableServices) throw ErrorFactory.ResourceNotFoundError("No services found");
        return availableServices;

    } catch (err: unknown) {
        const error: ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.statusCode, error.kind, error.developMessage, error.clientMessage);
    } 
};

export type ServicesFilter = "premium" | "star";

export const services_service = async (filter: ServicesFilter): Promise<Service<typeof filter>> => {
    try {
        const services = findManyServiceByName(filter);
        if (!services) throw ErrorFactory.ResourceNotFoundError("No service found");

        return services;

    } catch (err: unknown) {
        const error: ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.statusCode, error.kind, error.developMessage, error.clientMessage);
    } 
}