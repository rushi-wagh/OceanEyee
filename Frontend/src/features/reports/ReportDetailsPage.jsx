import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  FileText,
  MapPinned,
  MessageSquareText,
  ShieldAlert,
  Signature,
  User,
  XCircle,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import { getReport, closeReport, rejectReport, resolveReport, verifyReport } from "@/api/report.api";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { humanizeStatus } from "@/components/ui/statusUtils";
import { showToast } from "@/components/ui/showToast";
import { useAuth } from "@/hooks/useAuth";
import { formatCoordinate, formatLatitudeLongitude, isValidLatitude, isValidLongitude } from "@/features/citizen/locationUtils";

const reportMarkerIcon = new L.Icon({
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).href,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const formatDate = (value) => {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value || "";
  }
};

const normalizeReport = (payload) => {
  if (payload?.data?.report) {
    return payload.data.report;
  }

  if (payload?.report) {
    return payload.report;
  }

  if (payload?.data && !Array.isArray(payload.data)) {
    return payload.data;
  }

  return payload ?? null;
};

const normalizeStatus = (status) => String(status || "").trim().toUpperCase();

const getImageEntries = (report) => {
  if (!Array.isArray(report?.images)) {
    return [];
  }

  return report.images
    .map((image, index) => ({
      id: image.id || image.publicId || image.url || `${index}`,
      url: image.url || image.secure_url || image.thumbnailUrl || "",
      alt: image.originalName || image.filename || report.title || `Report image ${index + 1}`,
    }))
    .filter((image) => Boolean(image.url));
};

const buildTimelineEntries = (report) => {
  const entries = [];

  if (report?.createdAt) {
    entries.push({
      id: "submitted",
      title: "Submitted",
      subtitle: report.citizen?.name || "Citizen submission",
      timestamp: report.createdAt,
      note: "Incident report submitted",
    });
  }

  const actions = Array.isArray(report?.authorityActions) ? [...report.authorityActions] : [];
  actions
    .filter((action) => action?.createdAt)
    .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime())
    .forEach((action, index) => {
      entries.push({
        id: `${action.action}-${action.createdAt}-${index}`,
        title: humanizeStatus(action.action),
        subtitle: action.authority?.name || "Authority action",
        timestamp: action.createdAt,
        note: action.remarks,
      });
    });

  return entries;
};

const getLatestAuthorityReview = (report) => {
  const actions = Array.isArray(report?.authorityActions) ? [...report.authorityActions] : [];
  const latestAction = actions
    .filter((action) => action?.createdAt)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())[0];

  if (!latestAction?.action) {
    return null;
  }

  if (!["VERIFIED", "REJECTED", "RESOLVED", "CLOSED"].includes(normalizeStatus(latestAction.action))) {
    return null;
  }

  return latestAction;
};

const ReadOnlyMap = ({ latitude, longitude, locationName }) => {
  const hasValidCoordinates = isValidLatitude(latitude) && isValidLongitude(longitude);
  const center = hasValidCoordinates ? [latitude, longitude] : [20.5937, 78.9629];

  if (!hasValidCoordinates) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/3 p-5 text-sm text-slate-400">
        No valid coordinates are available for this report.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#02070e]">
        <MapContainer center={center} zoom={14} scrollWheelZoom={false} className="h-[360px] w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={center} icon={reportMarkerIcon} />
        </MapContainer>
      </div>
      <div className="rounded-2xl border border-white/5 bg-white/3 p-4 text-sm text-slate-300">
        <div className="font-semibold text-white">{locationName || "Selected coordinates"}</div>
        <div className="mt-1 text-slate-400">{formatLatitudeLongitude(latitude, longitude)}</div>
      </div>
    </div>
  );
};

