import axios from "axios";
import { ApiError } from "../utils/ApiError.js";
import { prisma } from "../utils/db.js";

const NOMINATIM_URL =
  "https://nominatim.openstreetmap.org/reverse";

const HISTORICAL_RADIUS_KM = 5;

const isValidCoordinate = (latitude, longitude) => {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

const calculateDistanceKm = (
  latitude1,
  longitude1,
  latitude2,
  longitude2,
) => {
  const EARTH_RADIUS_KM = 6371;

  const lat1 = (latitude1 * Math.PI) / 180;
  const lat2 = (latitude2 * Math.PI) / 180;

  const deltaLat =
    ((latitude2 - latitude1) * Math.PI) / 180;

  const deltaLon =
    ((longitude2 - longitude1) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) ** 2;

  const c =
    2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
};

const calculateHistoricalRiskScore = (incidentCount) => {
  if (incidentCount === 0) {
    return 0;
  }

  if (incidentCount === 1) {
    return 0.15;
  }

  if (incidentCount <= 3) {
    return 0.35;
  }

  if (incidentCount <= 5) {
    return 0.6;
  }

  return 0.8;
};

export {
  calculateDistanceKm,
};

export const reverseGeocode = async (
  latitude,
  longitude,
) => {
  if (!isValidCoordinate(latitude, longitude)) {
    throw new ApiError(
      400,
      "Latitude and longitude must be valid coordinates.",
    );
  }

  try {
    const response = await axios.get(NOMINATIM_URL, {
      params: {
        lat: latitude,
        lon: longitude,
        format: "jsonv2",
        addressdetails: 1,
      },
      headers: {
        "User-Agent": "OceanEye/1.0",
      },
      timeout: 5000,
    });

    const data = response?.data;

    if (!data || typeof data !== "object") {
      throw new ApiError(
        502,
        "Invalid response received from the geocoding service.",
      );
    }

    const address = data.address || {};

    return {
      latitude: Number(data.lat),
      longitude: Number(data.lon),
      locationName: data.display_name || null,
      road: address.road || null,
      neighbourhood: address.neighbourhood || null,
      suburb: address.suburb || null,
      city:
        address.city ||
        address.town ||
        address.village ||
        null,
      state: address.state || null,
      postcode: address.postcode || null,
      country: address.country || null,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error(
      "Reverse geocoding failed:",
      error?.response?.data || error?.message,
    );

    throw new ApiError(
      502,
      "Unable to determine location.",
    );
  }
};

const findNearbyHistoricalIncidents = async (
  latitude,
  longitude,
) => {
  /*
   * Approximate bounding box for the initial database query.
   * The exact Haversine calculation below determines
   * whether a report is actually within 5 km.
   */

  const latitudeDelta =
    HISTORICAL_RADIUS_KM / 111;

  const longitudeDelta =
    HISTORICAL_RADIUS_KM /
    (111 * Math.cos((latitude * Math.PI) / 180));

  const reports = await prisma.report.findMany({
    where: {
      status: {
        in: [
          "VERIFIED",
          "RESOLVED",
          "CLOSED",
        ],
      },
      latitude: {
        gte: latitude - latitudeDelta,
        lte: latitude + latitudeDelta,
      },
      longitude: {
        gte: longitude - longitudeDelta,
        lte: longitude + longitudeDelta,
      },
    },
    select: {
      id: true,
      reportNumber: true,
      latitude: true,
      longitude: true,
      status: true,
      createdAt: true,
    },
  });

  return reports
    .map((report) => {
      const distance = calculateDistanceKm(
        latitude,
        longitude,
        report.latitude,
        report.longitude,
      );

      return {
        ...report,
        distanceKm: Number(distance.toFixed(2)),
      };
    })
    .filter(
      (report) =>
        report.distanceKm <= HISTORICAL_RADIUS_KM,
    )
    .sort(
      (a, b) =>
        a.distanceKm - b.distanceKm,
    );
};

export const analyzeGeo = async (
  latitude,
  longitude,
) => {
  if (!isValidCoordinate(latitude, longitude)) {
    throw new ApiError(
      400,
      "Latitude and longitude must be valid coordinates.",
    );
  }

  try {
    const [location, nearbyIncidents] =
      await Promise.all([
        reverseGeocode(latitude, longitude),
        findNearbyHistoricalIncidents(
          latitude,
          longitude,
        ),
      ]);

    const historicalIncidentCount =
      nearbyIncidents.length;

    const riskScore = calculateHistoricalRiskScore(
      historicalIncidentCount,
    );

    const nearbyContext = [];

    if (location.city) {
      nearbyContext.push(location.city);
    }

    if (location.suburb) {
      nearbyContext.push(location.suburb);
    }

    if (location.neighbourhood) {
      nearbyContext.push(
        location.neighbourhood,
      );
    }

    const riskFactors = [];

    if (historicalIncidentCount > 0) {
      riskFactors.push(
        `${historicalIncidentCount} verified historical incident${
          historicalIncidentCount > 1 ? "s" : ""
        } within ${HISTORICAL_RADIUS_KM} km`,
      );
    }

    return {
      region:
        [location.city, location.state]
          .filter(Boolean)
          .join(", ") || null,

      nearbyContext,

      riskFactors,

      riskScore,

      historicalIncidents: nearbyIncidents.map(
        (incident) => ({
          reportId: incident.id,
          reportNumber: incident.reportNumber,
          distanceKm: incident.distanceKm,
          status: incident.status,
          createdAt: incident.createdAt,
        }),
      ),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error(
      "Geo analysis failed:",
      error?.message,
    );

    throw new ApiError(
      502,
      "Geo analysis failed.",
    );
  }
};