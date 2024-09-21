import type { DrizzleSelectUser } from '../models/schema';

export type CachedUserDetail = Omit<DrizzleSelectUser, 'auth_date' | 'telegram_id'> & {auth_date : string, telegram_id : string};

export type TelegramSelectUser = {
    id : number; first_name : string; last_name : string; username : string; language_code : string; 
    allows_write_to_pm : boolean;
};
export type TelegramInitData = {
    user : TelegramSelectUser; chat_instance : string; chat_type : 'private' | 'group' | 'supergroup' | 'channel';
    auth_date : number; hash : string;
};