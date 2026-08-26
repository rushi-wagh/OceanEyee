import { prisma } from "../utils/db.js";
import { ApiError } from "../utils/ApiError.js";

const reportInclude = {
  citizen: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  },
  currentAuthority: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  images: true,
  authorityActions: {
    include: {
      authority: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  },
};

const publicReportStatuses = ["VERIFIED", "RESOLVED"];

const publicReportSelect = {
  id: true,
  reportNumber: true,
  title: true,
  description: true,
  status: true,
  locationName: true,
  createdAt: true,
  updatedAt: true,
  images: {
    select: {
      id: true,
      url: true,
      createdAt: true,
    },
  },
};

const allowedStatuses = ["SUBMITTED", "PENDING_AUTHORITY", "VERIFIED", "REJECTED", "RESOLVED", "CLOSED"];

const generateReportNumber = () => {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const time = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000);

  return `OIQ-${date}-${time}-${random}`;
};

const getReportById = async (reportId) => {
  const report = await prisma.report.findUnique({
    where: {
      id: reportId,
    },
    include: reportInclude,
  });

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  return report;
};

const getPublicReportById = async (reportId) => {
  const report = await prisma.report.findUnique({
    where: {
      id: reportId,
    },
    select: publicReportSelect,
  });

  if (!report || !publicReportStatuses.includes(report.status)) {
    throw new ApiError(404, "Report not found");
  }

  return report;
};

const createReport = async (userId, data) => {
  const { title, description, latitude, longitude, locationName } = data;

  if (!userId) {
    throw new ApiError(401, "User ID is required");
  }

  if (!title || !description || latitude === undefined || longitude === undefined) {
    throw new ApiError(401, "Title, description, latitude and longitude are required");
  }

  const reportLatitude = Number(latitude);
  const reportLongitude = Number(longitude);

  if (Number.isNaN(reportLatitude) || Number.isNaN(reportLongitude)) {
    throw new ApiError(401, "Latitude and longitude must be valid numbers");
  }

  const report = await prisma.report.create({
    data: {
      reportNumber: generateReportNumber(),
      title,
      description,
      latitude: reportLatitude,
      longitude: reportLongitude,
      locationName,
      citizenId: userId,
    },
    include: reportInclude,
  });

  return report;
};

