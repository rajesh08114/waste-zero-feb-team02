import { apiClient } from "./axiosClient";

export const opportunityApi = {
  async getMine() {
    const response = await apiClient.get("/opportunities/mine");
    return response.data;
  },

  async getAll(params = {}) {
    const response = await apiClient.get("/opportunities", { params });
    return response.data;
  },

  async getById(id) {
    const response = await apiClient.get(`/opportunities/${id}`);
    return response.data;
  },

  async create(payload) {
    const response = await apiClient.post("/opportunities", payload);
    return response.data;
  },

  async update(id, payload) {
    const response = await apiClient.put(`/opportunities/${id}`, payload);
    return response.data;
  },

  async remove(id) {
    const response = await apiClient.delete(`/opportunities/${id}`);
    return response.data;
  },
};
