const createSeparateKeyName = (...args: string[]) => `teleshop:${args.join(":")}`;

export default class RedisKeys {
    public static user(id: string) {
        return createSeparateKeyName("user", id);
    }

    public static refreshToken(id: string) {
        return createSeparateKeyName(`refresh_token`, id);
    }

    public static services() {
        return createSeparateKeyName("services");
    }

    public static pendingOrder(authority: string) {
        return createSeparateKeyName("pending_order", authority);
    }
}

export const telegramUserKeyById = (id: string) => createSeparateKeyName("telegram_user", id);
export const premiumKey = () => createSeparateKeyName("premiums");
export const starKey = () => createSeparateKeyName("stars");
export const pendingOrderKeyById = (id: string) => createSeparateKeyName("pending_order", id);
export const orderKeyById = (id: string) => createSeparateKeyName("order", id);
export const userOrderKeyById = (id: string) => createSeparateKeyName("user_order", id);
export const orderIndexKey = () => createSeparateKeyName("orders_index");