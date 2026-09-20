import { ArrowRight, Eye, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useAuthStore } from "@/store/authStore";
import { zodResolver } from "@/lib/zodResolver";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const getDashboardPath = (role) => {
  if (role === "AUTHORITY") return "/authority";
  if (role === "ADMIN") return "/admin";
  return "/citizen";
};

const LoginPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const login = useAuthStore((state) => state.login);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    setFocus("email");
  }, [setFocus]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const loggedInUser = await login(data);
      navigate(getDashboardPath(loggedInUser?.role), { replace: true });
    } catch {
      // Errors are handled by the auth store and surfaced as toasts.
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background bg-grid-pattern px-6 py-10 text-slate-100">
        <div className="mx-auto max-w-xl py-24">
          <CardSkeleton />
        </div>
      </main>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={getDashboardPath(user?.role)} replace />;
  }

  return (
    <main className="min-h-screen bg-background bg-grid-pattern px-6 py-10 text-slate-100">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1fr_440px]">
        <div className="hidden lg:block">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-light">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Secure access
          </div>
          <h1 className="max-w-2xl text-5xl font-bold leading-tight text-white">
            Continue protecting coastal waters with OceanEye.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-400">
            Sign in to report incidents, track verification progress, and help authorities respond with better context.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="glass-panel card-glow rounded-3xl p-7 shadow-card-glow"
          noValidate
        >
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-primary-light">
            <Eye className="h-5 w-5" aria-hidden="true" />
            OceanEye
          </Link>

          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-wider text-primary-light">Login</p>
            <h2 className="mt-3 text-3xl font-bold text-white">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-400">Use your registered email and password.</p>
          </div>

          <div className="space-y-5">
            <label className="block">
              <span className="text-sm font-semibold text-slate-200">Email</span>
              <input
                type="email"
                autoComplete="email"
                {...register("email")}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                placeholder="citizen@oceaneeye.com"
              />
              {errors.email && <span className="mt-2 block text-sm text-red-300">{errors.email.message}</span>}
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-200">Password</span>
              <input
                type="password"
                autoComplete="current-password"
                {...register("password")}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                placeholder="Enter your password"
              />
              {errors.password && <span className="mt-2 block text-sm text-red-300">{errors.password.message}</span>}
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-glow-primary transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>

          <p className="mt-6 text-center text-sm text-slate-400">
            New to OceanEye?{" "}
            <Link to="/register" className="font-semibold text-primary-light hover:text-accent-light">
              Create an account
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
