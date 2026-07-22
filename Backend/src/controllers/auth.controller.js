import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "../utils/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET || "change-this-secret",
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

const removePassword = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;
  const userName = name?.trim();
  const userEmail = email?.trim().toLowerCase();

  if (!userName || !userEmail || !password) {
    throw new ApiError(401, "Name, email and password are required");
  }

  if (!userEmail.includes("@")) {
    throw new ApiError(401, "Valid email is required");
  }

  if (password.length < 6) {
    throw new ApiError(401, "Password must be at least 6 characters");
  }

  const allowedRoles = ["CITIZEN", "AUTHORITY", "ADMIN"];
  const userRole = role ? role.trim().toUpperCase() : "CITIZEN";

  if (!allowedRoles.includes(userRole)) {
    throw new ApiError(401, "Invalid role");
  }

  const existedUser = await prisma.user.findUnique({
    where: {
      email: userEmail,
    },
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: userName,
      email: userEmail,
      password: hashedPassword,
      phone,
      role: userRole,
    },
  });

  const token = generateToken(user);

  return res.status(201).json(
    new ApiResponse(201, "User registered successfully", {
      user: removePassword(user),
      token,
    })
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const userEmail = email?.trim().toLowerCase();

  if (!userEmail || !password) {
    throw new ApiError(401, "Email and password are required");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: userEmail,
    },
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken(user);

  return res
    .cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json(
      new ApiResponse(200, "User logged in successfully", {
        user: removePassword(user),
      })
    );
});

const me = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    throw new ApiError(401, "User ID is required");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "User fetched successfully", {
        user: removePassword(user),
      })
    );
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token");

  return res
    .status(200)
    .json(new ApiResponse(200, "User logged out successfully", null));
});

export { login, me, register, logout };
