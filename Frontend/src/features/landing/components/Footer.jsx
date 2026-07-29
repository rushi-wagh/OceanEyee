import React from "react";
import { Eye, Shield, ArrowUpRight } from "lucide-react";

function Footer() {
  return (
    <footer className="relative pt-24 pb-12 px-6 bg-[#02050c] border-t border-white/5 overflow-hidden">
      {/* Background glow decorator */}
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Final CTA Container */}
        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/5 bg-gradient-to-tr from-navy-950/80 to-background-card/50 flex flex-col md:flex-row items-center justify-between gap-8 mb-20 shadow-2xl">
          <div className="text-center md:text-left max-w-xl">
            <h3 className="text-2xl font-extrabold text-white sm:text-3xl mb-3">
              Bridge the coordinate gap
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed font-normal">
              Whether you are reporting a drifting hazard near your local shore or dispatching regional vessels, OceanEye synchronizes the response pipeline.
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
              Request Authority Access
            </a>
          </div>
        </div>

        {/* Footer Links & Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-6 pb-16 border-b border-white/5">
          {/* Brand Info */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <a href="#" className="flex items-center gap-2.5 group self-start">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-glow-primary">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">
                OceanEye
              </span>
            </a>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Integrated coastal incident tracking and routing. Built to establish transparency between citizens and marine response units.
            </p>
            <div className="flex items-center gap-2.5 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                All Systems Operational
              </span>
            </div>
          </div>

          {/* Links Column 1: Platform */}
          <div className="md:col-span-2.5 flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">
              Platform
            </h4>
            <a href="#platform" className="text-xs text-slate-400 hover:text-white transition-colors duration-150">Incident Feed</a>
            <a href="#map" className="text-xs text-slate-400 hover:text-white transition-colors duration-150">Live Coordinates Map</a>
            <a href="#workflow" className="text-xs text-slate-400 hover:text-white transition-colors duration-150">Operations SOPs</a>
          </div>

          {/* Links Column 2: Security */}
          <div className="md:col-span-2.5 flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">
              Security & Logs
            </h4>
            <span className="text-xs text-slate-400 flex items-center gap-1.5 cursor-not-allowed">
              Verification Audits
              <Shield className="w-3.5 h-3.5 text-slate-500" />
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1.5 cursor-not-allowed">
              Data Privacy
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1.5 cursor-not-allowed">
              Compliance Reports
            </span>
          </div>

          {/* Links Column 3: Resources */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">
              Resources
            </h4>
            <a
              href="https://github.com/rushi-wagh/OceanEyee"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-400 hover:text-white transition-colors duration-150 flex items-center gap-1"
            >
              Backend Codebase
              <ArrowUpRight className="w-3 h-3 text-slate-500" />
            </a>
            <span className="text-xs text-slate-400 cursor-not-allowed flex items-center gap-1">
              API Documentation
            </span>
            <span className="text-xs text-slate-400 cursor-not-allowed flex items-center gap-1">
              Safety Support
            </span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} OceanEye Maritime. All rights reserved.</p>
          <div className="flex gap-6 items-center">
            <span>Security Framework v1.0</span>
            <span>•</span>
            <a
              href="https://github.com/rushi-wagh/OceanEyee"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors duration-150 flex items-center gap-1"
              aria-label="GitHub Repository"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Source
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
