import {
    changeUserPassword,
    generateAccessToken,
    getUserProfile,
    loginUser,
    registerUser,
    updateUserProfile,
} from "../controllers/user.controller.js";

import { authenticateToken } from "../middleware/user.middleware.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

import express from "express";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/me", authenticateToken, getUserProfile);
router.put("/me", authenticateToken, updateUserProfile);
router.put("/me/password", authenticateToken, changeUserPassword);

router.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select("_id name email role status");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.status === "suspended") {
      return res
        .status(403)
        .json({ message: "Account suspended. Contact an administrator." });
    }

    const newAccessToken = generateAccessToken(user);
    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(401).json({ message: "Invalid refresh token", error });
  }
});

export default router;
