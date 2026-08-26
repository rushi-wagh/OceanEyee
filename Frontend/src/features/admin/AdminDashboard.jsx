import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, CheckCircle2, Clock3, FileText, Search, Shield, UserCog, UserRoundCog, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { getAdminDashboard } from "@/api/dashboard.api";
import { getUsers, updateUserRole } from "@/api/user.api";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { showToast } from "@/components/ui/showToast";
import { useAuth } from "@/hooks/useAuth";

const ROLE_OPTIONS = ["CITIZEN", "AUTHORITY", "ADMIN"];

const normalizePayload = (payload) => payload?.data ?? payload ?? {};

const roleLabel = (role) => {
  if (role === "CITIZEN") return "Citizen";
  if (role === "AUTHORITY") return "Authority";
  if (role === "ADMIN") return "Admin";
  return String(role || "Unknown");
};

const formatDate = (value) => {
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return "-";
  }
};

const getRoleToneClassName = (role) => {
  if (role === "ADMIN") {
    return "border-cyan-400/20 bg-cyan-400/10 text-cyan-200";
  }

  if (role === "AUTHORITY") {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
  }

  return "border-white/10 bg-white/[0.04] text-slate-300";
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [pendingRoles, setPendingRoles] = useState({});

  const dashboardQuery = useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn: getAdminDashboard,
    retry: false,
    staleTime: 1000 * 60 * 2,
  });

  const usersQuery = useQuery({
    queryKey: ["users", "admin"],
    queryFn: () => getUsers(),
    retry: false,
    staleTime: 1000 * 60,
  });

  const roleUpdateMutation = useMutation({
    mutationFn: ({ userId, role }) => updateUserRole(userId, role),
    onSuccess: async () => {
      showToast.success("User role updated successfully");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["users", "admin"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard", "admin"] }),
      ]);
    },
    onError: (error) => {
      showToast.error(error?.message || "Unable to update role");
    },
  });

  const dashboardPayload = normalizePayload(dashboardQuery.data);
  const usersPayload = normalizePayload(usersQuery.data);
  const users = useMemo(
    () => (Array.isArray(usersPayload.users) ? usersPayload.users : []),
    [usersPayload.users],
  );

  const totalAdmins = useMemo(() => users.filter((item) => item.role === "ADMIN").length, [users]);

  const filteredUsers = useMemo(() => {
    const loweredTerm = searchTerm.trim().toLowerCase();

    return users.filter((item) => {
      const roleMatch = roleFilter === "ALL" ? true : item.role === roleFilter;
      if (!roleMatch) {
        return false;
      }

      if (!loweredTerm) {
        return true;
      }

      const haystack = [item.name, item.email].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(loweredTerm);
    });
  }, [roleFilter, searchTerm, users]);

  const isLoading = dashboardQuery.isLoading || usersQuery.isLoading;
  const isError = dashboardQuery.isError || usersQuery.isError;
  const errorMessage = dashboardQuery.error?.message || usersQuery.error?.message || "Unable to load admin dashboard.";

  const statCards = [
    {
      label: "Total users",
      value: dashboardPayload.totalUsers ?? users.length,
      description: "All registered OceanEye accounts.",
      icon: Users,
      accent: "from-primary/30 via-primary/10 to-transparent",
      iconTone: "text-primary-light",
    },
    {
      label: "Authorities",
      value: dashboardPayload.authorities ?? 0,
      description: "Accounts assigned to incident review.",
      icon: Shield,
      accent: "from-emerald-400/30 via-emerald-400/10 to-transparent",
      iconTone: "text-emerald-200",
    },
    {
      label: "Administrators",
      value: dashboardPayload.administrators ?? totalAdmins,
      description: "Accounts with platform administration access.",
      icon: UserRoundCog,
      accent: "from-cyan-400/30 via-cyan-400/10 to-transparent",
      iconTone: "text-cyan-200",
    },
    {
      label: "Total reports",
      value: dashboardPayload.totalReports ?? dashboardPayload.reports ?? 0,
      description: "Incidents submitted on the platform.",
      icon: FileText,
      accent: "from-accent/30 via-accent/10 to-transparent",
      iconTone: "text-accent-light",
    },
  ];

  const reportOverviewCards = [
    {
      label: "Pending",
      value: dashboardPayload.pendingReports ?? 0,
      icon: Clock3,
      tone: "text-amber-200",
    },
    {
      label: "Verified",
      value: dashboardPayload.verifiedReports ?? 0,
      icon: Shield,
      tone: "text-cyan-200",
    },
    {
      label: "Resolved",
      value: dashboardPayload.resolvedReports ?? 0,
      icon: CheckCircle2,
      tone: "text-emerald-200",
    },
    {
      label: "Closed",
      value: dashboardPayload.closedReports ?? 0,
      icon: Building2,
      tone: "text-slate-200",
    },
  ];

  const handleRoleSelection = (targetUserId, nextRole) => {
    setPendingRoles((previous) => ({
      ...previous,
      [targetUserId]: nextRole,
    }));
  };

  const handleCancelRoleChange = (targetUserId) => {
    setPendingRoles((previous) => {
      const next = { ...previous };
      delete next[targetUserId];
      return next;
    });
  };

  const handleConfirmRoleChange = (targetUserId, nextRole) => {
    roleUpdateMutation.mutate(
      { userId: targetUserId, role: nextRole },
      {
        onSuccess: () => {
          handleCancelRoleChange(targetUserId);
        },
      },
    );
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background bg-grid-pattern px-4 py-8 text-slate-100 sm:px-6 lg:px-8 lg:py-10">
      <div className="pointer-events-none absolute left-[-12%] top-[-10%] h-160 w-160 rounded-full bg-primary/10 blur-[140px]" />
      <div className="pointer-events-none absolute right-[-10%] top-[18%] h-144 w-xl rounded-full bg-accent/5 blur-[160px]" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-6 lg:gap-8">
        <header className="glass-panel card-glow overflow-hidden rounded-3xl border border-white/5 bg-background-card/80 p-6 shadow-card-glow sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-navy-950/80 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-slate-300 shadow-inner">
                <UserCog className="h-3.5 w-3.5 text-accent-light" aria-hidden="true" />
                OceanEye admin portal
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Admin Dashboard
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Manage users, monitor incident activity, and oversee the OceanEye platform.
              </p>
              <p className="mt-4 text-sm font-semibold text-slate-300">
                Signed in as {user?.name || "Admin"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/community"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-all duration-200 hover:border-white/20 hover:bg-white/8 hover:text-white"
              >
                Community Reports
              </Link>
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

        <section className="glass-panel card-glow overflow-hidden rounded-3xl border border-white/5 p-6 shadow-card-glow sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Reports Overview</h2>
              <p className="mt-1 text-sm leading-6 text-slate-400">System-level report status distribution.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => <CardSkeleton key={index} />)
              : reportOverviewCards.map((item) => {
                  const ItemIcon = item.icon;

                  return (
                    <div key={item.label} className="rounded-2xl border border-white/5 bg-white/3 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-slate-300">{item.label}</p>
                        <ItemIcon className={`h-4 w-4 ${item.tone}`} aria-hidden="true" />
                      </div>
                      <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                    </div>
                  );
                })}
          </div>
        </section>

        <section className="glass-panel card-glow rounded-3xl border border-white/5 p-4 shadow-card-glow sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_220px]">
            <label className="block">
              <span className="text-sm font-semibold text-slate-200">Search users</span>
              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                  placeholder="Search by name or email"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-200">Role</span>
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
              >
                <option value="ALL" className="bg-navy-950">
                  All
                </option>
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role} className="bg-navy-950">
                    {roleLabel(role)}
                  </option>
                ))}
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
        ) : isError ? (
          <ErrorState message={errorMessage} onRetry={() => {
            dashboardQuery.refetch();
            usersQuery.refetch();
          }} />
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users found"
            description={
              users.length === 0
                ? "No users are currently registered on OceanEye."
                : "No users match the current search or role filter."
            }
          />
        ) : (
          <section className="grid gap-4">
            {filteredUsers.map((item) => {
              const currentRole = item.role;
              const selectedRole = pendingRoles[item.id] ?? currentRole;
              const hasPendingChange = selectedRole !== currentRole;

              const isSelf = user?.id === item.id;
              const isLastAdmin = item.role === "ADMIN" && totalAdmins === 1;
              const isUpdating = roleUpdateMutation.isPending && roleUpdateMutation.variables?.userId === item.id;
              const isRoleControlDisabled = isSelf || isUpdating;

              return (
                <article
                  key={item.id}
                  className="glass-panel card-glow rounded-3xl border border-white/5 p-4 shadow-card-glow sm:p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-white sm:text-lg">{item.name || "Unnamed user"}</h3>
                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${getRoleToneClassName(item.role)}`}>
                          {roleLabel(item.role)}
                        </span>
                      </div>

                      <p className="mt-1 break-all text-sm text-slate-300">{item.email}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                        Joined {formatDate(item.createdAt)}
                      </p>
                    </div>

                    <div className="w-full lg:w-[320px]">
                      <label className="block">
                        <span className="text-sm font-semibold text-slate-200">Change role</span>
                        <select
                          value={selectedRole}
                          disabled={isRoleControlDisabled}
                          onChange={(event) => handleRoleSelection(item.id, event.target.value)}
                          className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {ROLE_OPTIONS.map((role) => {
                            const shouldDisableRoleOption =
                              isLastAdmin && item.role === "ADMIN" && role !== "ADMIN";

                            return (
                              <option
                                key={role}
                                value={role}
                                className="bg-navy-950"
                                disabled={shouldDisableRoleOption}
                              >
                                {roleLabel(role)}
                              </option>
                            );
                          })}
                        </select>
                      </label>

                      {isSelf ? (
                        <p className="mt-2 text-xs text-amber-200">
                          You cannot change your own role.
                        </p>
                      ) : null}

                      {!isSelf && isLastAdmin ? (
                        <p className="mt-2 text-xs text-amber-200">
                          This account is the last administrator and cannot be demoted.
                        </p>
                      ) : null}

                      {hasPendingChange && !isSelf ? (
                        <div className="mt-3 rounded-2xl border border-primary/20 bg-primary/8 p-3">
                          <p className="text-sm text-slate-200">
                            Change {item.name || "this user"}'s role from {roleLabel(currentRole)} to {roleLabel(selectedRole)}?
                          </p>
                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleCancelRoleChange(item.id)}
                              disabled={isUpdating}
                              className="rounded-xl border border-white/10 bg-white/4 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-white/20 hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleConfirmRoleChange(item.id, selectedRole)}
                              disabled={isUpdating}
                              className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white shadow-glow-primary transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {isUpdating ? "Updating..." : "Confirm"}
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
};

export default AdminDashboard;
