import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  conversation_id: {
    type: String,
    required: true,
    index: true,
  },
});

messageSchema.index({ sender_id: 1, receiver_id: 1, timestamp: -1 });
messageSchema.index({ conversation_id: 1, timestamp: -1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
