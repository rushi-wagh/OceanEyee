import { prisma } from "../utils/db.js";
import { ApiError } from "../utils/ApiError.js";

const recentReportSelect = {
  id: true,
  reportNumber: true,
  title: true,
  description: true,
  status: true,
  latitude: true,
  longitude: true,
  locationName: true,
  createdAt: true,
  updatedAt: true,
  citizen: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  currentAuthority: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
};

const getStatusCount = (statusCounts, status) => {
  const item = statusCounts.find((count) => count.status === status);
  return item?._count?.status || 0;
};

const getCitizenDashboard = async (userId) => {
  if (!userId) {
    throw new ApiError(401, "User ID is required");
  }

  const [totalReports, statusCounts, recentReports] = await Promise.all([
    prisma.report.count({
      where: {
        citizenId: userId,
      },
    }),
    prisma.report.groupBy({
      by: ["status"],
      where: {
        citizenId: userId,
      },
      _count: {
        status: true,
      },
    }),
    prisma.report.findMany({
      where: {
        citizenId: userId,
      },
      select: recentReportSelect,
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),
  ]);

  return {
    totalReports,
    pending: getStatusCount(statusCounts, "SUBMITTED") + getStatusCount(statusCounts, "PENDING_AUTHORITY"),
    resolved: getStatusCount(statusCounts, "RESOLVED") + getStatusCount(statusCounts, "CLOSED"),
    recentReports,
  };
};

const getAuthorityDashboard = async () => {
  const [statusCounts, recentReports] = await Promise.all([
    prisma.report.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    }),
    prisma.report.findMany({
      select: recentReportSelect,
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),
  ]);

  return {
    pendingReports: getStatusCount(statusCounts, "SUBMITTED") + getStatusCount(statusCounts, "PENDING_AUTHORITY"),
    verifiedReports: getStatusCount(statusCounts, "VERIFIED"),
    resolvedReports: getStatusCount(statusCounts, "RESOLVED") + getStatusCount(statusCounts, "CLOSED"),
    recentReports,
  };
};

const getAdminDashboard = async () => {
  const [userRoleCounts, reportStatusCounts, totalReports] = await Promise.all([
    prisma.user.groupBy({
      by: ["role"],
      _count: {
        role: true,
      },
    }),
    prisma.report.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    }),
    prisma.report.count(),
  ]);

  const getRoleCount = (role) => {
    const item = userRoleCounts.find((count) => count.role === role);
    return item?._count?.role || 0;
  };

  return {
    totalUsers: getRoleCount("CITIZEN") + getRoleCount("AUTHORITY") + getRoleCount("ADMIN"),
    authorities: getRoleCount("AUTHORITY"),
    citizens: getRoleCount("CITIZEN"),
    reports: totalReports,
    resolvedReports: getStatusCount(reportStatusCounts, "RESOLVED") + getStatusCount(reportStatusCounts, "CLOSED"),
  };
};

export { getAdminDashboard, getAuthorityDashboard, getCitizenDashboard };
