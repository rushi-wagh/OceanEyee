import express from "express";
import { dashboard } from "../controllers/dashboard.controller.js";
import { isLoggedIn, isAllowed } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", isLoggedIn, isAllowed("CITIZEN", "AUTHORITY", "ADMIN"), dashboard);

export default router;
