import mongoose from "mongoose";
import { WASTE_SKILL_OPTIONS } from "../constants/wasteSkills.js";

const USER_ROLES = ["volunteer", "NGO", "admin"];
const USER_STATUSES = ["active", "suspended"];
const ACTIVE_USER_STATUS_QUERY = [
  { status: "active" },
  { status: { $exists: false } },
  { status: null },
];

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: USER_ROLES, required: true },
  status: {
    type: String,
    enum: USER_STATUSES,
    default: "active",
    index: true,
  },
  skills: [{ type: String, enum: WASTE_SKILL_OPTIONS }],
  location: { type: String, trim: true },
  bio: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.index({ role: 1, status: 1 });

export const buildActiveUserQuery = (query = {}) => ({
  ...query,
  $or: ACTIVE_USER_STATUS_QUERY,
});

export const getEffectiveUserStatus = (userOrStatus) => {
  const status =
    typeof userOrStatus === "string" ? userOrStatus : userOrStatus?.status;

  return status === "suspended" ? "suspended" : "active";
};

export const isUserActive = (userOrStatus) =>
  getEffectiveUserStatus(userOrStatus) === "active";

export { USER_ROLES, USER_STATUSES };

const User = mongoose.model("User", userSchema);
export default User;

