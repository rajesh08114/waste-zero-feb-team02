import express from "express";
import {
  getNotificationsController,
  markAllNotificationsReadController,
  markNotificationReadController,
} from "../controllers/notification.controller.js";
import { authenticateToken } from "../middleware/user.middleware.js";

const router = express.Router();

router.use(authenticateToken);
router.get("/", getNotificationsController);
router.patch("/read-all", markAllNotificationsReadController);
router.patch("/:id/read", markNotificationReadController);

export default router;
