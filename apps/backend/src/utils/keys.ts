export const createSeparateKeyName = (...args : string[]) => `teleshop:${args.join(':')}`;

export const usersKeyById = (id : string) => createSeparateKeyName('user', id);
export const telegramUserKeyById = (id : string) => createSeparateKeyName('telegram_user', id);
export const refreshTokenKeyById = (id : string) => createSeparateKeyName(`refresh_token`, id);
export const servicesKey = () => createSeparateKeyName('services');
export const premiumKey = () => createSeparateKeyName('premiums');
export const starKey = () => createSeparateKeyName('stars');