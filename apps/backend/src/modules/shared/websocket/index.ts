import { env } from '@env';
import type { CustomWebSocket, SelectUserTable } from '@types';
import { decodeToken } from '@shared/utils/jwt';
import ErrorFactory from '@shared/utils/customErrors';
import type ErrorHandler from '@shared/utils/errorHandler';

type WebSocketClient = {user : Pick<SelectUserTable, 'id' | 'roles'>; groups : GroupNames; socket : CustomWebSocket<unknown>;}
type GroupNames = 'admin' | 'customer';

export default class WebSocketManager {
    private clients : Map<WebSocketClient['user']['id'], WebSocketClient>;
    private groupedClients : Map<GroupNames, string[]>;
    constructor() {
        this.clients = new Map();
        this.groupedClients = new Map();
    }

    public addClient = async (socketId : string, socket : CustomWebSocket<{accessToken : string}>) => {
        try {
            const { id, roles } = await decodeToken(socket.data.accessToken, env.ACCESS_TOKEN) as SelectUserTable;
            const groupName : GroupNames = roles.includes('admin') ? 'admin' : 'customer';
            this.clients.set(socketId, { user : { id, roles }, groups : groupName, socket });
            
            const existingIds : string[] = this.groupedClients.get(groupName) || [];
            existingIds.push(socketId);
            this.groupedClients.set(groupName, existingIds);
            socket.send('successfully connected');
            
        } catch (err : unknown) {
            const error = err as ErrorHandler;
            this.removeClient(error.message, error.statusCode, socketId, socket);
        }
    }

    private removeFromMemory = (clientId : string) => {
        this.clients.delete(clientId);
        this.groupedClients.forEach((ids, groupName) => {
            this.groupedClients.set(groupName, ids.filter(id => id !== clientId));
        });
    }
    
    public removeClient = (message : string, status : number, clientId: string, socket? : CustomWebSocket<unknown>) => {
        const client : WebSocketClient | undefined = this.clients.get(clientId);
        if(client) this.removeFromMemory(clientId)
        socket?.close(status, message);
    }
    
    public sendMessageToClient = (message : string, clientId : string) => {
        const client : WebSocketClient | undefined = this.clients.get(clientId);
        if(!client) throw ErrorFactory.ClientSocketIdNotFoundError();
        client.socket.send(message);
    }
    
    public broadcastToEveryone = (message : string) => {
        this.checkClientHealth();
        for (const client of this.clients.values()) {
            client.socket.send(message);
        }
    }
    
    public broadcastToGroup = (message : string, groupName : GroupNames) => {
        this.checkClientHealth();
        const clientIds : string[] | undefined = this.groupedClients.get(groupName);
        if(clientIds && clientIds.length) {
            clientIds.forEach(id => {
                const client : WebSocketClient | undefined = this.clients.get(id);
                client?.socket.send(message);
            })
        }
    }
    
    public checkClientHealth = () => {
        this.clients.forEach((client, clientId) => {
            if (client.socket.readyState !== WebSocket.OPEN) {
                this.removeClient('Error in connection to socket', 400, clientId)
            }
        });
    }
}