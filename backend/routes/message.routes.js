import express from "express";
import {
  getConversationListController,
  getMessageHistoryController,
  sendMessageController,
} from "../controllers/message.controller.js";
import { authenticateToken } from "../middleware/user.middleware.js";

const router = express.Router();

router.use(authenticateToken);
router.get("/", getConversationListController);
router.post("/", sendMessageController);
router.get("/:userId", getMessageHistoryController);

export default router;
