import type { Context } from "hono";
import { CatchAsyncError } from "@shared/utils/catchAsyncError";
import { productsService, productIntroductionService } from "../services/product.service";
import type { ServiceFilterOptions } from "../schema";
import type { PickServiceType, ProductIntroduction } from "@types";

export const productIntroduction = CatchAsyncError(async (context: Context) => {
    const products: ProductIntroduction[] = await productIntroductionService();
    return context.json({success: true, services: products});
});

export const products = CatchAsyncError(async (context: Context) => {
    const { service: productName } = context.var.query as ServiceFilterOptions;
    const product: PickServiceType<typeof productName>[] = await productsService(productName);
    return context.json({success: true, service: product});
})