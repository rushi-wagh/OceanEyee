import { api } from "@/api/axios";

const getDashboard = async () => {
  const response = await api.get("/api/dashboard");
  return response.data;
};

const getAuthorityDashboard = async () => {
  const response = await api.get("/api/dashboard");
  return response.data;
};

export { getAuthorityDashboard, getDashboard };
