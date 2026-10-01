import http from "http";
import { Server as SocketIOServer } from "socket.io";

import app from "./app.js";
import connectDB from "./config/db.js";
import env from "./config/env.js";

import {
  registerCommunitySocket,
} from "./sockets/community.socket.js";

const startServer = async () => {
  try {
    await connectDB();

    const httpServer = http.createServer(
      app
    );

    const io = new SocketIOServer(
      httpServer,
      {
        cors: {
          origin:
            env.FRONTEND_URL ||
            "http://localhost:5173",
          credentials: true,
        },
      }
    );

    registerCommunitySocket(io);

    httpServer.listen(
      env.PORT,
      () => {
        console.log(
          `Server running on port ${env.PORT}`
        );

        console.log(
          "Community Socket.IO realtime layer initialized."
        );
      }
    );
  } catch (error) {
    console.error(
      "Server startup failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();