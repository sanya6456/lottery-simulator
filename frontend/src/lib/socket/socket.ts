import { io } from "socket.io-client";

const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
const socketServer = apiUrl?.startsWith("http") ? apiUrl : "";

export const socket = io(socketServer, {
  autoConnect: false,
});
