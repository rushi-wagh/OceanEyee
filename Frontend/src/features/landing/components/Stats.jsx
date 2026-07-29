import React from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle2, Shield, Activity, Anchor } from "lucide-react";

const STATS_DATA = [
  {
    id: "reports-submitted",
    label: "Reports Submitted",
    value: "1,482",
    description: "Incidents submitted by verified citizens.",
    icon: Send,
    color: "text-primary-light"
  },
  {
    id: "reports-verified",
    label: "Reports Verified",
    value: "1,248",
    description: "Evaluated and confirmed by response units.",
    icon: CheckCircle2,
    color: "text-accent-light"
  },
  {
    id: "active-authorities",
    label: "Active Authorities",
    value: "42",
    description: "Regional dispatchers and response departments.",
    icon: Shield,
    color: "text-primary-light"
  },
  {
    id: "resolution-rate",
    label: "Resolution Rate",
    value: "94.6%",
    description: "Assigned incidents resolved successfully.",
    icon: Activity,
    color: "text-accent-light"
  },
  {
    id: "regions-covered",
    label: "Regions Covered",
    value: "18",
    description: "Monitored zones along the northeast coastline.",
    icon: Anchor,
    color: "text-primary-light"
  }
];

function Stats() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <section id="metrics" className="relative py-20 px-6 border-t border-white/5 bg-navy-950/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold tracking-wider uppercase text-accent-light mb-3">
            System Metrics
          </h2>
          <p className="text-3xl font-extrabold text-white sm:text-4xl">
            Operational coverage and responsiveness
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
        >
          {STATS_DATA.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                variants={cardVariants}
                className="glass-panel p-6 rounded-2xl border border-white/5 bg-background-card hover:bg-background-cardHover transition-colors duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-slate-500 font-mono font-bold tracking-wider uppercase">
                      Overview
                    </span>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <h3 className="text-3xl font-extrabold text-white tracking-tight mb-2">
                    {stat.value}
                  </h3>
                  <h4 className="text-sm font-bold text-slate-200 mb-1">
                    {stat.label}
                  </h4>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {stat.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default Stats;
