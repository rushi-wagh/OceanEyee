import { Eye, ShieldCheck, ArrowUpRight } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative pt-24 pb-12 px-6 bg-[#02050c] border-t border-white/5 overflow-hidden">
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/5 bg-gradient-to-tr from-navy-950/80 to-background-card/50 flex flex-col md:flex-row items-center justify-between gap-8 mb-20 shadow-2xl">
          <div className="text-center md:text-left max-w-xl">
            <h3 className="text-2xl font-extrabold text-white sm:text-3xl mb-3">
              Help report marine incidents
            </h3>

            <p className="text-sm text-slate-400 leading-relaxed font-normal">
              Report a marine incident and help authorities identify and respond
              to hazards in your area.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto justify-center">
            <a
              href="/report"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark transition-all duration-200 py-3 px-6 rounded-xl shadow-glow-primary hover:scale-[1.02]"
            >
              Report Incident
            </a>

            <a
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-300 hover:text-white transition-all duration-200 py-3 px-6 rounded-xl border border-white/10 hover:bg-white/5"
            >
              Authority Login
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-6 pb-16 border-b border-white/5">
          <div className="md:col-span-6 flex flex-col gap-4">
            <a href="#" className="flex items-center gap-2.5 group self-start">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-glow-primary">
                <Eye className="w-5 h-5 text-white" />
              </div>

              <span className="font-extrabold text-white text-base tracking-tight">
                OceanEye
              </span>
            </a>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              A marine incident reporting platform that connects citizens with
              authorities through a simple reporting and verification workflow.
            </p>
          </div>

          <div className="md:col-span-3 flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">
              Platform
            </h4>

            <a
              href="#features"
              className="text-xs text-slate-400 hover:text-white transition-colors duration-150"
            >
              Features
            </a>

            <a
              href="#workflow"
              className="text-xs text-slate-400 hover:text-white transition-colors duration-150"
            >
              How It Works
            </a>

            <a
              href="#faq"
              className="text-xs text-slate-400 hover:text-white transition-colors duration-150"
            >
              FAQ
            </a>
          </div>

          <div className="md:col-span-3 flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">
              Access
            </h4>

            <a
              href="/report"
              className="text-xs text-slate-400 hover:text-white transition-colors duration-150"
            >
              Report Incident
            </a>

            <a
              href="/login"
              className="text-xs text-slate-400 hover:text-white transition-colors duration-150 flex items-center gap-1"
            >
              Login <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
            </a>

            <a
              href="https://github.com/rushi-wagh/OceanEyee"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-400 hover:text-white transition-colors duration-150 flex items-center gap-1"
            >
              GitHub
              <ArrowUpRight className="w-3 h-3 text-slate-500" />
            </a>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} OceanEye. All rights reserved.</p>

          <a
            href="https://github.com/rushi-wagh/OceanEyee"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors duration-150 flex items-center gap-1"
            aria-label="GitHub Repository"
          >
            GitHub
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
