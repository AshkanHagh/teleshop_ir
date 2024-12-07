import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { orderTable } from "@shared/models/schemas/order.model";
import type { premiumTable, starQuantity, starTable } from "@shared/models/schemas/services.model";
import type { userTable } from "@shared/models/schemas/user.model";
import type { ServerWebSocket } from "bun";
import type { findOrdersHistory } from "@modules/dashboards/db/queries";
import type { InitRoles } from "@shared/models/user.model";

export type TokenPayload = {
    id: string,
    role: InitRoles,
    exp: number,
}

// users details that telegram api provide

// introduction hardCoded page detail
export type ProductIntroduction = { id: string; title: string; description: string; route: string }

// drizzle orm tables type


// star quantity type from star table
export type StarQuantity = typeof starQuantity[number];

export type CachedServicesPipeline = (SelectPremiumTable | SelectStarTable);
export type OrderAndServiceCache = {order: SelectOrderTable, service: Omit<CachedServicesPipeline, "irrPrice" | "tonQuantity">};

export type PrimeTypes = string | number | boolean
export type DeepNotNull<T> = T extends PrimeTypes | Date ? NonNullable<T>: T extends object 
? { [K in keyof T]: DeepNotNull<NonNullable<T[K]>> }: NonNullable<T>

export type ServiceMarket = Pick<SelectPremiumTable, "irrPrice" | "tonQuantity" | "id">;
export type PickServicePricing<Table extends (SelectPremiumTable | SelectStarTable)> = Pick<Table, "irrPrice" | "tonQuantity" | "id">

export type PublicServiceMarket = "duration" | "stars";
export type PickDurationOrStarsType<T extends PublicServiceMarket> = T extends "duration" ? SelectPremiumTable["duration"]: SelectStarTable["stars"]
export type DurationOrStarsKey<U extends PublicServiceMarket, T = PickDurationOrStarsType<U>> = {[K in U]: T;};
export type PickDurationOrStar<S extends PickService> = S extends "premium" ? DurationOrStarsKey<"duration">: DurationOrStarsKey<"stars">

export type OrderServiceSpecifier = {serviceName: PickService} & PickDurationOrStar<"premium" | "star">
export type OrderMarket<S extends PickService> = Omit<MarketOrder, "paymentMethod"> & {
    service: ServiceMarket & OrderServiceSpecifier
};

export type PublicService = {premium: {duration: SelectPremiumTable["duration"], serviceName: "premium"}, 
    stars: {stars: SelectStarTable["stars"], serviceName: "star"}
}

export type PickService = "star" | "premium";

export type PublicServicePickerMap<S = "star" | "premium"> = S extends "premium" ? PublicService["premium"]: PublicService["stars"] ;
export type PaginatedPublicService = {service: PublicServicePickerMap, next: boolean};

export type MarketOrder = Omit<SelectOrderTable, "userId" | "premiumId" | "starId" | "irrPrice" | "tonQuantity">;

export type PendingZarinPalOrder = Pick<SelectOrderTable, "username" | "userId" | "tonQuantity" | "irrPrice"> & {serviceId: string; 
    service: PickService
};

export type PlacedOrder = Pick<SelectOrderTable, "id" | "orderPlaced" | "status" | "username" | "transactionId">
& {service: PickService} & DurationOrStarsKey<PublicServiceMarket>;

export type ConditionalService<Condition> = Condition extends "stars" ? SelectStarTable: SelectPremiumTable;

export type OrderHistory = Omit<SelectOrderTable, "userId" | "premiumId" | "starId"> & {
    service: PublicServicePickerMap & Pick<SelectStarTable, "tonQuantity" | "irrPrice">;
};

export type PickServicesTable = "starTable" | "premiumTable";
export type PickServiceTableReturnType<Table> = Table extends "starTable" ? SelectStarTable[]: SelectPremiumTable[];

export type PickServiceType<Service extends PickService> = Service extends "star" ? SelectStarTable: SelectPremiumTable;

export type PublicOrder = MarketOrder & {service: PickService};
export type ManyOrdersWithRelationsRT = ReturnType<typeof findOrdersHistory>;

// export type AppBindings = {
//     Variables: {}
// }

isAuthenticated: boolean
}

export type HistoriesSearchWithRL = (MarketOrder & { premium: {duration: SelectPremiumTable["duration"]} | null, 
    star: {stars: SelectStarTable["stars"]} | null
})[]
export type OrdersSearchWithRL = Omit<SelectOrderTable, "irrPrice" | "tonQuantity" | "userId" | "starId" | "transactionId">[]
export type PaginatedOrders = { service: Omit<PublicOrder, "transactionId">[], next: boolean };

export type ServiceSpecifier<T extends "star" | "premium"> = T extends "premium" 
? {duration: SelectPremiumTable["duration"]}: {stars: SelectStarTable["stars"]};