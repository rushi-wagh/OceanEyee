import { api } from "@/api/axios";

const getDashboard = async () => {
  const response = await api.get("/api/dashboard");
  return response.data;
};

const getAuthorityDashboard = async () => {
  const response = await api.get("/api/dashboard");
  return response.data;
};

// Admin dashboard uses the same unified endpoint — the backend
// role-dispatches to getAdminDashboard() when the caller is ADMIN.
const getAdminDashboard = async () => {
  const response = await api.get("/api/dashboard");
  return response.data;
};

export { getAdminDashboard, getAuthorityDashboard, getDashboard };
