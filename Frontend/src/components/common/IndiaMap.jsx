import { MapContainer, TileLayer } from "react-leaflet";
import { indiaBounds, indiaMapCenter, indiaMapMinZoom } from "@/components/common/indiaMapConfig";

const IndiaMap = ({ children, center = indiaMapCenter, zoom = indiaMapMinZoom, className, scrollWheelZoom = true }) => (
  <MapContainer
    center={center}
    zoom={Math.max(zoom, indiaMapMinZoom)}
    minZoom={indiaMapMinZoom}
    maxBounds={indiaBounds}
    maxBoundsViscosity={1}
    scrollWheelZoom={scrollWheelZoom}
    className={className}
  >
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    {children}
  </MapContainer>
);

export { IndiaMap };