import { api } from "@/api/axios";

const getUsers = async (params = {}) => {
  const response = await api.get("/api/users", { params });
  return response.data;
};

const updateUserRole = async (userId, role) => {
  const response = await api.patch(`/api/users/${userId}/role`, { role });
  return response.data;
};

export { getUsers, updateUserRole };
