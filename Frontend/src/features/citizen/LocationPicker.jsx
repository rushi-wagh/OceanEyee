import { useEffect, useMemo, useRef, useState } from "react";
import { Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPinned, LocateFixed, Loader2 } from "lucide-react";
import { IndiaMap } from "@/components/common/IndiaMap";
import { indiaMapCenter, indiaMapMinZoom } from "@/components/common/indiaMapConfig";
import {
  buildReverseGeocodeLabel,
  clampLatitude,
  clampLongitude,
  formatLatitudeLongitude,
  isValidLatitude,
  isValidLongitude,
} from "@/features/citizen/locationUtils";

const markerIcon = new L.Icon({
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).href,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const requestReverseGeocode = async (latitude, longitude, signal) => {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`;
  const response = await fetch(url, {
    signal,
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Reverse geocoding failed");
  }

  return response.json();
};

const getGeolocationErrorMessage = (error) => {
  if (!error) {
    return "Unable to determine your current location.";
  }

  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location permission was denied. Please allow browser location access or choose a point on the map.";
    case error.POSITION_UNAVAILABLE:
      return "Your current location is unavailable right now. Please try again or click the map manually.";
    case error.TIMEOUT:
      return "Location request timed out. Please try again or select the location on the map.";
    default:
      return error.message || "Unable to determine your current location.";
  }
};

const MapEvents = ({ onSelect }) => {
  useMapEvents({
    click: (event) => {
      onSelect(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
};

const DraggableMarker = ({ position, onDragEnd }) => {
  if (!position) {
    return null;
  }

  return (
    <Marker
      position={position}
      draggable
      icon={markerIcon}
      eventHandlers={{
        dragend: (event) => {
          const marker = event.target;
          const nextLatLng = marker.getLatLng();
          onDragEnd(nextLatLng.lat, nextLatLng.lng);
        },
      }}
    />
  );
};

const LocationPicker = ({
  latitude,
  longitude,
  locationName,
  latitudeError,
  longitudeError,
  onCoordinatesChange,
  onLocationNameChange,
}) => {
  const [zoom, setZoom] = useState(indiaMapMinZoom);
  const [geolocationStatus, setGeolocationStatus] = useState("");
  const [geolocationLoading, setGeolocationLoading] = useState(false);
  const [reverseGeocodeMessage, setReverseGeocodeMessage] = useState("");
  const [reverseGeocodeLoading, setReverseGeocodeLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const abortControllerRef = useRef(null);

  const hasValidCoordinates = isValidLatitude(latitude) && isValidLongitude(longitude);
  const markerPosition = hasValidCoordinates ? [latitude, longitude] : null;
  const selectedLabel = useMemo(() => formatLatitudeLongitude(latitude, longitude), [latitude, longitude]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const updateLocationFromCoordinates = async (nextLatitude, nextLongitude) => {
    const safeLatitude = clampLatitude(Number(nextLatitude));
    const safeLongitude = clampLongitude(Number(nextLongitude));

    onCoordinatesChange(safeLatitude, safeLongitude);
    setZoom(14);
    setGeolocationStatus("");
    setReverseGeocodeMessage("");
    setSelectedAddress("");
    setReverseGeocodeLoading(true);

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const data = await requestReverseGeocode(safeLatitude, safeLongitude, controller.signal);
      const nextLocationLabel = buildReverseGeocodeLabel(data);
      setSelectedAddress(nextLocationLabel);
      onLocationNameChange(nextLocationLabel);
    } catch (error) {
      if (error.name !== "AbortError") {
        setReverseGeocodeMessage("We could not look up a human-readable location for this point.");
      }
    } finally {
      if (!controller.signal.aborted) {
        setReverseGeocodeLoading(false);
      }
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeolocationStatus("Your browser does not support location access.");
      return;
    }

    setGeolocationLoading(true);
    setGeolocationStatus("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeolocationLoading(false);
        updateLocationFromCoordinates(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        setGeolocationLoading(false);
        setGeolocationStatus(getGeolocationErrorMessage(error));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const handleCoordinateInputBlur = (nextLatitude, nextLongitude) => {
    if (!Number.isFinite(nextLatitude) || !Number.isFinite(nextLongitude)) {
      return;
    }

    if (!isValidLatitude(nextLatitude) || !isValidLongitude(nextLongitude)) {
      return;
    }

    updateLocationFromCoordinates(nextLatitude, nextLongitude);
  };

  const handleMapSelect = (nextLatitude, nextLongitude) => {
    updateLocationFromCoordinates(nextLatitude, nextLongitude);
  };

  const handleMarkerDragEnd = (nextLatitude, nextLongitude) => {
    updateLocationFromCoordinates(nextLatitude, nextLongitude);
  };

  const selectedLocationLine = selectedAddress || locationName || "No location selected yet";
  const latitudeInputKey = Number.isFinite(latitude) ? `latitude-${latitude}` : "latitude-empty";
  const longitudeInputKey = Number.isFinite(longitude) ? `longitude-${longitude}` : "longitude-empty";
  const mapKey = hasValidCoordinates ? `map-${latitude}-${longitude}` : "map-default";
  const mapCenter = hasValidCoordinates ? [latitude, longitude] : indiaMapCenter;

  return (
    <section className="glass-panel card-glow rounded-3xl border border-white/5 p-4 shadow-card-glow sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Location coordinates</h2>
          <p className="mt-1 text-sm leading-6 text-slate-400">Use the map, your current location, or manual coordinates to place the incident marker.</p>
        </div>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={geolocationLoading || reverseGeocodeLoading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-glow-primary transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          {geolocationLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LocateFixed className="h-4 w-4" aria-hidden="true" />}
          Use my current location
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#02070e]">
        <IndiaMap key={mapKey} center={mapCenter} zoom={zoom} className="h-[420px] w-full">
          <MapEvents onSelect={handleMapSelect} />
          <DraggableMarker position={markerPosition} onDragEnd={handleMarkerDragEnd} />
        </IndiaMap>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-background-card text-primary-light shadow-glow-primary">
              <MapPinned className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Selected location</div>
              <div className="mt-1 text-base font-semibold text-white">{selectedLocationLine}</div>
              <div className="mt-2 text-sm leading-6 text-slate-400">{selectedLabel || "Use the map or current location to choose a point."}</div>
              {reverseGeocodeLoading ? <div className="mt-2 text-sm text-slate-300">Finding location...</div> : null}
              {!reverseGeocodeLoading && reverseGeocodeMessage ? <div className="mt-2 text-sm text-amber-200">{reverseGeocodeMessage}</div> : null}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {geolocationStatus ? <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{geolocationStatus}</div> : null}
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-semibold text-slate-200">Latitude *</span>
              <input
                key={latitudeInputKey}
                type="number"
                step="0.000001"
                defaultValue={Number.isFinite(latitude) ? String(latitude) : ""}
                onBlur={(event) => {
                  if (event.target.value.trim() === "") {
                    onCoordinatesChange(undefined, longitude);
                    return;
                  }

                  const nextLatitude = Number(event.target.value);

                  if (Number.isNaN(nextLatitude)) {
                    return;
                  }

                  handleCoordinateInputBlur(nextLatitude, longitude);
                }}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
              />
              {latitudeError ? <span className="mt-2 block text-sm text-red-300">{latitudeError}</span> : null}
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-200">Longitude *</span>
              <input
                key={longitudeInputKey}
                type="number"
                step="0.000001"
                defaultValue={Number.isFinite(longitude) ? String(longitude) : ""}
                onBlur={(event) => {
                  if (event.target.value.trim() === "") {
                    onCoordinatesChange(latitude, undefined);
                    return;
                  }

                  const nextLongitude = Number(event.target.value);

                  if (Number.isNaN(nextLongitude)) {
                    return;
                  }

                  handleCoordinateInputBlur(latitude, nextLongitude);
                }}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
              />
              {longitudeError ? <span className="mt-2 block text-sm text-red-300">{longitudeError}</span> : null}
            </label>
          </div>
        </div>
      </div>
    </section>
  );
};

export { LocationPicker };
