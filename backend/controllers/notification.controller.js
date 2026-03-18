import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import AppError from "../utils/AppError.js";
import { serializeNotification } from "../services/notification.service.js";

export const getNotificationsController = async (req, res, next) => {
  try {
    const limit = Math.max(1, Math.min(Number(req.query.limit) || 20, 100));
    const notifications = await Notification.find({ user_id: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit);

    const unreadCount = await Notification.countDocuments({
      user_id: req.user.id,
      is_read: false,
    });

    return res.status(200).json({
      count: notifications.length,
      unreadCount,
      notifications: notifications.map(serializeNotification),
    });
  } catch (error) {
    return next(error);
  }
};

export const markNotificationReadController = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid ID", 400);
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user_id: req.user.id },
      { is_read: true },
      { new: true },
    );

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    return res.status(200).json(serializeNotification(notification));
  } catch (error) {
    return next(error);
  }
};

export const markAllNotificationsReadController = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      { user_id: req.user.id, is_read: false },
      { is_read: true },
    );

    return res.status(200).json({
      message: "Notifications marked as read",
      modifiedCount: result.modifiedCount || 0,
    });
  } catch (error) {
    return next(error);
  }
};
