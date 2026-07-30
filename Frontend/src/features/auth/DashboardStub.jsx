import { useAuth } from "@/hooks/useAuth";

function DashboardStub({ title }) {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen bg-background bg-grid-pattern px-6 py-24 text-slate-100">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        <p className="mt-3 text-slate-400">Signed in as {user?.name}</p>
        <button
          type="button"
          onClick={logout}
          className="mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white"
        >
          Log out
        </button>
      </div>
    </main>
  );
}

export { DashboardStub };
