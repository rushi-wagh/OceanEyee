import { motion } from "framer-motion";
import {
  ChevronRight,
  ShieldCheck,
  MapPin,
  Activity,
} from "lucide-react";

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="relative pt-36 pb-20 px-6 overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none"></div>

      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-accent/5 blur-[100px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-950 border border-white/5 text-slate-300 text-xs font-semibold tracking-wide mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            OceanEye
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1] mb-6"
          >
            <motion.span
              animate={{ clipPath: ["inset(0 100% 0 0)", "inset(0 0% 0 0)", "inset(0 0% 0 0)", "inset(0 100% 0 0)", "inset(0 100% 0 0)"] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                times: [0, 0.45, 0.65, 0.95, 1],
                ease: "linear",
              }}
              className="inline-block bg-gradient-to-b from-white via-white/90 to-slate-400 bg-clip-text text-transparent border-r-2 border-white/80 pr-1 text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl leading-[1.1]"
            >
              Report. Verify. Protect.
            </motion.span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-slate-400 max-w-2xl font-normal leading-relaxed mb-10"
          >
            A platform for reporting and managing marine incidents. Citizens
            submit reports, authorities review them, and approved incidents
            become visible to everyone.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-16 w-full sm:w-auto"
          >
            <a
              href="/report"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-semibold text-white bg-primary hover:bg-primary-dark transition-all duration-200 py-3.5 px-7 rounded-xl shadow-glow-primary hover:scale-[1.02]"
            >
              Report Incident
              <ChevronRight className="w-4 h-4" />
            </a>

            <a
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-semibold text-slate-300 hover:text-white transition-all duration-200 py-3.5 px-7 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20"
            >
              Authority Dashboard
            </a>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-3xl w-full border-t border-white/5 pt-10"
          >
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-lg bg-navy-950/80 border border-white/5 flex items-center justify-center text-primary-light">
                <MapPin className="w-5 h-5" />
              </div>

              <div className="text-left">
                <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase">
                  Location
                </p>
                <p className="text-sm text-slate-300 font-medium">
                  GPS Location
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center">
              <div className="w-10 h-10 rounded-lg bg-navy-950/80 border border-white/5 flex items-center justify-center text-accent-light">
                <ShieldCheck className="w-5 h-5" />
              </div>

              <div className="text-left">
                <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase">
                  Review
                </p>
                <p className="text-sm text-slate-300 font-medium">
                  Authority Approval
                </p>
              </div>
            </div>

            <div className="col-span-2 md:col-span-1 flex items-center gap-3 justify-center md:justify-end">
              <div className="w-10 h-10 rounded-lg bg-navy-950/80 border border-white/5 flex items-center justify-center text-primary-light">
                <Activity className="w-5 h-5" />
              </div>

              <div className="text-left">
                <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase">
                  Visibility
                </p>
                <p className="text-sm text-slate-300 font-medium">
                  Public Incidents
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;