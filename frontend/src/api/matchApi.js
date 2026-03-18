import { apiClient } from "./axiosClient";

export const matchApi = {
  async getVolunteerMatches() {
    const response = await apiClient.get("/matches");
    return response.data;
  },

  async getOpportunityMatches(opportunityId) {
    const response = await apiClient.get(`/matches/${opportunityId}`);
    return response.data;
  },
};
