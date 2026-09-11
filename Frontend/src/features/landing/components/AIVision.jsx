import { motion } from "framer-motion";
import {
  BrainCircuit,
  GitCompare,
  Map,
  Sparkles,
} from "lucide-react";

const AI_ITEMS = [
  {
    id: "vision",
    title: "Vision AI",
    description:
      "Analyze incident images to identify visible marine hazards and extract useful information from submitted evidence.",
    icon: BrainCircuit,
    color: "text-accent-light",
  },
  {
    id: "analysis",
    title: "Incident Analysis",
    description:
      "Combine incident descriptions, locations, and submitted evidence with duplicate and historical incident data to build a clearer picture of each event.",
    icon: GitCompare,
    color: "text-primary-light",
  },
  {
    id: "intelligence",
    title: "Incident Intelligence",
    description:
      "Assess incident priority and generate actionable recommendations from the analyzed data to support faster and better-informed decisions.",
    icon: Map,
    color: "text-accent-light",
  },
];

const AIVision = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section
      id="vision"
      className="relative py-24 px-6 overflow-hidden bg-[#030811]"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[130px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent-light text-xs font-mono font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Incident Intelligence
          </div>

          <p className="text-3xl font-extrabold text-white sm:text-4xl leading-tight mb-4">
            Intelligent analysis for marine incidents
          </p>

          <p className="text-slate-400 text-base leading-relaxed">
            OceanEye can use AI to analyze incident evidence, understand
            reported information, identify patterns, assess priority, and
            generate recommendations for authorities.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {AI_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className="glass-panel p-8 rounded-2xl border border-white/5 bg-background-card hover:bg-background-cardHover transition-colors duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6">
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>

                <h3 className="text-lg font-bold text-white mb-3">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default AIVision;