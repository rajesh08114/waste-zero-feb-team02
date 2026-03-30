import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";
import User, { getEffectiveUserStatus } from "../models/User.js";

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next(new AppError("Access token is missing", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select(
      "_id name email role status emailVerified",
    );

    if (!user) {
      return next(new AppError("User not found", 401));
    }

    if (user.status === "suspended") {
      return next(new AppError("Account suspended. Contact an administrator.", 403));
    }

    req.user = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      status: getEffectiveUserStatus(user),
      emailVerified: user.emailVerified,
    };
    return next();
  } catch {
    return next(new AppError("Invalid access token", 401));
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError(
          "Forbidden: You don't have permission to access this resource",
          403,
        ),
      );
    }

    return next();
  };
};
