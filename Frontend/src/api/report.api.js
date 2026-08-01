import { api } from "@/api/axios";

const createReport = async (data) => {
  const response = await api.post("/api/reports", data);
  return response.data;
};

const getCitizenReports = async () => {
  const response = await api.get("/api/reports");
  return response.data;
};

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

export { createReport, getCitizenReports, uploadReportImages };