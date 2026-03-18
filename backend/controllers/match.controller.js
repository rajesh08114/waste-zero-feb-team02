import {
  getOpportunityMatchesForNgo,
  getVolunteerMatches,
} from "../services/match.service.js";

export const getMatchesForVolunteer = async (req, res, next) => {
  try {
    const matches = await getVolunteerMatches(req.user.id);
    return res.status(200).json({
      count: matches.length,
      matches,
    });
  } catch (error) {
    return next(error);
  }
};

export const getMatchesForOpportunity = async (req, res, next) => {
  try {
    const { opportunityId } = req.params;
    const result = await getOpportunityMatchesForNgo(opportunityId, req.user.id);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};
