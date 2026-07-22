import { prisma } from "../utils/db.js";
import { ApiError } from "../utils/ApiError.js";
import { reportInclude } from "./report.service.js";

const actionInclude = {
  authority: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
};

const reportWithActionsInclude = {
  ...reportInclude,
  authorityActions: {
    include: actionInclude,
    orderBy: {
      createdAt: "desc",
    },
  },
};

const getReport = async (reportId) => {
  const report = await prisma.report.findUnique({
    where: {
      id: reportId,
    },
  });

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  return report;
};

const createAuthorityAction = async (authorityId, reportId, action, remarks) => {
  if (!authorityId) {
    throw new ApiError(401, "Authority ID is required");
  }

  if (!reportId) {
    throw new ApiError(401, "Report ID is required");
  }

  if (!action) {
    throw new ApiError(401, "Authority action is required");
  }

  if (!remarks) {
    throw new ApiError(401, "Remarks are required");
  }

  await getReport(reportId);

  const [authorityAction, report] = await prisma.$transaction([
    prisma.authorityAction.create({
      data: {
        reportId,
        authorityId,
        action,
        remarks,
      },
      include: actionInclude,
    }),
    prisma.report.update({
      where: {
        id: reportId,
      },
      data: {
        status: action,
        currentAuthorityId: authorityId,
      },
      include: reportWithActionsInclude,
    }),
  ]);

  return {
    authorityAction,
    report,
  };
};

export { createAuthorityAction };
