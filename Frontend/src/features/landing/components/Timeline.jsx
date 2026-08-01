import { motion } from "framer-motion";
import { Landmark, Compass, ClipboardCheck, CheckCircle2 } from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "Incident Submission",
    description: "Citizens report coastal hazards, oil spills, or vessel blockages. Reports include GPS coordinates, structural details, and optional photo attachments.",
    icon: Compass,
    color: "text-primary-light"
  },
  {
    number: "02",
    title: "Intake and Triage",
    description: "The report is validated geographically. The system maps the location coordinates and flags it for immediate dispatcher review within the authority queue.",
    icon: Landmark,
    color: "text-accent-light"
  },
  {
    number: "03",
    title: "Coordination & Verification",
    description: "A duty dispatcher evaluates the incident, assigns a regional response authority, coordinates details with field personnel, and logs initial verification remarks.",
    icon: ClipboardCheck,
    color: "text-primary-light"
  },
  {
    number: "04",
    title: "Response & Resolution",
    description: "Assigned environmental or safety units resolve the hazard in the field. The status is marked as RESOLVED, generating a final public audit trail entry.",
    icon: CheckCircle2,
    color: "text-accent-light"
  }
];

const Timeline = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <section id="workflow" className="relative py-24 px-6 bg-navy-950/10 border-t border-b border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-xs font-bold tracking-wider uppercase text-accent-light mb-3">
            Operational Lifecycle
          </h2>
          <p className="text-3xl font-extrabold text-white sm:text-4xl">
            From coordinates to verified resolution
          </p>
        </div>

        {/* Timeline Path */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="relative grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6"
        >
          {/* Connector Line (Desktop Only) */}
          <div className="hidden md:block absolute top-[44px] left-[5%] right-[5%] h-0.5 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 z-0"></div>

          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                variants={itemVariants}
                className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left group"
              >
                {/* Step Marker Bubble */}
                <div className="w-20 h-20 rounded-2xl bg-background-card border border-white/10 flex items-center justify-center mb-6 group-hover:border-primary-light transition-all duration-300 shadow-glow-primary/5 group-hover:scale-105">
                  <Icon className={`w-8 h-8 ${step.color}`} />
                </div>

                {/* Step Metadata */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-mono text-xs font-extrabold text-primary-light bg-primary/10 px-2 py-0.5 rounded">
                    Step {step.number}
                  </span>
                </div>

                {/* Step Text Content */}
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-light transition-colors duration-200">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Timeline;
