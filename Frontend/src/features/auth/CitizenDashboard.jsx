import { useQuery } from "@tanstack/react-query";
console.log("[DEV] CitizenDashboard module loaded");
import { getDashboard } from "@/api/dashboard.api";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { showToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch (e) {
    return iso;
  }
}

function CitizenDashboard() {
  const { user } = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard", "citizen"],
    queryFn: getDashboard,
    retry: false,
    staleTime: 1000 * 60 * 2,
  });

  if (isError) {
    showToast.error(error?.message || "Failed to load dashboard");
  }

  const payload = data?.data || data || {};

  return (
    <main className="min-h-screen bg-background bg-grid-pattern px-6 py-12 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-3xl font-semibold">CITIZEN DASHBOARD (NEW) — Welcome{user?.name ? `, ${user.name}` : ""}</h1>

        {isLoading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="glass-panel card-glow rounded-2xl p-6">
              <h2 className="mb-2 text-sm text-slate-300">Total reports</h2>
              <p className="text-3xl font-semibold">{payload.totalReports ?? 0}</p>
            </div>

            <div className="glass-panel card-glow rounded-2xl p-6">
              <h2 className="mb-2 text-sm text-slate-300">Pending</h2>
              <p className="text-3xl font-semibold">{payload.pending ?? 0}</p>
            </div>

            <div className="glass-panel card-glow rounded-2xl p-6">
              <h2 className="mb-2 text-sm text-slate-300">Resolved</h2>
              <p className="text-3xl font-semibold">{payload.resolved ?? 0}</p>
            </div>
          </div>
        )}

        <section className="mt-8">
          <h3 className="mb-4 text-xl font-medium">Recent reports</h3>

          {isLoading ? (
            <CardSkeleton />
          ) : (
            <div className="space-y-3">
              {Array.isArray(payload.recentReports) && payload.recentReports.length > 0 ? (
                payload.recentReports.map((r) => (
                  <div
                    key={r.id}
                    className="glass-panel flex items-center justify-between gap-4 rounded-2xl p-4"
                  >
                    <div>
                      <div className="text-sm text-slate-300">{r.reportNumber || r.id}</div>
                      <div className="text-lg font-semibold">{r.title || r.description || "Untitled"}</div>
                      <div className="mt-1 text-sm text-slate-400">{r.locationName || `${r.latitude}, ${r.longitude}`}</div>
                    </div>
                    <div className="text-right">
                      <div className="mb-1 text-sm text-slate-300">{r.status}</div>
                      <div className="text-xs text-slate-400">{formatDate(r.createdAt)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="glass-panel rounded-2xl p-6 text-slate-400">No recent reports</div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default CitizenDashboard;