const getReports = async (user, status, scope = "private") => {
  if (scope === "public") {
    return getPublicReports(status);
  }

  if (!user) {
    throw new ApiError(401, "User is required");
  }

  const reportStatus = status ? status.toUpperCase() : "";

  if (reportStatus && !allowedStatuses.includes(reportStatus)) {
    throw new ApiError(401, "Invalid report status");
  }

  const where = {};

  if (user.role === "CITIZEN") {
    where.citizenId = user.id;
  }

  if (reportStatus) {
    where.status = reportStatus;
  }

  const reports = await prisma.report.findMany({
    where,
    include: reportInclude,
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!reports || reports.length === 0) {
    throw new ApiError(404, "No reports found");
  }

  return reports;
};

const getPublicReports = async (status) => {
  const reportStatus = status ? status.toUpperCase() : "";

  if (reportStatus && !publicReportStatuses.includes(reportStatus)) {
    throw new ApiError(401, "Invalid report status");
  }

  const reports = await prisma.report.findMany({
    where: {
      status: reportStatus ? reportStatus : { in: publicReportStatuses },
    },
    select: publicReportSelect,
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!reports || reports.length === 0) {
    throw new ApiError(404, "No reports found");
  }

  return reports;
};

const getSingleReport = async (user, reportId, scope = "private") => {
  if (!user && scope !== "public") {
    throw new ApiError(401, "User is required");
  }

  if (!reportId) {
    throw new ApiError(401, "Report ID is required");
  }

  if (scope === "public") {
    return getPublicReportById(reportId);
  }

  const report = await getReportById(reportId);

  if (user.role === "CITIZEN" && report.citizenId !== user.id) {
    throw new ApiError(403, "You can only view your own reports");
  }

  return report;
};

const getPublicNearbyReports = async (data) => {
  const { latitude, longitude, radius = 10 } = data;

  if (latitude === undefined || longitude === undefined) {
    throw new ApiError(401, "Latitude and longitude are required");
  }

  const reportLatitude = Number(latitude);
  const reportLongitude = Number(longitude);
  const searchRadius = Number(radius);

  if (Number.isNaN(reportLatitude) || Number.isNaN(reportLongitude)) {
    throw new ApiError(401, "Latitude and longitude must be valid numbers");
  }

  if (Number.isNaN(searchRadius) || searchRadius <= 0) {
    throw new ApiError(401, "Radius must be a valid number");
  }

  const latitudeRange = searchRadius / 111;
  const longitudeRange =
    searchRadius / (111 * Math.cos((reportLatitude * Math.PI) / 180));

  const reports = await prisma.report.findMany({
    where: {
      status: {
        in: ["VERIFIED", "RESOLVED"],
      },
      latitude: {
        gte: reportLatitude - latitudeRange,
        lte: reportLatitude + latitudeRange,
      },
      longitude: {
        gte: reportLongitude - longitudeRange,
        lte: reportLongitude + longitudeRange,
      },
    },
    include: reportInclude,
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!reports || reports.length === 0) {
    throw new ApiError(404, "No nearby reports found");
  }

  return reports;
};

const updateReport = async (user, reportId, data) => {
  if (!user) {
    throw new ApiError(401, "User is required");
  }

  if (!reportId) {
    throw new ApiError(401, "Report ID is required");
  }

  if (!data || Object.keys(data).length === 0) {
    throw new ApiError(401, "Report update data is required");
  }

  const report = await getReportById(reportId);

  if (user.role !== "CITIZEN" || report.citizenId !== user.id) {
    throw new ApiError(403, "You can only update your own reports");
  }

  const latitude = data.latitude === undefined ? report.latitude : Number(data.latitude);
  const longitude = data.longitude === undefined ? report.longitude : Number(data.longitude);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new ApiError(401, "Latitude and longitude must be valid numbers");
  }

  const updatedReport = await prisma.report.update({
    where: {
      id: reportId,
    },
    data: {
      title: data.title ?? report.title,
      description: data.description ?? report.description,
      latitude,
      longitude,
      locationName: data.locationName ?? report.locationName,
    },
    include: reportInclude,
  });

  return updatedReport;
};

const deleteReport = async (user, reportId) => {
  if (!user) {
    throw new ApiError(401, "User is required");
  }

  if (!reportId) {
    throw new ApiError(401, "Report ID is required");
  }

  const report = await getReportById(reportId);

  if (user.role !== "CITIZEN" || report.citizenId !== user.id) {
    throw new ApiError(403, "You can only delete your own reports");
  }

  await prisma.report.delete({
    where: {
      id: reportId,
    },
  });

  return true;
};

const assignReportToAuthority = async (user, reportId) => {
  if (!user) {
    throw new ApiError(401, "User is required");
  }

  if (!reportId) {
    throw new ApiError(401, "Report ID is required");
  }

  if (user.role !== "AUTHORITY") {
    throw new ApiError(403, "Only authority can assign reports");
  }

  const report = await getReportById(reportId);

  const updatedReport = await prisma.report.update({
    where: {
      id: report.id,
    },
    data: {
      currentAuthorityId: user.id,
      status: report.status === "SUBMITTED" ? "PENDING_AUTHORITY" : report.status,
    },
    include: reportInclude,
  });

  return updatedReport;
};

export {
  assignReportToAuthority,
  createReport,
  deleteReport,
  getPublicNearbyReports,
  getPublicReportById,
  getPublicReports,
  getReports,
  getSingleReport,
  reportInclude,
  updateReport,
};
