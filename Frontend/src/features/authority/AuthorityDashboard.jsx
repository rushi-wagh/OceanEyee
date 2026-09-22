import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  FileText,
  Search,
  Shield,
  ShieldAlert,
} from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { humanizeStatus } from "@/components/ui/statusUtils";
import { useAuthStore } from "@/store/authStore";
import { useDashboardStore } from "@/store/dashboardStore";
import { useReportStore } from "@/store/reportStore";

const formatDate = (value) => {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value || "";
  }
};

const normalizePayload = (payload) => payload?.data ?? payload ?? {};

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

  const haystack = [report.reportNumber, report.id, report.title, report.description, report.locationName]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(term);
};

const getPrimaryImageUrl = (report) => {
  const firstImage = Array.isArray(report.images) ? report.images[0] : null;

  return firstImage?.url || firstImage?.secure_url || firstImage?.thumbnailUrl || "";
};

const deriveStatsFromReports = (reports) => {
  const pendingStatuses = new Set(["SUBMITTED", "PENDING_AUTHORITY"]);
  const verifiedStatuses = new Set(["VERIFIED"]);
  const resolvedStatuses = new Set(["RESOLVED", "CLOSED"]);

  return reports.reduce(
    (accumulator, report) => {
      accumulator.total += 1;

      const status = normalizeStatus(report.status);
      if (pendingStatuses.has(status)) {
        accumulator.pending += 1;
      }

      if (verifiedStatuses.has(status)) {
        accumulator.verified += 1;
      }

      if (resolvedStatuses.has(status)) {
        accumulator.resolved += 1;
      }

      return accumulator;
    },
    { total: 0, pending: 0, verified: 0, resolved: 0 },
  );
};

const AuthorityDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("newest");

  const fetchAuthorityDashboard = useDashboardStore((state) => state.fetchAuthorityDashboard);
  const fetchReports = useReportStore((state) => state.fetchReports);
  const authorityDashboard = useDashboardStore((state) => state.authorityDashboard);
  const authorityReports = useReportStore((state) => state.reports);
  const isLoadingAuthorityDashboard = useDashboardStore((state) => state.isLoadingAuthorityDashboard);
  const isLoadingReports = useReportStore((state) => state.isLoadingReports);
  const authorityError = useDashboardStore((state) => state.error);
  const reportError = useReportStore((state) => state.error);

  useEffect(() => {
    void fetchAuthorityDashboard();
    void fetchReports();
  }, [fetchAuthorityDashboard, fetchReports]);

  const dashboardPayload = normalizePayload(authorityDashboard);
  const primaryReports = useMemo(() => normalizeReports(authorityReports), [authorityReports]);
  const fallbackReports = useMemo(() => normalizeReports(dashboardPayload.recentReports), [dashboardPayload.recentReports]);
  const reports = primaryReports.length > 0 ? primaryReports : fallbackReports;

  const derivedStats = useMemo(() => deriveStatsFromReports(reports), [reports]);
  const dashboardStats = {
    total: dashboardPayload.totalReports ?? dashboardPayload.availableReports ?? derivedStats.total,
    pending: dashboardPayload.pendingReports ?? dashboardPayload.pending ?? derivedStats.pending,
    verified: dashboardPayload.verifiedReports ?? dashboardPayload.verified ?? derivedStats.verified,
    resolved: dashboardPayload.resolvedReports ?? dashboardPayload.resolved ?? derivedStats.resolved,
  };

  const availableStatuses = useMemo(() => {
    const statuses = new Set(reports.map((report) => normalizeStatus(report.status)).filter(Boolean));
    return ["ALL", ...Array.from(statuses)];
  }, [reports]);

  const filteredReports = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return reports
      .filter((report) => (statusFilter === "ALL" ? true : normalizeStatus(report.status) === statusFilter))
      .filter((report) => matchesSearch(report, term))
      .slice()
      .sort((left, right) => {
        const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
        const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;

        return sortOrder === "oldest" ? leftTime - rightTime : rightTime - leftTime;
      });
  }, [reports, searchTerm, sortOrder, statusFilter]);

  const isLoading = isLoadingAuthorityDashboard || isLoadingReports;
  const isEmptyReportsState = !isLoading && reports.length === 0;

  const errorMessage = reportError || authorityError || "Unable to load authority dashboard.";

  const statCards = [
    {
      label: "Available reports",
      value: dashboardStats.total,
      description: "Reports visible to the logged-in authority.",
      icon: FileText,
      accent: "from-primary/30 via-primary/10 to-transparent",
      iconTone: "text-primary-light",
    },
    {
      label: "Pending",
      value: dashboardStats.pending,
      description: "Reports waiting for authority review.",
      icon: Clock3,
      accent: "from-amber-400/30 via-amber-400/10 to-transparent",
      iconTone: "text-amber-200",
    },
    {
      label: "Verified",
      value: dashboardStats.verified,
      description: "Reports already verified by the workflow.",
      icon: BadgeCheck,
      accent: "from-cyan-400/30 via-cyan-400/10 to-transparent",
      iconTone: "text-cyan-200",
    },
    {
      label: "Resolved",
      value: dashboardStats.resolved,
      description: "Reports that have reached a final state.",
      icon: CheckCircle2,
      accent: "from-accent/30 via-accent/10 to-transparent",
      iconTone: "text-accent-light",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-background bg-grid-pattern px-4 py-8 text-slate-100 sm:px-6 lg:px-8 lg:py-10">
      <div className="pointer-events-none absolute left-[-12%] top-[-10%] h-160 w-160 rounded-full bg-primary/10 blur-[140px]" />
      <div className="pointer-events-none absolute right-[-10%] top-[18%] h-144 w-xl rounded-full bg-accent/5 blur-[160px]" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-6 lg:gap-8">
        <header className="glass-panel card-glow overflow-hidden rounded-3xl border border-white/5 bg-background-card/80 p-6 shadow-card-glow sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-navy-950/80 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-slate-300 shadow-inner">
                <Shield className="h-3.5 w-3.5 text-accent-light" aria-hidden="true" />
                OceanEye authority portal
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Authority Dashboard
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Review the reports available to your authority queue, track their status, and move quickly into review.
              </p>
              <p className="mt-4 text-sm font-semibold text-slate-300">
                Signed in as {user?.name || "Authority"}
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 sm:items-end">
              
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-all duration-200 hover:border-white/20 hover:bg-white/8 hover:text-white"
              >
                Log out
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => <CardSkeleton key={index} />)
            : statCards.map((stat) => {
                const StatIcon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/3 p-5 shadow-card-glow transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 sm:p-6"
                  >
                    <div className={`pointer-events-none absolute inset-0 bg-linear-to-br ${stat.accent} opacity-80`} />
                    <div className="relative flex h-full flex-col justify-between gap-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-background-card/80 ${stat.iconTone} shadow-glow-primary`}>
                          <StatIcon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/4 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                          Live
                        </span>
                      </div>

                      <div>
                        <h2 className="text-sm font-medium text-slate-300">{stat.label}</h2>
                        <p className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-[2rem]">{stat.value}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{stat.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                  placeholder="Search by report ID, title, or location"
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
                <option value="newest" className="bg-navy-950">
                  Newest first
                </option>
                <option value="oldest" className="bg-navy-950">
                  Oldest first
                </option>
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
        ) : reportError ? (
          <ErrorState message={errorMessage} />
        ) : isEmptyReportsState ? (
          <EmptyState
            icon={FileText}
            title="No reports available"
            description="There are no reports in the current authority queue yet."
          />
        ) : (
          <section className="grid gap-4">
            {filteredReports.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No reports match"
                description={
                  searchTerm || statusFilter !== "ALL"
                    ? "No reports match the current search or status filter."
                    : "No reports are available in the current authority queue."
                }
              />
            ) : (
              filteredReports.map((report) => {
                const imageUrl = getPrimaryImageUrl(report);
                const hasImage = Boolean(imageUrl);
                const normalizedStatus = normalizeStatus(report.status);
                const reviewPath = `/authority/reports/${report.id}`;
                const isClosedReport = normalizedStatus === "CLOSED";

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
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col justify-between gap-3 lg:w-52 lg:items-end lg:text-right">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          {normalizedStatus || "Unknown"}
                        </div>
                        {isClosedReport ? (
                          <>
                            <button
                              type="button"
                              disabled
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-400 opacity-70 cursor-not-allowed"
                              title="Closed reports cannot be reviewed"
                            >
                              Review Report
                              <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <Link
                              to={reviewPath}
                              title="View report details"
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-primary/50 hover:bg-primary/15"
                            >
                              View Details
                              <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                          </>
                        ) : (
                          <Link
                            to={reviewPath}
                            title="Review report"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-primary/40 hover:bg-primary/10"
                          >
                            Review Report
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </section>
        )}
      </div>
    </main>
  );
};

export default AuthorityDashboard;
