import { apiClient } from "./axiosClient";

export const authApi = {
  async register(payload) {
    const response = await apiClient.post("/register", payload);
    return response.data;
  },

  async login(payload) {
    const response = await apiClient.post("/login", payload);
    return response.data;
  },
};
