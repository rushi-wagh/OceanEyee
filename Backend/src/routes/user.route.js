import express from "express";
import { listUsers, changeUserRole } from "../controllers/user.controller.js";
import { isAllowed, isLoggedIn } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", isLoggedIn, isAllowed("ADMIN"), listUsers);
router.patch("/:id/role", isLoggedIn, isAllowed("ADMIN"), changeUserRole);

export default router;
