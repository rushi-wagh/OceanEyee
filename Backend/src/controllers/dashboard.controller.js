import { getAdminDashboard } from "../services/dashboard.service.js";
import { getAuthorityDashboard } from "../services/dashboard.service.js";
import { getCitizenDashboard } from "../services/dashboard.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const dashboard = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "User is required");
  }

  let data;

  switch (user.role) {
    case "CITIZEN":
      data = await getCitizenDashboard(user.id);
      break;
    case "AUTHORITY":
      data = await getAuthorityDashboard();
      break;
    case "ADMIN":
      data = await getAdminDashboard();
      break;
    default:
      throw new ApiError(401, "Invalid user role");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Dashboard fetched successfully", data));
});

export { dashboard };
