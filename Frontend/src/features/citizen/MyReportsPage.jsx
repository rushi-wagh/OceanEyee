import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, FileText, Search, SortAsc, SortDesc } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { humanizeStatus } from "@/components/ui/statusUtils";
import { useAuthStore } from "@/store/authStore";
import { useReportStore } from "@/store/reportStore";

const formatDate = (value) => {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value || "";
  }
};

const normalizeReports = (payload) => {
  if (Array.isArray(payload?.data?.reports)) {
    return payload.data.reports;
  }

  if (Array.isArray(payload?.reports)) {
    return payload.reports;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  return [];
};

const normalizeStatus = (status) => String(status || "").trim().toUpperCase();

const matchesSearch = (report, term) => {
  if (!term) {
    return true;
  }

  const haystack = [report.reportNumber, report.title, report.description, report.locationName]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(term);
};

const getPrimaryImageUrl = (report) => {
  const firstImage = Array.isArray(report.images) ? report.images[0] : null;

  return firstImage?.url || firstImage?.secure_url || firstImage?.thumbnailUrl || "";
};

const getImageCount = (report) => (Array.isArray(report.images) ? report.images.length : 0);

const getDetailEntries = (report) => {
  const entries = [
    { label: "Report number", value: report.reportNumber || report.id },
    { label: "Status", value: humanizeStatus(report.status) },
    { label: "Location", value: report.locationName || "Location not provided" },
    { label: "Submitted", value: formatDate(report.createdAt) },
  ];

  if (report.latitude != null && report.longitude != null) {
    entries.push({ label: "Coordinates", value: `${report.latitude}, ${report.longitude}` });
  }

  if (report.updatedAt) {
    entries.push({ label: "Last updated", value: formatDate(report.updatedAt) });
  }

  entries.push({ label: "Images", value: String(getImageCount(report)) });

  return entries;
};

const MyReportsPage = () => {
  const user = useAuthStore((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("newest");
  const [expandedReportId, setExpandedReportId] = useState(null);

  const fetchCitizenReports = useReportStore((state) => state.fetchCitizenReports);
  const citizenReports = useReportStore((state) => state.citizenReports);
  const isLoading = useReportStore((state) => state.isLoadingCitizenReports);
  const isError = Boolean(useReportStore((state) => state.citizenError));
  const error = useReportStore((state) => state.citizenError);

  useEffect(() => {
    if (user?.id) {
      void fetchCitizenReports();
    }
  }, [user?.id, fetchCitizenReports]);

  const reports = useMemo(() => normalizeReports(citizenReports), [citizenReports]);

  const availableStatuses = useMemo(() => {
    const statuses = new Set(reports.map((report) => normalizeStatus(report.status)).filter(Boolean));
    return ["ALL", ...Array.from(statuses)];
  }, [reports]);

  const filteredReports = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const nextReports = reports
      .filter((report) => (statusFilter === "ALL" ? true : normalizeStatus(report.status) === statusFilter))
      .filter((report) => matchesSearch(report, term))
      .slice()
      .sort((left, right) => {
        const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
        const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;

        return sortOrder === "oldest" ? leftTime - rightTime : rightTime - leftTime;
      });

    return nextReports;
  }, [reports, searchTerm, sortOrder, statusFilter]);

  const summary = useMemo(() => {
    const pendingStatuses = new Set(["SUBMITTED", "PENDING_AUTHORITY"]);
    const resolvedStatuses = new Set(["RESOLVED", "CLOSED"]);

    return reports.reduce(
      (accumulator, report) => {
        accumulator.total += 1;

        const status = normalizeStatus(report.status);
        if (pendingStatuses.has(status)) {
          accumulator.pending += 1;
        }

        if (resolvedStatuses.has(status)) {
          accumulator.resolved += 1;
        }

        return accumulator;
      },
      { total: 0, pending: 0, resolved: 0 },
    );
  }, [reports]);

    const isEmptyReportsState = isError && error?.statusCode === 404;
  const emptyDescription =
    searchTerm || statusFilter !== "ALL"
      ? "No reports match the current search or status filter."
      : "Submit your first incident report to start tracking its status here.";

  const toggleReportDetails = (reportId) => {
    setExpandedReportId((currentReportId) => (currentReportId === reportId ? null : reportId));
  };

  const handleRetry = () => {
    void fetchCitizenReports();
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background bg-grid-pattern px-4 py-8 text-slate-100 sm:px-6 lg:px-8 lg:py-10">
      <div className="absolute top-[-10%] left-[-12%] h-160 w-160 rounded-full bg-primary/10 blur-[140px] pointer-events-none" />
      <div className="absolute right-[-10%] top-[18%] h-144 w-xl rounded-full bg-accent/5 blur-[160px] pointer-events-none" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-6 lg:gap-8">
        <header className="glass-panel card-glow overflow-hidden rounded-3xl border border-white/5 bg-background-card/80 p-6 shadow-card-glow sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <Link to="/citizen" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-light transition-colors hover:text-white">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to dashboard
              </Link>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                My Reports
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Review the incidents you have submitted and track their latest status in one place.
              </p>
            </div>

            <Link
              to="/report"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-glow-primary transition hover:bg-primary-light"
            >
              Report an Incident
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="glass-panel card-glow rounded-3xl border border-white/5 p-5 shadow-card-glow">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Total reports</p>
                <p className="mt-2 text-3xl font-semibold text-white">{summary.total}</p>
              </div>
              <FileText className="h-5 w-5 text-primary-light" aria-hidden="true" />
            </div>
          </div>
          <div className="glass-panel card-glow rounded-3xl border border-white/5 p-5 shadow-card-glow">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Pending</p>
                <p className="mt-2 text-3xl font-semibold text-white">{summary.pending}</p>
              </div>
              <SortDesc className="h-5 w-5 text-amber-200" aria-hidden="true" />
            </div>
          </div>
          <div className="glass-panel card-glow rounded-3xl border border-white/5 p-5 shadow-card-glow">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Resolved</p>
                <p className="mt-2 text-3xl font-semibold text-white">{summary.resolved}</p>
              </div>
              <SortAsc className="h-5 w-5 text-accent-light" aria-hidden="true" />
            </div>
          </div>
        </section>

        <section className="glass-panel card-glow rounded-3xl border border-white/5 p-4 shadow-card-glow sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_220px_180px]">
            <label className="block">
              <span className="text-sm font-semibold text-slate-200">Search</span>
              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                  placeholder="Search by report number, title, or location"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-200">Status</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
              >
                {availableStatuses.map((status) => (
                  <option key={status} value={status} className="bg-navy-950">
                    {status === "ALL" ? "All statuses" : humanizeStatus(status)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-200">Sort</span>
              <select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
              >
                <option value="newest" className="bg-navy-950">Newest</option>
                <option value="oldest" className="bg-navy-950">Oldest</option>
              </select>
            </label>
          </div>
        </section>

        {isLoading ? (
          <section className="grid gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </section>
        ) : isEmptyReportsState ? (
          <EmptyState
            icon={FileText}
            title="No reports yet"
            description={emptyDescription}
            actionLabel="Report an Incident"
            actionHref="/report"
            actionIcon={ArrowRight}
          />
        ) : isError ? (
          <ErrorState message={error || "Unable to load your reports."} onRetry={handleRetry} />
        ) : filteredReports.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No reports yet"
            description={searchTerm || statusFilter !== "ALL" ? "No reports match the current search or status filter." : "Submit your first incident report to start tracking its status here."}
            actionLabel="Report an Incident"
            actionHref="/report"
            actionIcon={ArrowRight}
          />
        ) : (
          <section className="grid gap-4">
            {filteredReports.map((report) => {
              const imageUrl = getPrimaryImageUrl(report);
              const hasImage = Boolean(imageUrl);
              const normalizedStatus = normalizeStatus(report.status);
              const isExpanded = expandedReportId === report.id;
              const detailEntries = getDetailEntries(report);

              return (
                <article
                  key={report.id}
                  className="glass-panel card-glow overflow-hidden rounded-3xl border border-white/5 shadow-card-glow transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-stretch">
                    <div className="flex min-w-0 flex-1 gap-3 sm:gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-background-card sm:h-18 sm:w-18">
                        {hasImage ? (
                          <img
                            src={imageUrl}
                            alt={report.title || report.reportNumber || "Report preview"}
                            className="h-full w-full object-cover"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <FileText className="h-6 w-6 text-primary-light" aria-hidden="true" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                            {report.reportNumber || report.id}
                          </div>
                          <StatusBadge status={report.status} />
                        </div>
                        <h2 className="mt-2 text-base font-semibold text-white sm:text-lg">
                          {report.title || "Untitled report"}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                          {report.description || "No description provided."}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400 sm:text-sm">
                          <span>{report.locationName || "Location not provided"}</span>
                          <span>{formatDate(report.createdAt)}</span>
                          <span>{getImageCount(report)} image{getImageCount(report) === 1 ? "" : "s"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between gap-3 lg:w-48 lg:items-end lg:text-right">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{normalizedStatus || "Unknown"}</div>
                      <button
                        type="button"
                        onClick={() => toggleReportDetails(report.id)}
                        aria-expanded={isExpanded}
                        aria-controls={`report-details-${report.id}`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-primary/40 hover:bg-primary/10"
                      >
                        {isExpanded ? "Hide Details" : "View Details"}
                        {isExpanded ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded ? (
                    <div id={`report-details-${report.id}`} className="border-t border-white/5 bg-white/[0.02] px-4 py-4 sm:px-5">
                      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
                        <div className="space-y-4">
                          <div className="grid gap-3 sm:grid-cols-2">
                            {detailEntries.map((entry) => (
                              <div key={entry.label} className="rounded-2xl border border-white/5 bg-background-card/70 p-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{entry.label}</p>
                                <p className="mt-2 text-sm font-medium text-slate-100">{entry.value}</p>
                              </div>
                            ))}
                          </div>

                          <div className="rounded-2xl border border-white/5 bg-background-card/70 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Description</p>
                            <p className="mt-2 text-sm leading-6 text-slate-300">
                              {report.description || "No description provided."}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/5 bg-background-card/70 p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Quick actions</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => toggleReportDetails(report.id)}
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-primary/40 hover:bg-primary/10"
                            >
                              Hide Details
                            </button>
                            <Link
                              to="/report"
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-glow-primary transition hover:bg-primary-light"
                            >
                              Submit Another
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
};

export default MyReportsPage;
