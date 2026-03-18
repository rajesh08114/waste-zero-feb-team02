import jwt from "jsonwebtoken";
import { Server } from "socket.io";

let ioInstance = null;
const onlineUsers = new Map();

export const getUserRoom = (userId) => `user:${String(userId)}`;

const extractToken = (socket) => {
  const authToken = socket.handshake?.auth?.token;
  if (authToken) return authToken;

  const authorization = socket.handshake?.headers?.authorization;
  if (!authorization) return null;

  if (authorization.startsWith("Bearer ")) {
    return authorization.slice(7);
  }

  return authorization;
};

const onConnect = (socket) => {
  const userId = socket.user.id;
  const room = getUserRoom(userId);
  socket.join(room);

  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId).add(socket.id);

  socket.emit("socket:ready", {
    userId,
    connectedAt: new Date().toISOString(),
  });

  socket.on("disconnect", () => {
    const userSockets = onlineUsers.get(userId);
    if (!userSockets) return;

    userSockets.delete(socket.id);
    if (userSockets.size === 0) {
      onlineUsers.delete(userId);
    }
  });
};

export const initSocket = (httpServer, allowedOrigins = []) => {
  if (ioInstance) return ioInstance;

  ioInstance = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  ioInstance.use((socket, next) => {
    const token = extractToken(socket);
    if (!token) {
      next(new Error("Socket auth token missing"));
      return;
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = {
        id: payload.id,
        role: payload.role,
        email: payload.email,
        name: payload.name,
      };
      next();
    } catch {
      next(new Error("Socket auth token invalid"));
    }
  });

  ioInstance.on("connection", onConnect);
  return ioInstance;
};

export const getIO = () => ioInstance;

export const emitToUser = (userId, eventName, payload) => {
  if (!ioInstance) return;
  ioInstance.to(getUserRoom(userId)).emit(eventName, payload);
};

export const emitToUsers = (userIds, eventName, payload) => {
  if (!ioInstance) return;

  userIds.forEach((userId) => {
    ioInstance.to(getUserRoom(userId)).emit(eventName, payload);
  });
};

export const isUserOnline = (userId) => onlineUsers.has(String(userId));
