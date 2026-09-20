import { ArrowRight, Eye, Waves } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useAuthStore } from "@/store/authStore";
import { zodResolver } from "@/lib/zodResolver";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().trim().min(7, "Phone number is required"),
});

const getDashboardPath = (role) => {
  if (role === "AUTHORITY") return "/authority";
  if (role === "ADMIN") return "/admin";
  return "/citizen";
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const registerUserAction = useAuthStore((state) => state.register);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
    },
  });

  useEffect(() => {
    setFocus("name");
  }, [setFocus]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const registeredUser = await registerUserAction(data);
      navigate(getDashboardPath(registeredUser?.role), { replace: true });
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
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1fr_460px]">
        <div className="hidden lg:block">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-accent-light">
            <Waves className="h-4 w-4" aria-hidden="true" />
            Citizen reporting
          </div>
          <h1 className="max-w-2xl text-5xl font-bold leading-tight text-white">
            Join a coastal safety network built for real incidents.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-400">
            Create your account to submit verified location reports, attach incident media, and follow response progress.
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
            <p className="text-xs font-bold uppercase tracking-wider text-primary-light">Register</p>
            <h2 className="mt-3 text-3xl font-bold text-white">Create account</h2>
            <p className="mt-2 text-sm text-slate-400">Citizen accounts can report marine hazards and track status.</p>
          </div>

          <div className="space-y-5">
            <label className="block">
              <span className="text-sm font-semibold text-slate-200">Name</span>
              <input
                type="text"
                autoComplete="name"
                {...register("name")}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                placeholder="Your full name"
              />
              {errors.name && <span className="mt-2 block text-sm text-red-300">{errors.name.message}</span>}
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-200">Email</span>
              <input
                type="email"
                autoComplete="email"
                {...register("email")}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                placeholder="you@example.com"
              />
              {errors.email && <span className="mt-2 block text-sm text-red-300">{errors.email.message}</span>}
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-200">Password</span>
              <input
                type="password"
                autoComplete="new-password"
                {...register("password")}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                placeholder="Minimum 6 characters"
              />
              {errors.password && <span className="mt-2 block text-sm text-red-300">{errors.password.message}</span>}
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-200">Phone</span>
              <input
                type="tel"
                autoComplete="tel"
                {...register("phone")}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                placeholder="9876543210"
              />
              {errors.phone && <span className="mt-2 block text-sm text-red-300">{errors.phone.message}</span>}
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-glow-primary transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary-light hover:text-accent-light">
              Sign in
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default RegisterPage;
