import Match from "../models/Match.js";
import Notification from "../models/Notification.js";
import Opportunity from "../models/Opportunity.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { logAdminAction } from "../services/admin-log.service.js";
import {
  getAdminLogsData,
  getAdminOpportunitiesData,
  getAdminOverviewData,
  getAdminReportData,
  getAdminUsersData,
  parseAdminRange,
} from "../services/admin.service.js";
import { buildCsvReport, buildPdfReport } from "../utils/reportExport.js";

const ALLOWED_USER_STATUSES = ["active", "suspended"];
const ALLOWED_REPORT_FORMATS = ["json", "csv", "pdf"];

export const getAdminOverviewController = async (req, res, next) => {
  try {
    const data = await getAdminOverviewData();
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
};

export const getAdminUsersController = async (req, res, next) => {
  try {
    const data = await getAdminUsersData(req.query);
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
};

export const updateAdminUserStatusController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ALLOWED_USER_STATUSES.includes(status)) {
      throw new AppError("status must be active or suspended", 400);
    }

    if (id === req.user.id && status === "suspended") {
      throw new AppError("You cannot suspend your own admin account", 400);
    }

    const user = await User.findById(id).select("-password -verificationToken");
    if (!user) {
      throw new AppError("User not found", 404);
    }

    user.status = status;
    user.updatedAt = Date.now();
    await user.save();

    await logAdminAction({
      action: `user_${status}`,
      adminId: req.user.id,
      targetUserId: user._id,
      metadata: {
        userEmail: user.email,
        userRole: user.role,
      },
    });

    return res.status(200).json({
      message: `User ${status} successfully`,
      user,
    });
  } catch (error) {
    return next(error);
  }
};

export const getAdminOpportunitiesController = async (req, res, next) => {
  try {
    const data = await getAdminOpportunitiesData(req.query);
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
};

export const deleteAdminOpportunityController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const opportunity = await Opportunity.findById(id).populate("ngo_id", "name email");

    if (!opportunity) {
      throw new AppError("Opportunity not found", 404);
    }

    await Promise.all([
      Opportunity.deleteOne({ _id: id }),
      Match.deleteMany({ opportunity_id: id }),
      Notification.deleteMany({ "metadata.opportunityId": id }),
    ]);

    await logAdminAction({
      action: "opportunity_deleted",
      adminId: req.user.id,
      targetOpportunityId: opportunity._id,
      metadata: {
        title: opportunity.title,
        ngoName: opportunity.ngo_id?.name || "",
        ngoEmail: opportunity.ngo_id?.email || "",
      },
    });

    return res.status(200).json({
      message: "Opportunity removed successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const getAdminReportsController = async (req, res, next) => {
  try {
    const format = req.query.format || "json";
    if (!ALLOWED_REPORT_FORMATS.includes(format)) {
      throw new AppError("format must be json, csv, or pdf", 400);
    }

    const { start, end } = parseAdminRange(req.query);
    const report = await getAdminReportData({ start, end });

    if (format === "csv") {
      const csv = buildCsvReport(report);
      await logAdminAction({
        action: "report_exported_csv",
        adminId: req.user.id,
        metadata: report.range,
      });
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", 'attachment; filename="wastezero-report.csv"');
      return res.status(200).send(csv);
    }

    if (format === "pdf") {
      const pdf = buildPdfReport(report);
      await logAdminAction({
        action: "report_exported_pdf",
        adminId: req.user.id,
        metadata: report.range,
      });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="wastezero-report.pdf"');
      return res.status(200).send(pdf);
    }

    return res.status(200).json(report);
  } catch (error) {
    return next(error);
  }
};

export const getAdminLogsController = async (req, res, next) => {
  try {
    const data = await getAdminLogsData(req.query);
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
};
