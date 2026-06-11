import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { logError } from "src/lib/errors/exception.js";
import { addConnection, removeConnection } from "src/lib/websocket/manager.js";

const wsRoute: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/ws",
    {
      websocket: true,
      preValidation: [fastify.authenticate],
    },
    (connection, req) => {
      addConnection(connection, req.user.id);

      connection.on("error", (error) => {
        if (process.env.NODE_ENV === "production") {
          logError(error, "ws");
        }
      });
      connection.on("close", () => {
        removeConnection(req.user.id);
      });
    },
  );
};

export default wsRoute;
