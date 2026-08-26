import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getUsers, updateUserRole } from "../services/user.service.js";

const listUsers = asyncHandler(async (req, res) => {
  const actorUserId = req.user?.id;

  if (!actorUserId) {
    throw new ApiError(401, "User ID is required");
  }

  const users = await getUsers({
    actorUserId,
    search: req.query.search,
    role: req.query.role,
  });

  return res.status(200).json(new ApiResponse(200, "Users fetched successfully", { users }));
});

const changeUserRole = asyncHandler(async (req, res) => {
  const actorUserId = req.user?.id;
  const targetUserId = req.params.id;

  if (!actorUserId) {
    throw new ApiError(401, "User ID is required");
  }

  if (!targetUserId) {
    throw new ApiError(400, "Target user ID is required");
  }

  const user = await updateUserRole({
    actorUserId,
    targetUserId,
    role: req.body?.role,
  });

  return res.status(200).json(new ApiResponse(200, "User role updated successfully", { user }));
});

export { changeUserRole, listUsers };
