import { apiClient } from "./axiosClient";

export const messageApi = {
  async getConversations() {
    const response = await apiClient.get("/messages");
    return response.data;
  },

  async getHistory(userId, params = {}) {
    const response = await apiClient.get(`/messages/${userId}`, { params });
    return response.data;
  },

  async send(payload) {
    const response = await apiClient.post("/messages", payload);
    return response.data;
  },
};
