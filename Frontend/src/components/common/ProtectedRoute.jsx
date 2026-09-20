import { Navigate, Outlet, useLocation } from "react-router-dom";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useAuthStore } from "@/store/authStore";

const ProtectedRoute = ({ allowedRoles }) => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background bg-grid-pattern px-6 py-24 text-slate-100">
        <div className="mx-auto max-w-xl">
          <CardSkeleton />
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export { ProtectedRoute };
