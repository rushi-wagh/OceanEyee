const MIN_LATITUDE = -90;
const MAX_LATITUDE = 90;
const MIN_LONGITUDE = -180;
const MAX_LONGITUDE = 180;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const isValidLatitude = (value) => Number.isFinite(value) && value >= MIN_LATITUDE && value <= MAX_LATITUDE;

const isValidLongitude = (value) => Number.isFinite(value) && value >= MIN_LONGITUDE && value <= MAX_LONGITUDE;

const formatCoordinate = (value) => {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return value.toFixed(6);
};

const formatLatitudeLongitude = (latitude, longitude) => {
  if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
    return "";
  }

  const latDirection = latitude >= 0 ? "N" : "S";
  const lngDirection = longitude >= 0 ? "E" : "W";

  return `${Math.abs(latitude).toFixed(4)}° ${latDirection}, ${Math.abs(longitude).toFixed(4)}° ${lngDirection}`;
};

const buildReverseGeocodeLabel = (data) => {
  const address = data?.address || {};
  const parts = [
    address.road || address.pedestrian || address.footway || address.path || address.residential,
    address.neighbourhood || address.suburb || address.city_district || address.quarter,
    address.city || address.town || address.village || address.municipality,
    address.state_district || address.state,
    address.postcode,
    address.country,
  ].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(", ");
  }

  return data?.display_name || "";
};

const clampLatitude = (value) => clamp(value, MIN_LATITUDE, MAX_LATITUDE);
const clampLongitude = (value) => clamp(value, MIN_LONGITUDE, MAX_LONGITUDE);

export {
  MAX_LATITUDE,
  MAX_LONGITUDE,
  MIN_LATITUDE,
  MIN_LONGITUDE,
  buildReverseGeocodeLabel,
  clampLatitude,
  clampLongitude,
  formatCoordinate,
  formatLatitudeLongitude,
  isValidLatitude,
  isValidLongitude,
};
