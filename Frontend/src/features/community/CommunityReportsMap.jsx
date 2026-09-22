import { CircleMarker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import { IndiaMap } from "@/components/common/IndiaMap";
import { indiaMapCenter, indiaMapMinZoom } from "@/components/common/indiaMapConfig";
import { formatCoordinate, isValidLatitude, isValidLongitude } from "@/features/citizen/locationUtils";

const normalizeStatus = (status) => String(status || "").trim().toUpperCase();

const hasCoordinates = (item) => isValidLatitude(item?.latitude) && isValidLongitude(item?.longitude);

const getHazardType = (report) => report?.hazardType || report?.intelligence?.hazardType || "Not specified";

const formatDate = (value) => {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value || "Not specified";
  }
};

const normalizeHotspots = (payload) => {
  if (Array.isArray(payload?.data?.hotspots)) {
    return payload.data.hotspots;
  }

  if (Array.isArray(payload?.hotspots)) {
    return payload.hotspots;
  }

  return [];
};

const getHotspotReportIds = (hotspot) => (
  Array.isArray(hotspot?.reportIds) ? hotspot.reportIds : []
);

const CommunityReportsMap = ({ reports, hotspots, isLoading, error }) => {
  const publicReports = reports.filter((report) => ["VERIFIED", "RESOLVED"].includes(normalizeStatus(report.status)) && hasCoordinates(report));
  const mappedHotspots = normalizeHotspots(hotspots).filter(hasCoordinates);
  const hasMapData = publicReports.length > 0 || mappedHotspots.length > 0;
  const reportsById = new Map(reports.map((report) => [String(report.id), report]));

  return (
    <section className="glass-panel card-glow rounded-3xl border border-white/5 p-4 shadow-card-glow sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Community map</h2>
          <p className="mt-1 text-sm leading-6 text-slate-400">Verified and resolved reports across India, with public hotspots from the reporting service.</p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" />Individual reports</span>
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-500" />Public hotspots</span>
        </div>
      </div>

      <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/5 bg-[#02070e]">
        <IndiaMap center={indiaMapCenter} zoom={indiaMapMinZoom} className="h-[360px] w-full sm:h-[460px]">
          {publicReports.map((report) => (
            <CircleMarker
              key={report.id}
              center={[report.latitude, report.longitude]}
              radius={7}
              pathOptions={{ color: "#93c5fd", fillColor: "#2563eb", fillOpacity: 0.95, weight: 2 }}
            >
              <Popup>
                <div className="min-w-48 space-y-2 text-sm">
                  <div className="font-semibold">{report.title || "Untitled report"}</div>
                  <div><strong>Hazard type:</strong> {getHazardType(report)}</div>
                  <div><strong>Location:</strong> {report.locationName || `${formatCoordinate(report.latitude)}, ${formatCoordinate(report.longitude)}`}</div>
                  <div><strong>Status:</strong> {report.status || "Not specified"}</div>
                  <div><strong>Date:</strong> {formatDate(report.createdAt)}</div>
                  <Link className="font-semibold text-cyan-700 underline" to={`/community/${report.id}`}>View Details</Link>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {mappedHotspots.map((hotspot, index) => (
            <CircleMarker
              key={`${hotspot.hazardType}-${hotspot.latitude}-${hotspot.longitude}-${index}`}
              center={[hotspot.latitude, hotspot.longitude]}
              radius={Math.min(22, Math.max(12, 8 + Number(hotspot.reportCount || 0)))}
              pathOptions={{ color: "#fca5a5", fillColor: "#dc2626", fillOpacity: 0.8, weight: 3 }}
            >
              <Popup>
                <div className="min-w-64 space-y-3 text-sm">
                  <div>
                    <div className="font-semibold">Public Hotspot</div>
                    <div className="mt-1 text-xs text-slate-600">Multiple related public reports</div>
                  </div>
                  <div><strong>Hazard type:</strong> {hotspot.hazardType || "Not specified"}</div>
                  <div><strong>Related reports:</strong> {hotspot.reportCount || getHotspotReportIds(hotspot).length}</div>
                  <div>
                    <div className="font-semibold">Reports in this hotspot</div>
                    <ul className="mt-2 space-y-2">
                      {getHotspotReportIds(hotspot).map((reportId) => {
                        const report = reportsById.get(String(reportId));

                        return (
                          <li key={reportId} className="border-t border-slate-200 pt-2 first:border-t-0 first:pt-0">
                            <Link className="font-semibold text-cyan-700 underline" to={`/community/${reportId}`}>
                              {report?.title || `Report ${reportId}`}
                            </Link>
                            {report ? (
                              <div className="mt-1 space-y-0.5 text-xs text-slate-600">
                                <div>{report.locationName || "Location not provided"}</div>
                                <div>{report.status || "Status not specified"} · {formatDate(report.createdAt)}</div>
                              </div>
                            ) : (
                              <div className="mt-1 text-xs text-slate-600">Open public report details for more information.</div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </IndiaMap>

        {isLoading ? <div className="absolute inset-0 flex items-center justify-center bg-[#02070e]/70 text-sm text-slate-200">Loading map data...</div> : null}
        {!isLoading && error ? <div className="absolute inset-x-4 top-4 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">Hotspots are unavailable right now. Public report markers remain available.</div> : null}
        {!isLoading && !error && !hasMapData ? <div className="absolute inset-0 flex items-center justify-center bg-[#02070e]/55 p-6 text-center text-sm text-slate-400">No public reports with coordinates or hotspots are available yet.</div> : null}
      </div>
      <p className="mt-3 text-xs text-slate-500">Reports without coordinates are still available in the feed below.</p>
    </section>
  );
};

export { CommunityReportsMap };