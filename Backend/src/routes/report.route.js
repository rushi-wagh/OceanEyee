import express from "express";
import { closeReport, rejectReport, resolveReport, verifyReport } from "../controllers/authorityAction.controller.js";
import { assignMe, create, getAll, getHotspots, getNearby, getOne, remove, update } from "../controllers/report.controller.js";
import { deleteImage, uploadImages } from "../controllers/media.controller.js";
import { isAllowed, isLoggedIn, optionalAuth } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/", isLoggedIn, isAllowed("CITIZEN"), create);
router.get("/", optionalAuth, getAll);
router.get("/nearby", isLoggedIn, isAllowed("CITIZEN", "AUTHORITY"), getNearby);
router.get("/hotspots", getHotspots);

router.get("/:id", optionalAuth, getOne);
router.patch("/:id", isLoggedIn, isAllowed("CITIZEN"), update);
router.delete("/:id", isLoggedIn, isAllowed("CITIZEN"), remove);

router.patch("/:id/assign", isLoggedIn, isAllowed("AUTHORITY"), assignMe);
router.post("/:id/actions/verify", isLoggedIn, isAllowed("AUTHORITY"), verifyReport);
router.post("/:id/actions/reject", isLoggedIn, isAllowed("AUTHORITY"), rejectReport);
router.post("/:id/actions/resolve", isLoggedIn, isAllowed("AUTHORITY"), resolveReport);
router.post("/:id/actions/close", isLoggedIn, isAllowed("AUTHORITY"), closeReport);

router.post("/:id/images", isLoggedIn, isAllowed("CITIZEN"), upload.array("images", 3), uploadImages);
router.delete("/:id/images/:imageId", isLoggedIn, isAllowed("CITIZEN"), deleteImage);


export default router;
