import { io } from "socket.io-client";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  API_URL.replace(
    /\/api\/?$/,
    ""
  );

export const createCommunitySocket =
  (token) => {
    if (!token) {
      throw new Error(
        "CampusX authentication token is required."
      );
    }

    return io(
      SOCKET_URL,
      {
        auth: {
          token,
        },

        transports: [
          "websocket",
        ],

        autoConnect: true,
      }
    );
  };