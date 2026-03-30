import express from "express";
import {
  deleteAdminOpportunityController,
  getAdminLogsController,
  getAdminOpportunitiesController,
  getAdminOverviewController,
  getAdminReportsController,
  getAdminUsersController,
  updateAdminUserStatusController,
} from "../controllers/admin.controller.js";
import { adminActionRateLimit } from "../middleware/admin.middleware.js";
import { authenticateToken, authorizeRoles } from "../middleware/user.middleware.js";

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles("admin"));

router.get("/overview", getAdminOverviewController);
router.get("/users", getAdminUsersController);
router.patch(
  "/users/:id/status",
  adminActionRateLimit({ max: 25, windowMs: 60_000 }),
  updateAdminUserStatusController,
);
router.get("/opportunities", getAdminOpportunitiesController);
router.delete(
  "/opportunities/:id",
  adminActionRateLimit({ max: 20, windowMs: 60_000 }),
  deleteAdminOpportunityController,
);
router.get(
  "/reports",
  adminActionRateLimit({ max: 30, windowMs: 60_000 }),
  getAdminReportsController,
);
router.get("/logs", getAdminLogsController);

export default router;
