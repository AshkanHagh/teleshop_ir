import { env } from '@env';
import app from './app';
import websocket from '@shared/libs/websocket';
import type { CustomWebSocket, SelectUserTable } from '@types';
import { decodeToken } from '@shared/utils/jwt';

Bun.serve({
    lowMemoryMode : false,
    port : env.PORT || 4832,
    static : {
        '/favicon.ico' : new Response(await Bun.file('./public/favicon.ico').bytes(), { 
            headers : { 'Content-Type' : 'image/x-icon', } 
        })
    },
    fetch : (request, server) => {
        const data = { accessToken: request.headers.get('Authorization') }
        const success : boolean = server.upgrade(request, { data });
        if(success) return;
        return app.fetch(request, server);
    },
    websocket: {
        open: (ws: CustomWebSocket<unknown>) => {
            const uuid: string = crypto.randomUUID();
            ws.socketId = uuid;
            ws.isAuthenticated = false;
        },
        message: async (ws: CustomWebSocket<{ accessToken: string }>, message: string) => {
            if (!ws.isAuthenticated) {
                try {
                    const { accessToken } = JSON.parse(message);
        
                    ws.data = { accessToken }; 
        
                    await decodeToken(accessToken, env.ACCESS_TOKEN) as SelectUserTable;
        
                    ws.isAuthenticated = true;
                    websocket.addClient(ws.socketId!, ws);
                } catch (err) {
                    ws.close(4001, 'Invalid token');
                }
                return;
            }
        
            console.log(`Received message from ${ws.socketId}: ${message}`);
        },        
        close: (_: CustomWebSocket<unknown>) => {
            // websocket.removeClient('Client disconnected', 1000, ws.socketId!, ws);
        },
    }    
});