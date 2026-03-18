import express from "express";
import {
  getMatchesForOpportunity,
  getMatchesForVolunteer,
} from "../controllers/match.controller.js";
import { authenticateToken, authorizeRoles } from "../middleware/user.middleware.js";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorizeRoles("volunteer"),
  getMatchesForVolunteer,
);

router.get(
  "/:opportunityId",
  authenticateToken,
  authorizeRoles("NGO"),
  getMatchesForOpportunity,
);

export default router;