const AuthorityActionPanel = ({ report, onSubmitAction, isSubmitting }) => {
  const [dialogAction, setDialogAction] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [remarksError, setRemarksError] = useState("");

  const status = normalizeStatus(report?.status);
  const availableActions = useMemo(() => {
    if (status === "SUBMITTED" || status === "PENDING_AUTHORITY") {
      return [
        { action: "verify", label: "Verify", tone: "bg-cyan-400/10 text-cyan-200 border-cyan-400/20" },
        { action: "reject", label: "Reject", tone: "bg-red-400/10 text-red-200 border-red-400/20" },
      ];
    }

    if (status === "VERIFIED") {
      return [{ action: "resolve", label: "Resolve", tone: "bg-emerald-400/10 text-emerald-200 border-emerald-400/20" }];
    }

    if (status === "RESOLVED") {
      return [{ action: "close", label: "Close", tone: "bg-slate-400/10 text-slate-200 border-slate-400/20" }];
    }

    return [];
  }, [status]);

  const openDialog = (action) => {
    setRemarks("");
    setRemarksError("");
    setDialogAction(action);
  };

  const closeDialog = () => {
    setDialogAction(null);
    setRemarks("");
    setRemarksError("");
  };

  const handleConfirm = async () => {
    const nextRemarks = remarks.trim();

    if (!nextRemarks) {
      setRemarksError(dialogAction === "reject" ? "Rejection reason is required." : "Remarks are required.");
      return;
    }

    try {
      await onSubmitAction(dialogAction, nextRemarks);
      closeDialog();
    } catch {
      // The mutation already surfaced the backend error through a toast.
    }
  };

  return (
    <>
      <section className="glass-panel card-glow rounded-3xl border border-white/5 p-6 shadow-card-glow sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Authority Action Panel</h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">Only backend-supported transitions are shown for the current status.</p>
          </div>
          <ShieldAlert className="h-5 w-5 text-primary-light" aria-hidden="true" />
        </div>

        <div className="mt-5 rounded-2xl border border-white/5 bg-white/3 p-4 text-sm text-slate-300">
          <div className="flex items-center justify-between gap-3">
            <span>Current status</span>
            <StatusBadge status={report?.status} />
          </div>
          <div className="mt-2 text-slate-400">{availableActions.length > 0 ? "Choose an action to move this report forward." : "No authority action is available for this status."}</div>
        </div>

        {availableActions.length > 0 ? (
          <div className="mt-5 grid gap-3">
            {availableActions.map((actionConfig) => (
              <button
                key={actionConfig.action}
                type="button"
                onClick={() => openDialog(actionConfig.action)}
                disabled={isSubmitting}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 ${actionConfig.tone}`}
              >
                {actionConfig.label}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            ))}
          </div>
        ) : null}
      </section>

      {dialogAction ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-background-card/95 p-6 shadow-card-glow">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {dialogAction === "verify"
                    ? "Verify this incident?"
                    : dialogAction === "reject"
                      ? "Reject this incident?"
                      : dialogAction === "resolve"
                        ? "Resolve this incident?"
                        : "Close this incident?"}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Remarks are required for this action and will be saved with the report history.
                </p>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-white/20 hover:text-white"
                aria-label="Close dialog"
              >
                <XCircle className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <label className="mt-5 block">
              <span className="text-sm font-semibold text-slate-200">
                {dialogAction === "reject" ? "Rejection reason" : "Remarks"}
              </span>
              <textarea
                rows="5"
                value={remarks}
                onChange={(event) => {
                  setRemarks(event.target.value);
                  setRemarksError("");
                }}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                placeholder={dialogAction === "reject" ? "Explain why this report is being rejected." : "Add remarks for this authority action."}
              />
              {remarksError ? <span className="mt-2 block text-sm text-red-300">{remarksError}</span> : null}
            </label>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDialog}
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-white/20 hover:bg-white/8"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-glow-primary transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Processing..." : "Confirm Action"}
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

const ReportDetailsPage = ({ variant = "citizen" }) => {
  const { reportId } = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isPublicView = variant === "public";
  const reportQueryKey = ["reports", "detail", reportId, variant];

  const reportQuery = useQuery({
    queryKey: reportQueryKey,
    queryFn: () => getReport(reportId, isPublicView ? { scope: "public" } : {}),
    retry: false,
    staleTime: 1000 * 60 * 2,
    enabled: Boolean(reportId),
  });

  const report = useMemo(() => normalizeReport(reportQuery.data), [reportQuery.data]);
  const timelineEntries = useMemo(() => buildTimelineEntries(report), [report]);
  const imageEntries = useMemo(() => getImageEntries(report), [report]);
  const latestAuthorityReview = useMemo(() => getLatestAuthorityReview(report), [report]);
  const hasCoordinates = isValidLatitude(report?.latitude) && isValidLongitude(report?.longitude);

  const actionMutation = useMutation({
    mutationFn: async ({ action, remarks }) => {
      if (action === "verify") return verifyReport(reportId, remarks);
      if (action === "reject") return rejectReport(reportId, remarks);
      if (action === "resolve") return resolveReport(reportId, remarks);
      if (action === "close") return closeReport(reportId, remarks);
      throw new Error("Unsupported authority action.");
    },
    onSuccess: async (result) => {
      const nextReport = result?.data?.report || result?.report || result?.data?.data?.report;

      if (nextReport) {
        queryClient.setQueryData(reportQueryKey, { data: { report: nextReport } });
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboard", "authority"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard", "citizen"] }),
        queryClient.invalidateQueries({ queryKey: ["reports", "authority"] }),
        queryClient.invalidateQueries({ queryKey: ["reports", "citizen"] }),
        queryClient.invalidateQueries({ queryKey: ["reports", "community"] }),
        queryClient.invalidateQueries({ queryKey: ["reports", "detail", reportId] }),
      ]);

      showToast.success(result?.message || "Authority action completed successfully.");
    },
    onError: (error) => {
      showToast.error(error?.message || "Failed to update the report.");
    },
  });

  const handleSubmitAction = async (action, remarks) => {
    await actionMutation.mutateAsync({ action, remarks });
  };

  if (reportQuery.isLoading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-background bg-grid-pattern px-4 py-8 text-slate-100 sm:px-6 lg:px-8 lg:py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </main>
    );
  }

  if (reportQuery.isError || !report) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-background bg-grid-pattern px-4 py-8 text-slate-100 sm:px-6 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-4xl">
          <ErrorState message={reportQuery.error?.message || "Unable to load this report."} onRetry={() => reportQuery.refetch()} />
        </div>
      </main>
    );
  }

  const headerSubtitle =
    variant === "authority"
      ? "Review the full report record and apply the next authority action when appropriate."
      : isPublicView
        ? "Review the public community incident record. Private reporter details are hidden."
      : "Review the full report record and track its current status.";

  return (
    <main className="relative min-h-screen overflow-hidden bg-background bg-grid-pattern px-4 py-8 text-slate-100 sm:px-6 lg:px-8 lg:py-10">
      <div className="pointer-events-none absolute left-[-12%] top-[-10%] h-160 w-160 rounded-full bg-primary/10 blur-[140px]" />
      <div className="pointer-events-none absolute right-[-10%] top-[18%] h-144 w-xl rounded-full bg-accent/5 blur-[160px]" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-6 lg:gap-8">
        <header className="glass-panel card-glow overflow-hidden rounded-3xl border border-white/5 bg-background-card/80 p-6 shadow-card-glow sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <Link to={variant === "authority" ? "/authority" : "/reports"} className="inline-flex items-center gap-2 text-sm font-semibold text-primary-light transition-colors hover:text-white">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to dashboard
              </Link>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {report.reportNumber || report.id}
                </span>
                <StatusBadge status={report.status} />
              </div>

              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {report.title || "Untitled report"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">{headerSubtitle}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-slate-100">
              {isPublicView ? (
                <>
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <MessageSquareText className="h-4 w-4 text-accent-light" aria-hidden="true" />
                    Community report
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">Public view</div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <User className="h-4 w-4 text-accent-light" aria-hidden="true" />
                    {variant === "authority" ? user?.name || "Authority" : report.citizen?.name || "Citizen"}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{variant === "authority" ? "Authority review" : "Citizen report"}</div>
                </>
              )}
            </div>
          </div>
        </header>

        {latestAuthorityReview ? (
          <section className="glass-panel card-glow rounded-3xl border border-white/5 p-6 shadow-card-glow sm:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Authority Review</h2>
                <p className="mt-1 text-sm leading-6 text-slate-400">The latest authority outcome and review metadata for this report.</p>
              </div>
              <ShieldAlert className="h-5 w-5 text-primary-light" aria-hidden="true" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Status</p>
                <div className="mt-2">
                  <StatusBadge status={report.status} />
                </div>
              </div>

              {latestAuthorityReview.remarks ? (
                <div className={`rounded-2xl border p-4 ${normalizeStatus(latestAuthorityReview.action) === "REJECTED" ? "border-red-400/20 bg-red-400/10" : "border-white/5 bg-white/3"}`}>
                  <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${normalizeStatus(latestAuthorityReview.action) === "REJECTED" ? "text-red-200" : "text-slate-500"}`}>
                    {normalizeStatus(latestAuthorityReview.action) === "REJECTED" ? "Reason" : "Authority Remark"}
                  </p>
                  <p className={`mt-2 text-sm leading-6 ${normalizeStatus(latestAuthorityReview.action) === "REJECTED" ? "text-red-50" : "text-slate-300"}`}>
                    {latestAuthorityReview.remarks}
                  </p>
                </div>
              ) : null}

              <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Reviewed By</p>
                <p className="mt-2 text-sm font-semibold text-white">{latestAuthorityReview.authority?.name || "Unknown authority"}</p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Reviewed On</p>
                <p className="mt-2 text-sm font-semibold text-white">{formatDate(latestAuthorityReview.createdAt)}</p>
              </div>
            </div>
          </section>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_380px] lg:items-start">
          <div className="space-y-6">
            <section className="glass-panel card-glow rounded-3xl border border-white/5 p-6 shadow-card-glow sm:p-7">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Incident Information</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">Core report details submitted by the citizen.</p>
                </div>
                <FileText className="h-5 w-5 text-primary-light" aria-hidden="true" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Description</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{report.description || "No description provided."}</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Current status</p>
                  <p className="mt-2 text-sm font-semibold text-white">{humanizeStatus(report.status)}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">Last updated {formatDate(report.updatedAt || report.createdAt)}</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Submission date</p>
                  <p className="mt-2 text-sm font-semibold text-white">{formatDate(report.createdAt)}</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Last updated</p>
                  <p className="mt-2 text-sm font-semibold text-white">{formatDate(report.updatedAt || report.createdAt)}</p>
                </div>
              </div>
            </section>

            <section className="glass-panel card-glow rounded-3xl border border-white/5 p-6 shadow-card-glow sm:p-7">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Location</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    {isPublicView ? "General location shown for public browsing." : "Read-only coordinates and map view for the incident."}
                  </p>
                </div>
                <MapPinned className="h-5 w-5 text-primary-light" aria-hidden="true" />
              </div>

              {isPublicView ? (
                <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">General location</p>
                  <p className="mt-2 text-sm font-semibold text-white">{report.locationName || "Location not provided"}</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Location name</p>
                      <p className="mt-2 text-sm font-semibold text-white">{report.locationName || "Location not provided"}</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Coordinates</p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {hasCoordinates ? `${formatCoordinate(report.latitude)}, ${formatCoordinate(report.longitude)}` : "Coordinates not available"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <ReadOnlyMap latitude={report.latitude} longitude={report.longitude} locationName={report.locationName} />
                  </div>
                </>
              )}
            </section>

            <section className="glass-panel card-glow rounded-3xl border border-white/5 p-6 shadow-card-glow sm:p-7">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Images</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">View the incident attachments submitted with the report.</p>
                </div>
                <Signature className="h-5 w-5 text-accent-light" aria-hidden="true" />
              </div>

              {imageEntries.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {imageEntries.map((image) => (
                    <div key={image.id} className="overflow-hidden rounded-2xl border border-white/5 bg-white/3">
                      <div className="aspect-[4/3] bg-background-card/70">
                        <img src={image.url} alt={image.alt} className="h-full w-full object-cover" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={FileText} title="No images attached" description="This report does not include uploaded images." />
              )}
            </section>

            <section className="glass-panel card-glow rounded-3xl border border-white/5 p-6 shadow-card-glow sm:p-7">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Timeline</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">Only events returned by the backend are shown here.</p>
                </div>
                <CalendarClock className="h-5 w-5 text-primary-light" aria-hidden="true" />
              </div>

              {timelineEntries.length > 0 ? (
                <div className="space-y-4">
                  {timelineEntries.map((entry, index) => (
                    <div key={entry.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-slate-100">
                          {index + 1}
                        </span>
                        {index !== timelineEntries.length - 1 ? <span className="mt-2 h-full w-px bg-white/10" aria-hidden="true" /> : null}
                      </div>

                      <div className="min-w-0 flex-1 rounded-2xl border border-white/5 bg-white/3 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-white">{entry.title}</h3>
                          <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{formatDate(entry.timestamp)}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-400">{entry.subtitle}</p>
                        {entry.note ? <p className="mt-3 text-sm leading-6 text-slate-300">{entry.note}</p> : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={CalendarClock} title="No timeline available" description="The backend has not returned timeline events for this report yet." />
              )}
            </section>

          </div>

          {variant === "authority" ? (
            <AuthorityActionPanel report={report} onSubmitAction={handleSubmitAction} isSubmitting={actionMutation.isPending} />
          ) : isPublicView ? (
            <section className="glass-panel card-glow rounded-3xl border border-white/5 p-6 shadow-card-glow sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Community report</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">Private reporter details and authority internals are hidden in this public view.</p>
                </div>
                <MessageSquareText className="h-5 w-5 text-accent-light" aria-hidden="true" />
              </div>
              <div className="mt-5 rounded-2xl border border-white/5 bg-white/3 p-4 text-sm text-slate-400">
                Only public incident information is shown here.
              </div>
            </section>
          ) : (
            <section className="glass-panel card-glow rounded-3xl border border-white/5 p-6 shadow-card-glow sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Report summary</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">Readonly report details for the citizen view.</p>
                </div>
                <MessageSquareText className="h-5 w-5 text-accent-light" aria-hidden="true" />
              </div>
              <div className="mt-5 rounded-2xl border border-white/5 bg-white/3 p-4 text-sm text-slate-400">
                This shared details architecture can be reused for the citizen view without duplicating layout or data fetching.
              </div>
            </section>
          )}
        </section>
      </div>
    </main>
  );
};

export default ReportDetailsPage;