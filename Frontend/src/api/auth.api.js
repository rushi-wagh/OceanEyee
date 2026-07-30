import { api } from "@/api/axios";

const registerUser = async (data) => {
  const response = await api.post("/api/auth/register", data);
  return response.data;
};

const loginUser = async (data) => {
  const response = await api.post("/api/auth/login", data);
  return response.data;
};

const getCurrentUser = async () => {
  try {
    const response = await api.get("/api/auth/me");
    return response.data;
  } catch (error) {
    if (error.statusCode === 401) {
      return null;
    }
    throw error;
  }
};

const logoutUser = async () => {
  const response = await api.post("/api/auth/logout");
  return response.data;
};

export { getCurrentUser, loginUser, logoutUser, registerUser };
