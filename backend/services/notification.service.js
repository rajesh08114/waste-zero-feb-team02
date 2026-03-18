import Notification from "../models/Notification.js";
import { emitToUser } from "./socket.service.js";

export const createNotification = async ({
  userId,
  type,
  title,
  message,
  metadata = {},
}) => {
  const notification = await Notification.create({
    user_id: userId,
    type,
    title,
    message,
    metadata,
  });

  const payload = {
    _id: notification._id,
    user_id: notification.user_id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    metadata: notification.metadata,
    is_read: notification.is_read,
    createdAt: notification.createdAt,
  };

  emitToUser(userId, "newNotification", payload);
  emitToUser(userId, notification.type, payload);

  return notification;
};

export const serializeNotification = (notification) => ({
  _id: notification._id,
  user_id: notification.user_id,
  type: notification.type,
  title: notification.title,
  message: notification.message,
  metadata: notification.metadata,
  is_read: notification.is_read,
  createdAt: notification.createdAt,
  updatedAt: notification.updatedAt,
});
