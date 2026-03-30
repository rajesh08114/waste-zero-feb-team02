import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import { emitToUser } from "./socket.service.js";

const buildOpportunityNotificationFilter = (opportunityId) => {
  const normalizedOpportunityId = String(opportunityId);
  const filters = [{ "metadata.opportunityId": normalizedOpportunityId }];

  if (mongoose.Types.ObjectId.isValid(normalizedOpportunityId)) {
    filters.push({
      "metadata.opportunityId": new mongoose.Types.ObjectId(normalizedOpportunityId),
    });
  }

  return filters.length === 1 ? filters[0] : { $or: filters };
};

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

export const deleteNotificationsForOpportunity = async (opportunityId) =>
  Notification.deleteMany(buildOpportunityNotificationFilter(opportunityId));
