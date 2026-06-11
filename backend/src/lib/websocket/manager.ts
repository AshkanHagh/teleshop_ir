export type WsPayload = {
  event: string;
  data: unknown;
};

const connections = new Map<string, WebSocket>();

export function addConnection(socket: WebSocket, userId: string) {
  connections.set(userId, socket);
}

export function removeConnection(userId: string) {
  connections.delete(userId);
}

export function broadcast(payload: WsPayload, excludeUserId?: string) {
  connections.forEach((connection, userId) => {
    if (userId !== excludeUserId && connection.readyState === connection.OPEN) {
      try {
        connection.send(JSON.stringify(payload));
      } catch (error) {
        // prune dead connections
        connections.delete(userId);
      }
    }
  });
}
