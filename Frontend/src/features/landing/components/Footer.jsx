import { Eye, ShieldCheck, ArrowUpRight } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative pt-24 pb-12 px-6 bg-[#02050c] border-t border-white/5 overflow-hidden">
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none"></div>

       <div className="max-w-7xl mx-auto relative z-10">

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
