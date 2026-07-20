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

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  const allowedRoles = ["CITIZEN", "AUTHORITY", "ADMIN"];
  const userRole = role ? role.toUpperCase() : "CITIZEN";

  if (!allowedRoles.includes(userRole)) {
    throw new ApiError(400, "Invalid role");
  }

  const existedUser = await prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role: userRole,
    },
  });

  const token = generateToken(user);

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        user: removePassword(user),
        token,
      },
      "User registered successfully"
    )
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
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
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  })
  .status(200).json(
    new ApiResponse(
      200,
      {
        user: removePassword(user),
      },
      "User logged in successfully"
    )
  );
});

const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(new ApiResponse(200, { user: removePassword(user) }, "User fetched successfully"));
});


const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  return res.status(200).json(new ApiResponse(200, null, "User logged out successfully"));
});

export { login, me, register, logout };
