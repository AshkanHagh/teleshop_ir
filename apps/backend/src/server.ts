import { env } from '../env';
import app from './app';
import websocket from '@libs/websocket';
import type { CustomWebSocket } from '@types';

Bun.serve({
    lowMemoryMode : false,
    port : env.PORT || 4188,
    static : {
        '/favicon.ico' : new Response(await Bun.file('./src/public/favicon.ico').bytes(), { 
            headers : { 'Content-Type' : 'image/x-icon', } 
        })
    },
    fetch : (request, server) => {
        const data = { accessToken: request.headers.get('Authorization') }
        const success : boolean = server.upgrade(request, { data });
        if(success) return;
        return app.fetch(request, server);
    },
    websocket : {
        open : (ws : CustomWebSocket<{accessToken : string}>) => {
            const uuid : string = crypto.randomUUID();
            websocket.addClient(uuid, ws);
            ws.socketId = uuid;
        },
        message : (_ : CustomWebSocket<unknown>, __: string) => {},
        close : (ws : CustomWebSocket<unknown>) => {
            websocket.removeClient('Client has been disconnected', 200, ws.socketId!, ws);
        },
    }
});