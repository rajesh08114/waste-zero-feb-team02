import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    target_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    target_opportunity_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Opportunity",
      default: null,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "admin_logs",
  },
);

adminLogSchema.index({ createdAt: -1 });

const AdminLog = mongoose.model("AdminLog", adminLogSchema);
export default AdminLog;
