import express from "express";
import {
  createOpportunity,
  deleteOpportunity,
  getAllOpportunities,
  getMyOpportunities,
  getOpportunityById,
  updateOpportunity,
} from "../controllers/opportunity.controller.js";
import { authenticateToken, authorizeRoles } from "../middleware/user.middleware.js";

const router = express.Router();

router.post("/", authenticateToken, authorizeRoles("NGO"), createOpportunity);
router.get("/mine", authenticateToken, authorizeRoles("NGO"), getMyOpportunities);
router.get("/", getAllOpportunities);
router.get("/:id", getOpportunityById);
router.put("/:id", authenticateToken, authorizeRoles("NGO"), updateOpportunity);
router.delete("/:id", authenticateToken, authorizeRoles("NGO"), deleteOpportunity);

export default router;
