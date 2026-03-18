import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    volunteer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    ngo_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    opportunity_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Opportunity",
      required: true,
      index: true,
    },
    skill_overlap: {
      type: [String],
      default: [],
    },
    skill_score: {
      type: Number,
      default: 0,
      min: 0,
    },
    location_score: {
      type: Number,
      default: 0,
      min: 0,
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
    last_evaluated_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

matchSchema.index({ volunteer_id: 1, opportunity_id: 1 }, { unique: true });
matchSchema.index({ opportunity_id: 1, is_active: 1, score: -1 });

const Match = mongoose.model("Match", matchSchema);
export default Match;
