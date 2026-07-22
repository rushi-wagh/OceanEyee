import { createAuthorityAction } from "../services/authorityAction.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const handleAuthorityAction = async (req, res, action, message) => {
  const authorityId = req.user.id;
  const { id: reportId } = req.params;
  const { remarks } = req.body;

  if (!authorityId) {
    throw new ApiError(401, "Authority ID is required");
  }

  if (!reportId) {
    throw new ApiError(401, "Report ID is required");
  }

  if (!remarks) {
    throw new ApiError(401, "Remarks are required");
  }

  const data = await createAuthorityAction(
    authorityId,
    reportId,
    action,
    remarks
  );

  return res.status(200).json(new ApiResponse(200, message, data));
};

const verifyReport = asyncHandler(async (req, res) => {
  return handleAuthorityAction(
    req,
    res,
    "VERIFIED",
    "Report verified successfully"
  );
});

const rejectReport = asyncHandler(async (req, res) => {
  return handleAuthorityAction(
    req,
    res,
    "REJECTED",
    "Report rejected successfully"
  );
});

const resolveReport = asyncHandler(async (req, res) => {
  return handleAuthorityAction(
    req,
    res,
    "RESOLVED",
    "Report resolved successfully"
  );
});

const closeReport = asyncHandler(async (req, res) => {
  return handleAuthorityAction(req, res, "CLOSED", "Report closed successfully");
});

export { closeReport, rejectReport, resolveReport, verifyReport };
