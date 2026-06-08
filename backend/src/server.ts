import { env } from "@env";
import app from "./app";
import type { ServerWebSocket } from "bun";
import websocket from "@shared/libs/websocket";

export interface CustomWebSocket<T> extends ServerWebSocket<unknown> {
  socketId: string;
  data: T;
  isAuthenticated: boolean;
}

Bun.serve({
  lowMemoryMode: false,
  port: env.PORT,
  fetch: (request, server) => {
    const accessToken = { accessToken: request.headers.get("Authorization") };

    const isHeaderUpgraded: boolean = server.upgrade(request, {
      data: accessToken,
    });
    if (isHeaderUpgraded) return;

    return app.fetch(request, server);
  },

  websocket: {
    open: (ws: CustomWebSocket<unknown>) => {
      const clientId: string = crypto.randomUUID();

      ws.socketId = clientId;
      ws.isAuthenticated = false;
    },

    message: async (
      ws: CustomWebSocket<{ accessToken: string }>,
      message: string,
    ) => {
      if (!ws.isAuthenticated) {
        const { accessToken } = JSON.parse(message);

        ws.data = { accessToken };
        ws.isAuthenticated = true;

        websocket.addClient(ws.socketId, ws);
      }
    },
    close: (_: CustomWebSocket<unknown>) => {
      // websocket.removeClient("Client disconnected", 1000, ws.socketId!, ws);
    },
  },
});
