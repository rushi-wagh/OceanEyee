import { create } from "zustand";
import {
  closeReport as closeReportApi,
  createReport as createReportApi,
  getCitizenReports as getCitizenReportsApi,
  getCommunityReports as getCommunityReportsApi,
  getReport as getReportApi,
  getReports as getReportsApi,
  rejectReport as rejectReportApi,
  resolveReport as resolveReportApi,
  uploadReportImages as uploadReportImagesApi,
  verifyReport as verifyReportApi,
} from "@/api/report.api";

const normalizeReport = (payload) => {
  if (!payload) {
    return null;
  }

  if (payload.data?.report) {
    return payload.data.report;
  }

  if (payload.data?.data?.report) {
    return payload.data.data.report;
  }

  if (payload.report) {
    return payload.report;
  }

  if (payload.data && !Array.isArray(payload.data) && payload.data.id) {
    return payload.data;
  }

  return payload;
};

const normalizeList = (payload) => {
  if (Array.isArray(payload?.data?.reports)) {
    return payload.data.reports;
  }

  if (Array.isArray(payload?.reports)) {
    return payload.reports;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  return [];
};

const replaceReportInList = (items, nextReport) => {
  if (!nextReport?.id) {
    return items;
  }

  const nextItems = [...items];
  const index = nextItems.findIndex((item) => item.id === nextReport.id);

  if (index === -1) {
    return [nextReport, ...nextItems];
  }

  nextItems[index] = { ...nextItems[index], ...nextReport };
  return nextItems;
};

const useReportStore = create((set, get) => ({
  reports: [],
  citizenReports: [],
  communityReports: [],
  selectedReport: null,
  isLoadingReports: false,
  isLoadingCitizenReports: false,
  isLoadingCommunityReports: false,
  isLoadingReport: false,
  error: null,
  citizenError: null,
  communityError: null,
  reportError: null,

  setSelectedReport: (report) => set({ selectedReport: report }),

  upsertReport: (report) => {
    const nextReport = normalizeReport(report);

    if (!nextReport) {
      return;
    }

    set((state) => ({
      reports: replaceReportInList(state.reports, nextReport),
      citizenReports: replaceReportInList(state.citizenReports, nextReport),
      communityReports: replaceReportInList(state.communityReports, nextReport),
      selectedReport:
        state.selectedReport && state.selectedReport.id === nextReport.id
          ? { ...state.selectedReport, ...nextReport }
          : state.selectedReport,
    }));
  },

  fetchReports: async (params = {}) => {
    set({ isLoadingReports: true, error: null });

    try {
      const response = await getReportsApi(params);
      const nextReports = normalizeList(response);

      set({
        reports: nextReports,
        isLoadingReports: false,
        error: null,
      });

      return nextReports;
    } catch (error) {
      set({
        isLoadingReports: false,
        error: error?.message || "Unable to load reports.",
      });

      throw error;
    }
  },

  fetchCitizenReports: async (params = {}) => {
    set({ isLoadingCitizenReports: true, citizenError: null });

    try {
      const response = await getCitizenReportsApi(params);
      const nextReports = normalizeList(response);

      set({
        citizenReports: nextReports,
        isLoadingCitizenReports: false,
        citizenError: null,
      });

      return nextReports;
    } catch (error) {
      set({
        isLoadingCitizenReports: false,
        citizenError: error?.message || "Unable to load your reports.",
      });

      throw error;
    }
  },

  fetchCommunityReports: async () => {
    set({ isLoadingCommunityReports: true, communityError: null });

    try {
      const response = await getCommunityReportsApi();
      const nextReports = normalizeList(response);

      set({
        communityReports: nextReports,
        isLoadingCommunityReports: false,
        communityError: null,
      });

      return nextReports;
    } catch (error) {
      set({
        isLoadingCommunityReports: false,
        communityError: error?.message || "Unable to load community reports.",
      });

      throw error;
    }
  },

  fetchReport: async (reportId, params = {}) => {
    set({ isLoadingReport: true, reportError: null });

    try {
      const response = await getReportApi(reportId, params);
      const nextReport = normalizeReport(response);

      set({
        selectedReport: nextReport,
        isLoadingReport: false,
        reportError: null,
      });

      get().upsertReport(nextReport);
      return nextReport;
    } catch (error) {
      set({
        isLoadingReport: false,
        reportError: error?.message || "Unable to load this report.",
      });

      throw error;
    }
  },

  fetchCommunityReport: async (reportId) => {
    return get().fetchReport(reportId, { scope: "public" });
  },

  createReport: async (values) => {
    const { images, ...payload } = values;

    const response = await createReportApi(payload);
    const createdReport = normalizeReport(response);

    if (!createdReport?.id) {
      throw new Error("The server created the report but did not return a report ID.");
    }

    if (images?.length) {
      try {
        await uploadReportImagesApi(createdReport.id, images);
      } catch (error) {
        return {
          report: createdReport,
          imagesUploaded: false,
          imageUploadError: error?.message || "Some images could not be uploaded.",
        };
      }
    }

    const refreshedReport = await getReportApi(createdReport.id);
    const nextReport = normalizeReport(refreshedReport);

    get().upsertReport(nextReport || createdReport);
    set({ selectedReport: nextReport || createdReport });

    return {
      report: nextReport || createdReport,
      imagesUploaded: true,
    };
  },

  submitAuthorityAction: async (reportId, action, remarks) => {
    const actionMap = {
      verify: verifyReportApi,
      reject: rejectReportApi,
      resolve: resolveReportApi,
      close: closeReportApi,
    };

    const apiAction = actionMap[action];

    if (!apiAction) {
      throw new Error("Unsupported authority action.");
    }

    const response = await apiAction(reportId, remarks);
    const nextReport = normalizeReport(response);

    get().upsertReport(nextReport);
    set({ selectedReport: nextReport ?? get().selectedReport });

    return response;
  },

  verifyReport: async (reportId, remarks) => get().submitAuthorityAction(reportId, "verify", remarks),
  rejectReport: async (reportId, remarks) => get().submitAuthorityAction(reportId, "reject", remarks),
  resolveReport: async (reportId, remarks) => get().submitAuthorityAction(reportId, "resolve", remarks),
  closeReport: async (reportId, remarks) => get().submitAuthorityAction(reportId, "close", remarks),

  uploadReportImages: async (reportId, files) => {
    const response = await uploadReportImagesApi(reportId, files);
    const refreshedReport = await getReportApi(reportId);
    const nextReport = normalizeReport(refreshedReport);

    get().upsertReport(nextReport || response);
    set({ selectedReport: nextReport || get().selectedReport });

    return response;
  },
}));

export { useReportStore };
