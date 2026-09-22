import { prisma } from "../utils/db.js";
import { ApiError } from "../utils/ApiError.js";

const HOTSPOT_RADIUS_KM = 5;
const MIN_REPORTS_FOR_HOTSPOT = 3;

const publicReportStatuses = ["VERIFIED", "RESOLVED"];

const toRadians = (degrees) => (degrees * Math.PI) / 180;

const calculateDistanceKm = (latitude1, longitude1, latitude2, longitude2) => {
  const EARTH_RADIUS_KM = 6371;

  const dLatitude = toRadians(latitude2 - latitude1);
  const dLongitude = toRadians(longitude2 - longitude1);

  const a =
    Math.sin(dLatitude / 2) ** 2 +
    Math.cos(toRadians(latitude1)) *
      Math.cos(toRadians(latitude2)) *
      Math.sin(dLongitude / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
};

const calculateCentroid = (reports) => {
  const total = reports.reduce(
    (accumulator, report) => {
      accumulator.latitude += report.latitude;
      accumulator.longitude += report.longitude;

      return accumulator;
    },
    { latitude: 0, longitude: 0 },
  );

  return {
    latitude: total.latitude / reports.length,
    longitude: total.longitude / reports.length,
  };
};

const buildHotspotGroups = (reports) => {
  const groupedByHazard = new Map();

  for (const report of reports) {
    const hazardType = report.intelligence?.hazardType;

    if (!hazardType) {
      continue;
    }

    if (!groupedByHazard.has(hazardType)) {
      groupedByHazard.set(hazardType, []);
    }

    groupedByHazard.get(hazardType).push(report);
  }

  const hotspots = [];

  for (const [hazardType, hazardReports] of groupedByHazard) {
    const visited = new Set();

    for (const report of hazardReports) {
      if (visited.has(report.id)) {
        continue;
      }

      const nearbyReports = hazardReports.filter((candidate) => {
        if (candidate.id === report.id) {
          return true;
        }

        return (
          calculateDistanceKm(
            report.latitude,
            report.longitude,
            candidate.latitude,
            candidate.longitude,
          ) <= HOTSPOT_RADIUS_KM
        );
      });

      if (nearbyReports.length < MIN_REPORTS_FOR_HOTSPOT) {
        continue;
      }

      nearbyReports.forEach((candidate) => visited.add(candidate.id));

      const centroid = calculateCentroid(nearbyReports);

      hotspots.push({
        latitude: centroid.latitude,
        longitude: centroid.longitude,
        hazardType,
        reportCount: nearbyReports.length,
        reportIds: nearbyReports.map((report) => report.id),
      });
    }
  }

  return hotspots;
};

const getPublicHotspots = async () => {
  const reports = await prisma.report.findMany({
    where: {
      status: {
        in: publicReportStatuses,
      },
    },
    select: {
      id: true,
      latitude: true,
      longitude: true,
      intelligence: {
        select: {
          hazardType: true,
        },
      },
    },
  });

  if (!reports || reports.length === 0) {
    return [];
  }

  return buildHotspotGroups(reports);
};

export { getPublicHotspots };