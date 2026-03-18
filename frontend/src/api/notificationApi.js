import { apiClient } from "./axiosClient";

export const notificationApi = {
  async getAll(params = {}) {
    const response = await apiClient.get("/notifications", { params });
    return response.data;
  },

  async markRead(id) {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllRead() {
    const response = await apiClient.patch("/notifications/read-all");
    return response.data;
  },
};
