import { env } from "@env";
import { logger } from "@shared/libs/winston";
import type { SelectUser } from "@shared/models/user.model";
import ErrorFactory from "@shared/utils/customErrors";
import type ErrorHandler from "@shared/utils/errorHandler";
import { verifyJwtToken } from "@shared/utils/jwt";
import type { CustomWebSocket } from "server";

type WebSocketClient = {
  user: Pick<SelectUser, "id" | "roles">;
  groups: GroupNames;
  socket: CustomWebSocket<unknown>;
};
type GroupNames = "admin" | "customer";

export default class WebSocketManager {
  private clients: Map<string, WebSocketClient>;
  private groupedClients: Map<GroupNames, string[]>;

  constructor() {
    this.clients = new Map();
    this.groupedClients = new Map();
  }

  public addClient = async (
    socketId: string,
    socket: CustomWebSocket<{ accessToken: string }>,
  ) => {
    try {
      const { id, roles } = (await verifyJwtToken(
        socket.data.accessToken,
        env.ACCESS_TOKEN,
      )) as SelectUser;
      const groupName: GroupNames = roles.includes("admin")
        ? "admin"
        : "customer";

      this.clients.set(socketId, {
        user: { id, roles },
        groups: groupName,
        socket,
      });

      const existingClients: string[] =
        this.groupedClients.get(groupName) || [];

      existingClients.push(socketId);
      this.groupedClients.set(groupName, existingClients);
      logger.info(`client: ${socketId} connected`);
    } catch (err: unknown) {
      const error = err as ErrorHandler;
      this.removeClient(error.message, error.statusCode, socketId, socket);
    }
  };

  private removeFromMemory = (clientId: string) => {
    this.clients.delete(clientId);
    this.groupedClients.forEach((ids, groupName) => {
      this.groupedClients.set(
        groupName,
        ids.filter((id) => id !== clientId),
      );
    });
  };

  public removeClient = (
    message: string,
    status: number,
    clientId: string,
    socket?: CustomWebSocket<unknown>,
  ) => {
    const client: WebSocketClient | undefined = this.clients.get(clientId);
    if (client) this.removeFromMemory(clientId);
    socket?.close(status, message);
  };

  public sendMessageToClient = (message: string, clientId: string) => {
    const client: WebSocketClient | undefined = this.clients.get(clientId);
    if (!client)
      throw ErrorFactory.ClientSocketIdNotFoundError("Client id not found");
    client.socket.send(message);
  };

  public broadcastToEveryone = (message: string) => {
    this.checkClientHealth();
    for (const client of this.clients.values()) {
      client.socket.send(message);
    }
  };

  public broadcastToGroup = (message: string, groupName: GroupNames) => {
    this.checkClientHealth();
    const clientIds: string[] | undefined = this.groupedClients.get(groupName);

    if (clientIds && clientIds.length) {
      clientIds.forEach((id) => {
        const client: WebSocketClient | undefined = this.clients.get(id);
        client?.socket.send(message);
      });
    }
  };

  public checkClientHealth = () => {
    this.clients.forEach((client, clientId) => {
      if (client.socket.readyState !== WebSocket.OPEN) {
        this.removeClient("Error in connection to socket", 400, clientId);
      }
    });
  };
}
