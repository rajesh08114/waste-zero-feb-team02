import mongoose from "mongoose";
import Match from "../models/Match.js";
import Opportunity from "../models/Opportunity.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { createNotification } from "./notification.service.js";

const SKILL_WEIGHT = 70;
const LOCATION_WEIGHT = 30;
const MIN_MATCH_SCORE = 40;

const normalize = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const normalizeSkills = (skills) =>
  Array.isArray(skills)
    ? skills.map((skill) => normalize(skill)).filter(Boolean)
    : [];

const getLocationScore = (userLocation, opportunityLocation) => {
  const userLoc = normalize(userLocation);
  const oppLoc = normalize(opportunityLocation);

  if (!userLoc || !oppLoc) return 0;
  if (userLoc === oppLoc) return LOCATION_WEIGHT;
  if (userLoc.includes(oppLoc) || oppLoc.includes(userLoc)) return 15;
  return 0;
};

const computeMatchScore = (volunteer, opportunity) => {
  const volunteerSkills = new Set(normalizeSkills(volunteer.skills));
  const requiredSkillPairs = Array.isArray(opportunity.required_skills)
    ? opportunity.required_skills
        .map((skill) => ({
          original: typeof skill === "string" ? skill.trim() : "",
          normalized: normalize(skill),
        }))
        .filter((item) => item.original && item.normalized)
    : [];

  if (requiredSkillPairs.length === 0 || volunteerSkills.size === 0) {
    return {
      skillOverlap: [],
      skillScore: 0,
      locationScore: getLocationScore(volunteer.location, opportunity.location),
      score: 0,
      isEligible: false,
    };
  }

  const skillOverlap = requiredSkillPairs
    .filter((item) => volunteerSkills.has(item.normalized))
    .map((item) => item.original);
  const skillRatio = skillOverlap.length / requiredSkillPairs.length;
  const skillScore = Math.round(skillRatio * SKILL_WEIGHT);
  const locationScore = getLocationScore(volunteer.location, opportunity.location);
  const score = skillScore + locationScore;
  const isEligible = skillOverlap.length > 0 && score >= MIN_MATCH_SCORE;

  return {
    skillOverlap,
    skillScore,
    locationScore,
    score,
    isEligible,
  };
};

const ensureIdsAreValid = (...ids) => {
  ids.forEach((id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid ID", 400);
    }
  });
};

