import { apiClient } from "./axiosClient";

export const userApi = {
  async getProfile() {
    const response = await apiClient.get("/me");
    return response.data;
  },

  async updateProfile(payload) {
    const response = await apiClient.put("/me", payload);
    return response.data;
  },

  async changePassword(payload) {
    const response = await apiClient.put("/me/password", payload);
    return response.data;
  },
};
