// src/lib/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const createSocket = (serverUrl: string, authToken?: string) => {
  if (socket) return socket;

  socket = io(serverUrl, {
    transports: ["websocket"],
    auth: {
      token: authToken ?? null, // expressed below for JWT/sanctum
    },
    autoConnect: true,
    reconnectionAttempts: 5,
  });

  return socket;
};

export const getSocket = () => socket;
export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