const upsertMatchForOpportunity = async ({ volunteer, opportunity, existingMatch }) => {
  const { skillOverlap, skillScore, locationScore, score, isEligible } =
    computeMatchScore(volunteer, opportunity);

  if (!isEligible) {
    if (existingMatch?.is_active) {
      existingMatch.is_active = false;
      existingMatch.last_evaluated_at = new Date();
      existingMatch.score = score;
      existingMatch.skill_score = skillScore;
      existingMatch.location_score = locationScore;
      existingMatch.skill_overlap = skillOverlap;
      await existingMatch.save();
    }
    return null;
  }

  const matchPayload = {
    volunteer_id: volunteer._id,
    ngo_id: opportunity.ngo_id,
    opportunity_id: opportunity._id,
    skill_overlap: skillOverlap,
    skill_score: skillScore,
    location_score: locationScore,
    score,
    is_active: true,
    last_evaluated_at: new Date(),
  };

  const wasInactive = existingMatch && !existingMatch.is_active;
  const wasMissing = !existingMatch;

  const match = await Match.findOneAndUpdate(
    { volunteer_id: volunteer._id, opportunity_id: opportunity._id },
    matchPayload,
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  if (wasMissing || wasInactive) {
    await createNotification({
      userId: volunteer._id,
      type: "newMatch",
      title: "New opportunity match",
      message: `${opportunity.title} matched your profile`,
      metadata: {
        opportunityId: opportunity._id,
        ngoId: opportunity.ngo_id,
        score,
      },
    });

    await createNotification({
      userId: opportunity.ngo_id,
      type: "newMatch",
      title: "New volunteer match",
      message: `${volunteer.name} matches ${opportunity.title}`,
      metadata: {
        opportunityId: opportunity._id,
        volunteerId: volunteer._id,
        score,
      },
    });
  }

  return match;
};

export const syncVolunteerMatches = async (volunteerId) => {
  ensureIdsAreValid(volunteerId);

  const volunteer = await User.findById(volunteerId);
  if (!volunteer) {
    throw new AppError("Volunteer not found", 404);
  }
  if (volunteer.role !== "volunteer") {
    throw new AppError("Only volunteers can access this match view", 403);
  }

  const opportunities = await Opportunity.find({ status: "open" });
  const existingMatches = await Match.find({ volunteer_id: volunteer._id });
  const existingByOpportunity = new Map(
    existingMatches.map((match) => [String(match.opportunity_id), match]),
  );

  await Promise.all(
    opportunities.map((opportunity) =>
      upsertMatchForOpportunity({
        volunteer,
        opportunity,
        existingMatch: existingByOpportunity.get(String(opportunity._id)),
      }),
    ),
  );
};

export const getVolunteerMatches = async (volunteerId) => {
  await syncVolunteerMatches(volunteerId);

  const matches = await Match.find({
    volunteer_id: volunteerId,
    is_active: true,
  })
    .sort({ score: -1, updatedAt: -1 })
    .populate("opportunity_id", "title description location required_skills status ngo_id")
    .populate("ngo_id", "name location");

  return matches
    .filter((match) => match.opportunity_id)
    .map((match) => ({
      _id: match._id,
      score: match.score,
      skill_score: match.skill_score,
      location_score: match.location_score,
      skill_overlap: match.skill_overlap,
      opportunity: {
        _id: match.opportunity_id._id,
        title: match.opportunity_id.title,
        description: match.opportunity_id.description,
        location: match.opportunity_id.location,
        required_skills: match.opportunity_id.required_skills,
        status: match.opportunity_id.status,
      },
      ngo: match.ngo_id
        ? {
            _id: match.ngo_id._id,
            name: match.ngo_id.name,
            location: match.ngo_id.location,
          }
        : null,
    }));
};

export const syncOpportunityMatches = async (opportunityId) => {
  ensureIdsAreValid(opportunityId);

  const opportunity = await Opportunity.findById(opportunityId);
  if (!opportunity) {
    throw new AppError("Opportunity not found", 404);
  }

  const volunteers = await User.find({ role: "volunteer" });
  const existingMatches = await Match.find({ opportunity_id: opportunity._id });
  const existingByVolunteer = new Map(
    existingMatches.map((match) => [String(match.volunteer_id), match]),
  );

  await Promise.all(
    volunteers.map((volunteer) =>
      upsertMatchForOpportunity({
        volunteer,
        opportunity,
        existingMatch: existingByVolunteer.get(String(volunteer._id)),
      }),
    ),
  );
};

export const getOpportunityMatchesForNgo = async (opportunityId, ngoId) => {
  ensureIdsAreValid(opportunityId, ngoId);

  const opportunity = await Opportunity.findById(opportunityId);
  if (!opportunity) {
    throw new AppError("Opportunity not found", 404);
  }

  if (String(opportunity.ngo_id) !== String(ngoId)) {
    throw new AppError("Forbidden: You can view matches only for your opportunities", 403);
  }

  await syncOpportunityMatches(opportunityId);

  const matches = await Match.find({
    opportunity_id: opportunityId,
    ngo_id: ngoId,
    is_active: true,
  })
    .sort({ score: -1, updatedAt: -1 })
    .populate("volunteer_id", "name location skills");

  const volunteers = matches
    .filter((match) => match.volunteer_id)
    .map((match) => ({
      _id: match.volunteer_id._id,
      name: match.volunteer_id.name,
      location: match.volunteer_id.location,
      skills: match.volunteer_id.skills || [],
      score: match.score,
      skill_overlap: match.skill_overlap,
      location_score: match.location_score,
    }));

  return {
    opportunity: {
      _id: opportunity._id,
      title: opportunity.title,
      location: opportunity.location,
      required_skills: opportunity.required_skills,
      status: opportunity.status,
    },
    volunteers,
  };
};

export const validateMatchedPair = async (senderId, receiverId) => {
  ensureIdsAreValid(senderId, receiverId);

  if (String(senderId) === String(receiverId)) {
    throw new AppError("You cannot send messages to yourself", 400);
  }

  const [sender, receiver] = await Promise.all([
    User.findById(senderId).select("_id role name"),
    User.findById(receiverId).select("_id role name"),
  ]);

  if (!sender || !receiver) {
    throw new AppError("Sender or receiver not found", 404);
  }

  if (sender.role === receiver.role) {
    throw new AppError("Messaging is only allowed between volunteer and NGO", 403);
  }

  const volunteerId = sender.role === "volunteer" ? sender._id : receiver._id;
  const ngoId = sender.role === "NGO" ? sender._id : receiver._id;

  const activeMatch = await Match.findOne({
    volunteer_id: volunteerId,
    ngo_id: ngoId,
    is_active: true,
  });

  if (!activeMatch) {
    throw new AppError("Messaging is allowed only between matched users", 403);
  }

  return { sender, receiver, volunteerId, ngoId, activeMatch };
};
