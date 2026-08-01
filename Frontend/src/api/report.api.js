import { api } from "@/api/axios";

const createReport = async (data) => {
  const response = await api.post("/api/reports", data);
  return response.data;
};

const getReport = async (reportId) => {
  const response = await api.get(`/api/reports/${reportId}`);
  return response.data;
};

const getCitizenReports = async () => {
  const response = await api.get("/api/reports");
  return response.data;
};

const getReports = async () => {
  const response = await api.get("/api/reports");
  return response.data;
};

const submitAuthorityAction = async (reportId, action, remarks) => {
  const response = await api.post(`/api/reports/${reportId}/actions/${action}`, {
    remarks,
  });

  return response.data;
};

const verifyReport = async (reportId, remarks) => submitAuthorityAction(reportId, "verify", remarks);
const rejectReport = async (reportId, remarks) => submitAuthorityAction(reportId, "reject", remarks);
const resolveReport = async (reportId, remarks) => submitAuthorityAction(reportId, "resolve", remarks);
const closeReport = async (reportId, remarks) => submitAuthorityAction(reportId, "close", remarks);

const uploadReportImages = async (reportId, files) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("images", file);
  });

  const response = await api.post(`/api/reports/${reportId}/images`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export {
  closeReport,
  createReport,
  getCitizenReports,
  getReport,
  getReports,
  rejectReport,
  resolveReport,
  uploadReportImages,
  verifyReport,
};