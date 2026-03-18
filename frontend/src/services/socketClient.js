import { io } from "socket.io-client";
import { getStoredAuth } from "../utils/storage";

let socket = null;

const normalizeBaseUrl = () => {
  const explicitUrl = import.meta.env.VITE_SOCKET_URL;
  if (explicitUrl) return explicitUrl;

  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

  return apiBaseUrl.replace(/\/api\/v\d+\/?$/, "");
};

export const connectSocket = (token) => {
  if (socket && socket.connected) return socket;

  const accessToken = token || getStoredAuth().accessToken;
  if (!accessToken) return null;

  socket = io(normalizeBaseUrl(), {
    transports: ["websocket"],
    autoConnect: true,
    auth: { token: accessToken },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 700,
    reconnectionDelayMax: 5000,
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
};
