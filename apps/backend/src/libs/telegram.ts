import { TelegramClient } from 'telegram'
import { StringSession  } from 'telegram/sessions';
import { Api } from 'telegram/tl';

const stringSession = '';
const BOT_TOKEN = '';

export default async () => {
    const client = new TelegramClient(new StringSession(stringSession), 0, '', {
        connectionRetries : 5
    });
    await client.start({
        botAuthToken: BOT_TOKEN,
    });
    console.log(client.session.save());
    const result = await client.invoke(
        new Api.channels.CheckUsername({
            username : 'testing',
        })
    );
    console.log('Result is ', result);
}