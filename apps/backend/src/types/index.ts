export type TelegramUser = {
    id : number; first_name : string; last_name : string; username : string; language_code : string; 
    allows_write_to_pm : boolean;
};
export type TelegramInitData = {
    user : TelegramUser; chat_instance : string; chat_type : 'private' | 'group' | 'supergroup' | 'channel';
    auth_date : number; hash : string;
};