import AdminLog from "../models/AdminLog.js";

export const logAdminAction = async ({
  action,
  adminId,
  targetUserId = null,
  targetOpportunityId = null,
  metadata = {},
}) => {
  return AdminLog.create({
    action,
    admin_id: adminId,
    target_user_id: targetUserId,
    target_opportunity_id: targetOpportunityId,
    metadata,
  });
};
