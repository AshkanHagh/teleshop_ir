import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type { orderTable } from '../models/order.model';
import type { premiumTable, starQuantity, starTable } from '../models/service.model';
import type { userTable } from '../models/user.model';
import type { findOrdersHistory } from '../database/queries/service.query';
import type { ServerWebSocket } from 'bun';

export type TelegramDecodedUser = {
    id : number; first_name : string; last_name : string; username : string; language_code : string; 
    allows_write_to_pm : boolean;
};
export type TelegramUserInitData = {
    user : TelegramDecodedUser; chat_instance : string; chat_type : 'private' | 'group' | 'supergroup' | 'channel';
    auth_date : number; hash : string;
};

export type SelectServices = {id : string; title : string; description : string; route : string}
export type InitRoles = ['admin' | 'customer'];

export type InsertOrder = InferInsertModel<typeof orderTable>
export type SelectOrder = InferSelectModel<typeof orderTable>;

export type SelectPremium = InferSelectModel<typeof premiumTable>;
export type InsertPremium = InferInsertModel<typeof premiumTable>;

export type InferSelectUser = InferSelectModel<typeof userTable>;
export type SelectUser = Omit<InferSelectUser, 'role'> & {roles : InitRoles}
export type InsertUser = InferInsertModel<typeof userTable>;

export type InsertStar = InferInsertModel<typeof starTable>;
export type SelectStar = InferSelectModel<typeof starTable>;

export type StarQuantity = typeof starQuantity[number];

export type CachedServicesPipeline = (SelectPremium | SelectStar);
export type OrderAndServiceCache = {order : SelectOrder, service : Omit<CachedServicesPipeline, 'irrPrice' | 'tonQuantity'>};

export type PrimeTypes = string | number | boolean
export type DeepNotNull<T> = T extends PrimeTypes | Date ? NonNullable<T> : T extends object 
? { [K in keyof T] : DeepNotNull<NonNullable<T[K]>> } : NonNullable<T>

export type ServiceMarket = Pick<SelectPremium, 'irrPrice' | 'tonQuantity' | 'id'>;

export type PublicServiceMarket = 'duration' | 'stars';
export type PickDurationOrStarsType<T extends PublicServiceMarket> = T extends 'duration' ? SelectPremium['duration'] : SelectStar['stars']
export type DurationOrStarsKey<U extends PublicServiceMarket, T = PickDurationOrStarsType<U>> = {[K in U] : T;};
export type PickDurationOrStar<S extends PickService> = S extends 'premium' ? DurationOrStarsKey<'duration'> : DurationOrStarsKey<'stars'>

export type OrderServiceSpecifier = {serviceName : PickService} & PickDurationOrStar<'premium' | 'star'>
export type OrderMarket<S extends PickService> = Omit<MarketOrder, 'paymentMethod'> & {
    service : ServiceMarket & OrderServiceSpecifier
};

export type PublicService = {premium : {duration : SelectPremium['duration'], serviceName : 'premium'}, 
    stars : {stars : SelectStar['stars'], serviceName : 'star'}
}

export type PickService = 'star' | 'premium';

export type PublicServicePickerMap<S = 'star' | 'premium'> = S extends 'premium' ? PublicService['premium'] : PublicService['stars'] ;
export type PaginatedPublicService = {service : PublicServicePickerMap, next : boolean};

export type MarketOrder = Omit<SelectOrder, 'userId' | 'premiumId' | 'starId' | 'irrPrice' | 'tonQuantity'>;

export type PendingZaringPalOrder = Pick<SelectOrder, 'username' | 'userId' | 'tonQuantity' | 'irrPrice'> & {serviceId : string; 
    service : PickService
};

export type PlacedOrder = Pick<SelectOrder, 'id' | 'orderPlaced' | 'status' | 'username' | 'transactionId'>
& {service : PickService} & DurationOrStarsKey<PublicServiceMarket>;

export type ConditionalService<Condition> = Condition extends 'stars' ? SelectStar : SelectPremium;

export type OrderHistory = Omit<SelectOrder, 'userId' | 'premiumId' | 'starId'> & {
    service : PublicServicePickerMap & Pick<SelectStar, 'tonQuantity' | 'irrPrice'>;
};

export type PickServicesTable = 'starTable' | 'premiumTable';
export type PickServiceTableReturnType<Table> = Table extends 'starTable' ? SelectStar[] : SelectPremium[];

export type PickServiceType<Service extends PickService> = Service extends 'star' ? SelectStar : SelectPremium;

export type PublicOrder = MarketOrder & {service : PickService};
export type ManyOrdersWithRelationsRT = ReturnType<typeof findOrdersHistory>;

// export type AppBindings = {
//     Variables : {}
// }

export interface CustomWebSocket extends ServerWebSocket<unknown> {
    socketId? : string;
}

export type HistoriesSearchWithRL = (MarketOrder & { premium : {duration : SelectPremium['duration']} | null, 
    star : {stars : SelectStar['stars']} | null
})[]
export type OrdersSearchWithRL = Omit<SelectOrder, 'irrPrice' | 'tonQuantity' | 'userId' | 'starId'>[]