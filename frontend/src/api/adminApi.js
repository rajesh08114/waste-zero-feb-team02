import { apiClient } from "./axiosClient";

export const adminApi = {
  async getOverview() {
    const response = await apiClient.get("/admin/overview");
    return response.data;
  },

  async getUsers(params = {}) {
    const response = await apiClient.get("/admin/users", { params });
    return response.data;
  },

  async updateUserStatus(id, status) {
    const response = await apiClient.patch(`/admin/users/${id}/status`, { status });
    return response.data;
  },

  async getOpportunities(params = {}) {
    const response = await apiClient.get("/admin/opportunities", { params });
    return response.data;
  },

  async deleteOpportunity(id) {
    const response = await apiClient.delete(`/admin/opportunities/${id}`);
    return response.data;
  },

  async getReports(params = {}) {
    const response = await apiClient.get("/admin/reports", { params });
    return response.data;
  },

  async downloadReport(params = {}) {
    const response = await apiClient.get("/admin/reports", {
      params,
      responseType: "blob",
    });
    return response.data;
  },

  async getLogs(params = {}) {
    const response = await apiClient.get("/admin/logs", { params });
    return response.data;
  },
};
