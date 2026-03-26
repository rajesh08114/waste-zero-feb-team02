import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import User from "../models/User.js";

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

  ioInstance.use(async (socket, next) => {
    const token = extractToken(socket);
    if (!token) {
      next(new Error("Socket auth token missing"));
      return;
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.id).select(
        "_id name email role status",
      );

      if (!user || user.status === "suspended") {
        next(new Error("Socket user unavailable"));
        return;
      }

      socket.user = {
        id: String(user._id),
        role: user.role,
        email: user.email,
        name: user.name,
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
