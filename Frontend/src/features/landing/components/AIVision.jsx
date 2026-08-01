import { motion } from "framer-motion";
import { BrainCircuit, Orbit, Compass, Sparkles } from "lucide-react";

const VISION_ITEMS = [
  {
    id: "auto-classification",
    title: "Computer Vision Intake",
    description: "Automated analysis of uploaded report images to identify specific marine hazard types (e.g., oil sheen, plastic congestion, navigation obstacles) and tag severity classes prior to dispatch triage.",
    icon: BrainCircuit,
    color: "text-accent-light"
  },
  {
    id: "satellite-ingest",
    title: "Satellite Telemetry Correlator",
    description: "Ingest automated synthetic-aperture radar (SAR) and optical satellite imagery to monitor offshore zones, auto-generating coordinate points for offshore spills that bypass typical vessel routes.",
    icon: Orbit,
    color: "text-primary-light"
  },
  {
    id: "predictive-drift",
    title: "Predictive Hazard Modeling",
    description: "Cross-reference active coordinates with NOAA sea-surface current vectors and wind telemetry. Compute hazard drift paths to alert surrounding harbor operations and fishing fleets.",
    icon: Compass,
    color: "text-accent-light"
  }
];

const AIVision = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <section id="vision" className="relative py-24 px-6 overflow-hidden bg-[#030811]">
      {/* Decorative radial glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[130px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          {/* Future Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent-light text-xs font-mono font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Module 2: Future AI Vision
          </div>
          <p className="text-3xl font-extrabold text-white sm:text-4xl leading-tight mb-4">
            Automated intelligence under development
          </p>
          <p className="text-slate-400 text-base leading-relaxed">
            Our roadmap integrates satellite telemetry and computer vision models into the active workspace, shifting response workflows from reactive triage to predictive containment.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {VISION_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className="glass-panel p-8 rounded-2xl border border-white/5 bg-background-card hover:bg-background-cardHover transition-colors duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6">
                    <Icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
                  <span>Development Stage</span>
                  <span className="text-accent-light bg-accent/5 px-2 py-0.5 rounded">R&D</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default AIVision;
