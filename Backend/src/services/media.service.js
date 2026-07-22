import { v2 as cloudinary } from "cloudinary";
import { prisma } from "../utils/db.js";
import { ApiError } from "../utils/ApiError.js";

const checkCloudinaryConfig = () => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new ApiError(500, "Cloudinary is not configured");
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

const canManageReportImages = (user, report) => {
  return user.role === "CITIZEN" && report.citizenId === user.id;
};

const getReportForImages = async (user, reportId) => {
  const report = await prisma.report.findUnique({
    where: {
      id: reportId,
    },
  });

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  if (!canManageReportImages(user, report)) {
    throw new ApiError(403, "You can only manage images for your own reports");
  }

  return report;
};

const uploadFileToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "oceaniq/reports",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    stream.end(file.buffer);
  });
};

const uploadReportImages = async (user, reportId, files) => {
  checkCloudinaryConfig();
  await getReportForImages(user, reportId);

  if (!files || files.length === 0) {
    throw new ApiError(401, "At least one image is required");
  }

  const uploadedImages = [];

  for (const file of files) {
    const uploadedImage = await uploadFileToCloudinary(file);

    const image = await prisma.reportImage.create({
      data: {
        reportId,
        url: uploadedImage.secure_url,
        publicId: uploadedImage.public_id,
      },
    });

    uploadedImages.push(image);
  }

  return uploadedImages;
};

const deleteReportImage = async (user, reportId, imageId) => {
  checkCloudinaryConfig();
  await getReportForImages(user, reportId);

  const image = await prisma.reportImage.findFirst({
    where: {
      id: imageId,
      reportId,
    },
  });

  if (!image) {
    throw new ApiError(404, "Image not found");
  }

  await cloudinary.uploader.destroy(image.publicId);

  await prisma.reportImage.delete({
    where: {
      id: image.id,
    },
  });

  return image;
};

export { deleteReportImage, uploadReportImages };
