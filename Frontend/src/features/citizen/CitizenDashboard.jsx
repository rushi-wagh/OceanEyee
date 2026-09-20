import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileText,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { showToast } from "@/components/ui/showToast";
import { useAuthStore } from "@/store/authStore";
import { useDashboardStore } from "@/store/dashboardStore";

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const CitizenDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const fetchCitizenDashboard = useDashboardStore((state) => state.fetchCitizenDashboard);
  const citizenDashboard = useDashboardStore((state) => state.citizenDashboard);
  const isLoading = useDashboardStore((state) => state.isLoadingCitizenDashboard);
  const error = useDashboardStore((state) => state.error);

  useEffect(() => {
    if (user?.id) {
      void fetchCitizenDashboard();
    }
  }, [user?.id, fetchCitizenDashboard]);

  useEffect(() => {
    if (error) {
      showToast.error(error || "Failed to load dashboard");
    }
  }, [error]);

  const payload = citizenDashboard?.data || citizenDashboard || {};
  const totalReports = payload.totalReports ?? 0;
  const pendingReports = payload.pending ?? 0;
  const resolvedReports = payload.resolved ?? 0;
  const recentReports = Array.isArray(payload.recentReports) ? payload.recentReports : [];

  const statCards = [
    {
      label: "Total reports",
      value: totalReports,
      description: "All reports submitted from your account.",
      icon: FileText,
      accent: "from-primary/30 via-primary/10 to-transparent",
      iconTone: "text-primary-light",
    },
    {
      label: "Pending review",
      value: pendingReports,
      description: "Reports still moving through verification.",
      icon: Clock3,
      accent: "from-amber-400/30 via-amber-400/10 to-transparent",
      iconTone: "text-amber-200",
    },
    {
      label: "Resolved",
      value: resolvedReports,
      description: "Reports that have been closed out.",
      icon: CheckCircle2,
      accent: "from-accent/30 via-accent/10 to-transparent",
      iconTone: "text-accent-light",
    },
  ];

  const quickActions = [
    {
      label: "Report an Incident",
      description: "Start a new incident report with precise location details.",
      href: "/report",
      icon: PlusCircle,
      featured: true,
    },
    {
      label: "View My Reports",
      description: "Open the list of your submitted reports and their status.",
      href: "/reports",
      icon: ClipboardList,
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-background bg-grid-pattern px-4 py-8 text-slate-100 sm:px-6 lg:px-8 lg:py-10">
      <div className="absolute top-[-10%] left-[-12%] h-160 w-160 rounded-full bg-primary/10 blur-[140px] pointer-events-none" />
      <div className="absolute right-[-10%] top-[18%] h-144 w-xl rounded-full bg-accent/5 blur-[160px] pointer-events-none" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-6 lg:gap-8">
        <header className="glass-panel card-glow overflow-hidden rounded-3xl border border-white/5 bg-background-card/80 p-6 shadow-card-glow sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-navy-950/80 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-slate-300 shadow-inner">
                <Sparkles className="h-3.5 w-3.5 text-accent-light" aria-hidden="true" />
                OceanEye citizen portal
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Welcome back{user?.name ? `, ${user.name}` : ""}.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Review your incident activity, check live status updates, and start a new report whenever you need to.
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-all duration-200 hover:border-white/20 hover:bg-white/8 hover:text-white"
            >
              Log out
            </button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)]">
          <div className="grid gap-4 sm:grid-cols-3">
            {isLoading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : (
              statCards.map((stat) => {
                const StatIcon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/3 p-5 shadow-card-glow transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 sm:p-6"
                  >
                    <div className={`absolute inset-0 bg-linear-to-br ${stat.accent} opacity-80 pointer-events-none`} />
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
              })
            )}
          </div>

          <aside className="glass-panel card-glow overflow-hidden rounded-3xl border border-white/5 p-6 shadow-card-glow sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Quick actions</h2>
                <p className="mt-1 text-sm leading-6 text-slate-400">Jump straight into reporting or review your submitted incidents.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/4 p-3 text-accent-light shadow-glow-accent">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {quickActions.map((action) => {
                const ActionIcon = action.icon;

                return (
                  <Link
                    key={action.label}
                    to={action.href}
                    className={`group flex items-start gap-4 rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 ${
                      action.featured
                        ? "border-primary/25 bg-primary/10 shadow-glow-primary hover:border-primary/40 hover:bg-primary/15"
                        : "border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/6"
                    }`}
                  >
                    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${action.featured ? "border border-primary/20 bg-primary/15 text-primary-light" : "border border-white/10 bg-white/4 text-accent-light"}`}>
                      <ActionIcon className="h-5 w-5" aria-hidden="true" />
                    </span>

                    <span className="min-w-0 flex-1 text-left">
                      <span className="flex items-center gap-2 text-base font-semibold text-white">
                        {action.label}
                        <ArrowRight className="h-4 w-4 opacity-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden="true" />
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-slate-400">{action.description}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </aside>
        </section>

        <section className="glass-panel card-glow overflow-hidden rounded-3xl border border-white/5 p-6 shadow-card-glow sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Recent reports</h2>
              <p className="mt-1 text-sm leading-6 text-slate-400">Your latest submissions and their current status at a glance.</p>
            </div>
          </div>

          <div className="mt-6">
            {isLoading ? (
              <CardSkeleton />
            ) : recentReports.length > 0 ? (
              <div className="space-y-3">
                {recentReports.map((r) => {
                  const status = String(r.status || "").toLowerCase();
                  const statusClasses =
                    status === "resolved"
                      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                      : status === "pending" || status === "in review"
                        ? "border-amber-400/20 bg-amber-400/10 text-amber-200"
                        : "border-white/10 bg-white/[0.04] text-slate-300";

                  return (
                    <div
                      key={r.id}
                      className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/3 p-4 transition-colors duration-200 hover:border-primary/20 hover:bg-white/5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{r.reportNumber || r.id}</div>
                        <div className="mt-1 text-lg font-semibold text-white">{r.title || r.description || "Untitled"}</div>
                        <div className="mt-1 text-sm text-slate-400">{r.locationName || `${r.latitude}, ${r.longitude}`}</div>
                      </div>

                      <div className="flex items-end justify-between gap-4 sm:flex-col sm:items-end sm:text-right">
                        <div className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${statusClasses}`}>
                          {r.status || "Unknown"}
                        </div>
                        <div className="text-xs text-slate-400">{formatDate(r.createdAt)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={ClipboardList}
                title="No recent reports yet"
                description="Submit a new incident report to start tracking status updates, review history, and resolution progress here."
                actionLabel="Report an Incident"
                actionHref="/report"
                actionIcon={ArrowRight}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default CitizenDashboard;
