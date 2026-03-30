import AppError from "../utils/AppError.js";

const actionWindowMap = new Map();

export const adminActionRateLimit = ({ windowMs = 60_000, max = 20 } = {}) => {
  return (req, res, next) => {
    if (!req.user?.id || req.user.role !== "admin") {
      return next();
    }

    const key = String(req.user.id);
    const now = Date.now();
    const hits = (actionWindowMap.get(key) || []).filter(
      (timestamp) => now - timestamp < windowMs,
    );

    if (hits.length >= max) {
      return next(
        new AppError("Too many admin actions in a short time. Please slow down.", 429),
      );
    }

    hits.push(now);
    actionWindowMap.set(key, hits);
    return next();
  };
};
