import { create } from "zustand";
import { getAdminDashboard, getAuthorityDashboard, getDashboard } from "@/api/dashboard.api";
import { getUsers, updateUserRole } from "@/api/user.api";

const normalizePayload = (payload) => payload?.data ?? payload ?? {};

const normalizeUsers = (payload) => {
  const normalized = normalizePayload(payload);

  if (Array.isArray(normalized.users)) {
    return normalized.users;
  }

  if (Array.isArray(normalized.data)) {
    return normalized.data;
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  return [];
};

const useDashboardStore = create((set, get) => ({
  citizenDashboard: {},
  authorityDashboard: {},
  adminDashboard: {},
  users: [],
  isLoadingCitizenDashboard: false,
  isLoadingAuthorityDashboard: false,
  isLoadingAdminDashboard: false,
  isLoadingUsers: false,
  error: null,

  fetchCitizenDashboard: async () => {
    set({ isLoadingCitizenDashboard: true, error: null });

    try {
      const response = await getDashboard();
      const nextDashboard = normalizePayload(response);

      set({
        citizenDashboard: nextDashboard,
        isLoadingCitizenDashboard: false,
        error: null,
      });

      return nextDashboard;
    } catch (error) {
      set({
        isLoadingCitizenDashboard: false,
        error: error?.message || "Unable to load dashboard data.",
      });

      throw error;
    }
  },

  fetchAuthorityDashboard: async () => {
    set({ isLoadingAuthorityDashboard: true, error: null });

    try {
      const response = await getAuthorityDashboard();
      const nextDashboard = normalizePayload(response);

      set({
        authorityDashboard: nextDashboard,
        isLoadingAuthorityDashboard: false,
        error: null,
      });

      return nextDashboard;
    } catch (error) {
      set({
        isLoadingAuthorityDashboard: false,
        error: error?.message || "Unable to load authority dashboard data.",
      });

      throw error;
    }
  },

  fetchAdminDashboard: async () => {
    set({ isLoadingAdminDashboard: true, error: null });

    try {
      const response = await getAdminDashboard();
      const nextDashboard = normalizePayload(response);

      set({
        adminDashboard: nextDashboard,
        isLoadingAdminDashboard: false,
        error: null,
      });

      return nextDashboard;
    } catch (error) {
      set({
        isLoadingAdminDashboard: false,
        error: error?.message || "Unable to load admin dashboard data.",
      });

      throw error;
    }
  },

  fetchUsers: async () => {
    set({ isLoadingUsers: true, error: null });

    try {
      const response = await getUsers();
      const nextUsers = normalizeUsers(response);

      set({
        users: nextUsers,
        isLoadingUsers: false,
        error: null,
      });

      return nextUsers;
    } catch (error) {
      set({
        isLoadingUsers: false,
        error: error?.message || "Unable to load users.",
      });

      throw error;
    }
  },

  updateUserRole: async (userId, role) => {
    await updateUserRole(userId, role);
    await Promise.all([get().fetchUsers(), get().fetchAdminDashboard()]);
    return true;
  },
}));

export { useDashboardStore };
