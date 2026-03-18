import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import {
  getConversationHistory,
  getConversationsForUser,
  sendMessage,
} from "../services/message.service.js";

export const sendMessageController = async (req, res, next) => {
  try {
    const senderId = req.user.id;
    const { receiver_id: receiverId, content } = req.body;

    const message = await sendMessage({
      senderId,
      receiverId,
      content,
    });

    return res.status(201).json(message);
  } catch (error) {
    return next(error);
  }
};

export const getMessageHistoryController = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const { userId } = req.params;
    const { limit, before } = req.query;

    if (!userId) {
      throw new AppError("Target user ID is required", 400);
    }

    const [messages, otherUser] = await Promise.all([
      getConversationHistory({
        currentUserId,
        otherUserId: userId,
        limit,
        before,
      }),
      User.findById(userId).select("_id name role location"),
    ]);

    return res.status(200).json({
      count: messages.length,
      otherUser,
      messages,
    });
  } catch (error) {
    return next(error);
  }
};

export const getConversationListController = async (req, res, next) => {
  try {
    const conversations = await getConversationsForUser(req.user.id);
    return res.status(200).json({
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    return next(error);
  }
};
