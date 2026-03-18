import mongoose from "mongoose";
import Message from "../models/Message.js";
import AppError from "../utils/AppError.js";
import { emitToUsers } from "./socket.service.js";
import { createNotification } from "./notification.service.js";
import { validateMatchedPair } from "./match.service.js";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_MESSAGES_PER_MINUTE = 30;
const messageRateMap = new Map();

const normalizeContent = (content) =>
  typeof content === "string" ? content.trim() : "";

const ensureValidObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid ID", 400);
  }
};

const checkRateLimit = (senderId) => {
  const now = Date.now();
  const senderKey = String(senderId);
  const recent = (messageRateMap.get(senderKey) || []).filter(
    (timestamp) => now - timestamp < 60_000,
  );

  if (recent.length >= MAX_MESSAGES_PER_MINUTE) {
    throw new AppError("Too many messages. Please slow down.", 429);
  }

  recent.push(now);
  messageRateMap.set(senderKey, recent);
};

export const createConversationId = (idA, idB) =>
  [String(idA), String(idB)].sort().join(":");

export const serializeMessage = (messageDoc) => ({
  _id: messageDoc._id,
  sender_id: messageDoc.sender_id?._id || messageDoc.sender_id,
  receiver_id: messageDoc.receiver_id?._id || messageDoc.receiver_id,
  sender_name: messageDoc.sender_id?.name,
  receiver_name: messageDoc.receiver_id?.name,
  content: messageDoc.content,
  timestamp: messageDoc.timestamp,
  conversation_id: messageDoc.conversation_id,
});

export const sendMessage = async ({ senderId, receiverId, content }) => {
  ensureValidObjectId(senderId);
  ensureValidObjectId(receiverId);

  const normalizedContent = normalizeContent(content);
  if (!normalizedContent) {
    throw new AppError("Message content is required", 400);
  }
  if (normalizedContent.length > MAX_MESSAGE_LENGTH) {
    throw new AppError(`Message must be under ${MAX_MESSAGE_LENGTH} characters`, 400);
  }

  checkRateLimit(senderId);

  const { sender, receiver } = await validateMatchedPair(senderId, receiverId);
  const conversationId = createConversationId(senderId, receiverId);

  const createdMessage = await Message.create({
    sender_id: sender._id,
    receiver_id: receiver._id,
    content: normalizedContent,
    conversation_id: conversationId,
  });

  const message = await Message.findById(createdMessage._id).populate(
    "sender_id receiver_id",
    "name role",
  );

  const payload = serializeMessage(message);
  emitToUsers([sender._id, receiver._id], "newMessage", payload);

  await createNotification({
    userId: receiver._id,
    type: "newMessage",
    title: `New message from ${sender.name}`,
    message:
      normalizedContent.length > 90
        ? `${normalizedContent.slice(0, 90)}...`
        : normalizedContent,
    metadata: {
      senderId: sender._id,
      conversationId,
      messageId: createdMessage._id,
    },
  });

  return payload;
};

export const getConversationHistory = async ({
  currentUserId,
  otherUserId,
  limit = 50,
  before,
}) => {
  ensureValidObjectId(currentUserId);
  ensureValidObjectId(otherUserId);

  await validateMatchedPair(currentUserId, otherUserId);

  const query = {
    conversation_id: createConversationId(currentUserId, otherUserId),
  };

  if (before) {
    query.timestamp = { $lt: new Date(before) };
  }

  const safeLimit = Math.max(1, Math.min(Number(limit) || 50, 100));

  const messages = await Message.find(query)
    .sort({ timestamp: -1 })
    .limit(safeLimit)
    .populate("sender_id receiver_id", "name role");

  return messages.reverse().map(serializeMessage);
};

export const getConversationsForUser = async (userId) => {
  ensureValidObjectId(userId);

  const recentMessages = await Message.find({
    $or: [{ sender_id: userId }, { receiver_id: userId }],
  })
    .sort({ timestamp: -1 })
    .populate("sender_id receiver_id", "name role location");

  const seen = new Set();
  const conversations = [];

  recentMessages.forEach((message) => {
    if (seen.has(message.conversation_id)) return;
    seen.add(message.conversation_id);

    const senderId = String(message.sender_id?._id || message.sender_id);
    const isCurrentSender = senderId === String(userId);
    const otherUser = isCurrentSender ? message.receiver_id : message.sender_id;

    conversations.push({
      conversation_id: message.conversation_id,
      other_user: otherUser
        ? {
            _id: otherUser._id,
            name: otherUser.name,
            role: otherUser.role,
            location: otherUser.location,
          }
        : null,
      latest_message: serializeMessage(message),
    });
  });

  return conversations;
};
