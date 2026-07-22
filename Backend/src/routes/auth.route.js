import express from "express";
import { login, logout, me, register } from "../controllers/auth.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", isLoggedIn, me);
router.post("/logout", isLoggedIn, logout);

export default router;
