import AdminLog from "../models/AdminLog.js";
import Match from "../models/Match.js";
import Message from "../models/Message.js";
import Opportunity from "../models/Opportunity.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return parsed;
};

const normalizeDate = (value, fallback) => {
  if (!value) return new Date(fallback);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new AppError("Invalid date range supplied", 400);
  }
  return date;
};

export const parseAdminRange = ({ startDate, endDate }) => {
  const end = normalizeDate(endDate, Date.now());
  const start = normalizeDate(startDate, end.getTime() - 29 * 24 * 60 * 60 * 1000);

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  if (start > end) {
    throw new AppError("startDate must be before endDate", 400);
  }

  return { start, end };
};

const buildPagination = (page, pageSize, total) => ({
  count: total,
  page,
  pageSize,
  totalPages: Math.max(1, Math.ceil(total / pageSize)),
});

const buildRegex = (value) => new RegExp(value.trim(), "i");

const formatDayKey = (date) => date.toISOString().slice(0, 10);

const buildSeriesFromMap = (start, end, countMap) => {
  const cursor = new Date(start);
  const series = [];

  while (cursor <= end) {
    const key = formatDayKey(cursor);
    series.push({
      date: key,
      count: countMap.get(key) || 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return series;
};

const aggregateDailyCounts = async (Model, field, start, end, extraMatch = {}) => {
  const records = await Model.aggregate([
    {
      $match: {
        ...extraMatch,
        [field]: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: `$${field}` },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return new Map(records.map((item) => [item._id, item.count]));
};

export const getAdminOverviewData = async () => {
  const [
    totalUsers,
    activeNgos,
    activeVolunteers,
    totalOpportunities,
    recentUsers,
    recentOpportunities,
    recentLogs,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "NGO", status: "active" }),
    User.countDocuments({ role: "volunteer", status: "active" }),
    Opportunity.countDocuments(),
    User.find().sort({ createdAt: -1 }).limit(5).select("name role createdAt"),
    Opportunity.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title createdAt")
      .populate("ngo_id", "name"),
    AdminLog.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("admin_id", "name")
      .populate("target_user_id", "name")
      .populate("target_opportunity_id", "title"),
  ]);

  const recentActivity = [
    ...recentUsers.map((user) => ({
      id: `user-${user._id}`,
      type: "user_registered",
      title: `${user.name} joined WasteZero`,
      description: `New ${user.role} account created`,
      timestamp: user.createdAt,
    })),
    ...recentOpportunities.map((opportunity) => ({
      id: `opportunity-${opportunity._id}`,
      type: "opportunity_created",
      title: `${opportunity.title} was created`,
      description: `Posted by ${opportunity.ngo_id?.name || "an NGO"}`,
      timestamp: opportunity.createdAt,
    })),
    ...recentLogs.map((log) => ({
      id: `log-${log._id}`,
      type: "admin_action",
      title: `${log.admin_id?.name || "Admin"} performed ${log.action}`,
      description:
        log.target_user_id?.name ||
        log.target_opportunity_id?.title ||
        "Platform administration update",
      timestamp: log.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);

  return {
    counts: {
      totalUsers,
      activeNgos,
      activeVolunteers,
      totalOpportunities,
    },
    recentActivity,
  };
};

export const getAdminUsersData = async (query) => {
  const page = toPositiveInt(query.page, DEFAULT_PAGE);
  const pageSize = Math.min(
    toPositiveInt(query.pageSize, DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE,
  );
  const filters = {};

  if (query.role) {
    filters.role = query.role;
  }
  if (query.status) {
    filters.status = query.status;
  }
  if (query.search?.trim()) {
    const searchRegex = buildRegex(query.search);
    filters.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { location: searchRegex },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filters)
      .select("-password -verificationToken")
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    User.countDocuments(filters),
  ]);

  return {
    ...buildPagination(page, pageSize, total),
    users,
  };
};

export const getAdminOpportunitiesData = async (query) => {
  const page = toPositiveInt(query.page, DEFAULT_PAGE);
  const pageSize = Math.min(
    toPositiveInt(query.pageSize, DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE,
  );
  const filters = {};

  if (query.status) {
    filters.status = query.status;
  }
  if (query.location?.trim()) {
    filters.location = buildRegex(query.location);
  }

  const ngoNameQuery = query.ngo?.trim() || "";
  const searchQuery = query.search?.trim() || "";
  let ngoIdsForFilter = [];

  if (ngoNameQuery || searchQuery) {
    const ngoRegex = buildRegex(ngoNameQuery || searchQuery);
    ngoIdsForFilter = await User.find({
      role: "NGO",
      name: ngoRegex,
    }).distinct("_id");
  }

  if (ngoNameQuery) {
    filters.ngo_id = { $in: ngoIdsForFilter };
  }

  if (searchQuery) {
    const searchRegex = buildRegex(searchQuery);
    const searchConditions = [
      { title: searchRegex },
      { description: searchRegex },
      { location: searchRegex },
    ];

    if (ngoIdsForFilter.length > 0) {
      searchConditions.push({ ngo_id: { $in: ngoIdsForFilter } });
    }

    filters.$or = searchConditions;
  }

  const [opportunities, total] = await Promise.all([
    Opportunity.find(filters)
      .populate("ngo_id", "name email location status")
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    Opportunity.countDocuments(filters),
  ]);

  return {
    ...buildPagination(page, pageSize, total),
    opportunities,
  };
};

export const getAdminReportData = async ({ start, end }) => {
  const [userGrowthMap, opportunityGrowthMap] = await Promise.all([
    aggregateDailyCounts(User, "createdAt", start, end),
    aggregateDailyCounts(Opportunity, "createdAt", start, end),
  ]);

  const [newUsers, newVolunteers, newNgos, newAdmins, newOpportunities] =
    await Promise.all([
      User.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      User.countDocuments({
        role: "volunteer",
        createdAt: { $gte: start, $lte: end },
      }),
      User.countDocuments({
        role: "NGO",
        createdAt: { $gte: start, $lte: end },
      }),
      User.countDocuments({
        role: "admin",
        createdAt: { $gte: start, $lte: end },
      }),
      Opportunity.countDocuments({ createdAt: { $gte: start, $lte: end } }),
    ]);

  const [activeVolunteerCount, matchedVolunteerIds, conversationIds, totalMessages] =
    await Promise.all([
      User.countDocuments({ role: "volunteer", status: "active" }),
      Match.distinct("volunteer_id", {
        createdAt: { $gte: start, $lte: end },
      }),
      Message.distinct("conversation_id", {
        timestamp: { $gte: start, $lte: end },
      }),
      Message.countDocuments({
        timestamp: { $gte: start, $lte: end },
      }),
    ]);

  const matchedVolunteers = matchedVolunteerIds.length;
  const volunteerParticipationRate = activeVolunteerCount
    ? Number(((matchedVolunteers / activeVolunteerCount) * 100).toFixed(1))
    : 0;

  return {
    range: {
      startDate: formatDayKey(start),
      endDate: formatDayKey(end),
    },
    summary: {
      newUsers,
      newVolunteers,
      newNgos,
      newAdmins,
      newOpportunities,
      matchedVolunteers,
      conversationsStarted: conversationIds.length,
      totalMessages,
      volunteerParticipationRate,
    },
    userGrowth: buildSeriesFromMap(start, end, userGrowthMap),
    opportunityTrends: buildSeriesFromMap(start, end, opportunityGrowthMap),
    volunteerParticipation: [
      { label: "Matched volunteers", value: matchedVolunteers },
      { label: "Active volunteer base", value: activeVolunteerCount },
      { label: "Participation rate (%)", value: volunteerParticipationRate },
      { label: "Conversations started", value: conversationIds.length },
      { label: "Messages sent", value: totalMessages },
    ],
  };
};

export const getAdminLogsData = async (query) => {
  const page = toPositiveInt(query.page, DEFAULT_PAGE);
  const pageSize = Math.min(
    toPositiveInt(query.pageSize, DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE,
  );
  const filters = {};

  if (query.action?.trim()) {
    filters.action = buildRegex(query.action);
  }

  const [logs, total] = await Promise.all([
    AdminLog.find(filters)
      .populate("admin_id", "name email")
      .populate("target_user_id", "name email role status")
      .populate("target_opportunity_id", "title status")
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    AdminLog.countDocuments(filters),
  ]);

  return {
    ...buildPagination(page, pageSize, total),
    logs,
  };
};
