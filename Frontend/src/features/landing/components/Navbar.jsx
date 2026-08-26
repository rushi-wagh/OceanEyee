import { useEffect, useState } from "react";
import { ChevronRight, Eye, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const getDashboardMeta = (role) => {
  if (role === "AUTHORITY") {
    return { label: "Authority Dashboard", href: "/authority" };
  }

  if (role === "ADMIN") {
    return { label: "Admin Dashboard", href: "/admin" };
  }

  return { label: "Dashboard", href: "/citizen" };
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const dashboardMeta = isAuthenticated ? getDashboardMeta(user?.role) : null;

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  return (
    <nav
      className={`fixed left-3 right-3 top-3 z-50 transition-all duration-300 sm:left-6 sm:right-6 sm:top-4 ${
        isScrolled
          ? "glass-panel rounded-3xl py-4 border border-white/5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-3xl px-5 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group" onClick={() => setIsOpen(false)}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-glow-primary transition-transform duration-300 group-hover:scale-105">
            <Eye className="w-5.5 h-5.5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              OceanEye
            </span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase -mt-1">
              Maritime Response
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200">
            Home
          </Link>
          <Link to="/community" className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200">
            Community Reports
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors py-2.5 px-4">
                Login
              </Link>
              <Link to="/register" className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark transition-all duration-200 py-2.5 px-5 rounded-xl shadow-glow-primary hover:scale-[1.02]">
                Register
                <ChevronRight className="w-4 h-4" />
              </Link>
            </>
          ) : (
            <>
              <Link to={dashboardMeta.href} className="text-sm font-semibold text-slate-300 hover:text-white transition-colors py-2.5 px-4">
                {dashboardMeta.label}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark transition-all duration-200 py-2.5 px-5 rounded-xl shadow-glow-primary hover:scale-[1.02]"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-slate-400 hover:text-white focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass-panel border-b border-white/5 py-6 px-6 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-5">
            <Link to="/" onClick={() => setIsOpen(false)} className="text-base font-medium text-slate-300 hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/community" onClick={() => setIsOpen(false)} className="text-base font-medium text-slate-300 hover:text-white transition-colors">
              Community Reports
            </Link>
            <div className="h-px bg-white/5 my-2"></div>
            <div className="flex flex-col gap-4">
              {!isAuthenticated ? (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="text-center py-3 text-base font-semibold text-slate-300 hover:text-white transition-colors rounded-xl border border-white/5 hover:bg-white/5">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="text-center py-3 text-base font-semibold text-white bg-primary hover:bg-primary-dark transition-all rounded-xl shadow-glow-primary">
                    Register
                  </Link>
                </>
              ) : (
                <>
                  <Link to={dashboardMeta.href} onClick={() => setIsOpen(false)} className="text-center py-3 text-base font-semibold text-slate-300 hover:text-white transition-colors rounded-xl border border-white/5 hover:bg-white/5">
                    {dashboardMeta.label}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-center py-3 text-base font-semibold text-white bg-primary hover:bg-primary-dark transition-all rounded-xl shadow-glow-primary"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
