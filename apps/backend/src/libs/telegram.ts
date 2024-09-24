import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';

const session = new StringSession('');
const telegram = new TelegramClient(session, +process.env.BOT_FATHER_SECRET.split(':')[0], process.env.BOT_FATHER_SECRET.split(':')[1], {});

export default telegram;