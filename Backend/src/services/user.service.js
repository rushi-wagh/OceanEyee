import { prisma } from "../utils/db.js";
import { ApiError } from "../utils/ApiError.js";

const VALID_ROLES = ["CITIZEN", "AUTHORITY", "ADMIN"];

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

const sanitizeRole = (role) => String(role || "").trim().toUpperCase();

const ensureAdminActor = async (actorUserId) => {
  if (!actorUserId) {
    throw new ApiError(401, "User ID is required");
  }

  const actor = await prisma.user.findUnique({
    where: { id: actorUserId },
    select: {
      id: true,
      role: true,
    },
  });

  if (!actor) {
    throw new ApiError(404, "User not found");
  }

  if (actor.role !== "ADMIN") {
    throw new ApiError(403, "Only admin can perform this action");
  }
};

const getUsers = async ({ actorUserId, search, role }) => {
  await ensureAdminActor(actorUserId);

  const where = {};
  const normalizedRole = sanitizeRole(role);

  if (normalizedRole) {
    if (!VALID_ROLES.includes(normalizedRole)) {
      throw new ApiError(400, "Invalid role filter");
    }

    where.role = normalizedRole;
  }

  const normalizedSearch = String(search || "").trim();
  if (normalizedSearch) {
    where.OR = [
      {
        name: {
          contains: normalizedSearch,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: normalizedSearch,
          mode: "insensitive",
        },
      },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    select: userSelect,
    orderBy: {
      createdAt: "desc",
    },
  });

  return users;
};

const updateUserRole = async ({ actorUserId, targetUserId, role }) => {
  await ensureAdminActor(actorUserId);

  if (!targetUserId) {
    throw new ApiError(400, "Target user ID is required");
  }

  const nextRole = sanitizeRole(role);
  if (!VALID_ROLES.includes(nextRole)) {
    throw new ApiError(400, "Invalid role value");
  }

  if (actorUserId === targetUserId) {
    throw new ApiError(400, "You cannot change your own role");
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: userSelect,
  });

  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  if (targetUser.role === nextRole) {
    return targetUser;
  }

  if (targetUser.role === "ADMIN" && nextRole !== "ADMIN") {
    const adminCount = await prisma.user.count({
      where: {
        role: "ADMIN",
      },
    });

    if (adminCount <= 1) {
      throw new ApiError(400, "This account is the last administrator and cannot be demoted.");
    }
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: targetUserId,
    },
    data: {
      role: nextRole,
    },
    select: userSelect,
  });

  return updatedUser;
};

export { getUsers, updateUserRole, VALID_ROLES };
