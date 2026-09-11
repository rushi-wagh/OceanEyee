import { motion } from "framer-motion";
import {
  MapPin,
  ClipboardList,
  ShieldCheck,
  Users,
} from "lucide-react";

const FEATURES_LIST = [
  {
    id: "incident-reporting",
    title: "Incident Reporting",
    description:
      "Citizens can submit marine incidents with a description, image, and location to provide the necessary information for review.",
    icon: ClipboardList,
    color: "text-primary-light",
    bgClass: "from-primary/10 to-transparent",
  },
  {
    id: "location",
    title: "Location Based Reports",
    description:
      "Each incident includes its reported location, making it easier to identify where marine hazards have been reported.",
    icon: MapPin,
    color: "text-accent-light",
    bgClass: "from-accent/10 to-transparent",
  },
  {
    id: "authority-review",
    title: "Authority Review",
    description:
      "Submitted incidents appear on the official dashboard where authorized officials can review the information and decide whether to approve or reject it.",
    icon: ShieldCheck,
    color: "text-primary-light",
    bgClass: "from-primary/10 to-transparent",
  },
  {
    id: "public-visibility",
    title: "Public Visibility",
    description:
      "Approved incidents are made visible to citizens, helping everyone stay informed about confirmed marine incidents.",
    icon: Users,
    color: "text-accent-light",
    bgClass: "from-accent/10 to-transparent",
  },
];

const Features = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
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
      id="features"
      className="relative py-24 px-6 bg-[#02060d]/50"
    >
      <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] rounded-full bg-accent/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-xs font-bold tracking-wider uppercase text-primary-light mb-3">
            Core Features
          </h2>

          <p className="text-3xl font-extrabold text-white sm:text-4xl leading-tight mb-4">
            Simple reporting. Clear verification.
          </p>

          <p className="text-slate-400 text-base">
            OceanEye connects citizens and authorities through a simple
            incident reporting and verification workflow.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {FEATURES_LIST.map((feat) => {
            const Icon = feat.icon;

            return (
              <motion.div
                key={feat.id}
                variants={itemVariants}
                className="card-glow glass-panel p-8 rounded-2xl border border-white/5 bg-background-card hover:bg-background-cardHover transition-all duration-300 group flex gap-6"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feat.bgClass} border border-white/5 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105`}
                >
                  <Icon className={`w-6 h-6 ${feat.color}`} />
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-primary-light transition-colors duration-200">
                    {feat.title}
                  </h3>

                  <p className="text-sm text-slate-400 leading-relaxed font-normal">
                    {feat.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;