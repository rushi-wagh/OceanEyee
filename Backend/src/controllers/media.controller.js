import { deleteReportImage } from "../services/media.service.js";
import { uploadReportImages } from "../services/media.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { processIncidentIntelligence } from "../services/incident.service.js";
import { getSingleReport } from "../services/report.service.js";

const uploadImages = asyncHandler(async (req, res) => {
  const user = req.user;
  const files = req.files;
  const { id: reportId } = req.params;

  if (!user) {
    throw new ApiError(401, "User is required");
  }

  if (!reportId) {
    throw new ApiError(401, "Report ID is required");
  }

  if (!files || files.length === 0) {
    throw new ApiError(401, "At least one image is required");
  }

  const images = await uploadReportImages(user, reportId, files);
  const report = await getSingleReport(user, reportId);

  processIncidentIntelligence(report).catch((error) => {
    console.error("Incident intelligence processing failed:", error);
  });
  const urls = images.map((image) => image.url);

  return res.status(201).json(
    new ApiResponse(201, "Images uploaded successfully", {
      images,
      urls,
    }),
  );
});

const deleteImage = asyncHandler(async (req, res) => {
  const user = req.user;
  const { id: reportId, imageId } = req.params;

  if (!user) {
    throw new ApiError(401, "User is required");
  }

  if (!reportId) {
    throw new ApiError(401, "Report ID is required");
  }

  if (!imageId) {
    throw new ApiError(401, "Image ID is required");
  }

  await deleteReportImage(user, reportId, imageId);

  return res
    .status(200)
    .json(new ApiResponse(200, "Image deleted successfully", null));
});

export { deleteImage, uploadImages };
