import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQ_ITEMS = [
  {
    question: "How can I report an incident?",
    answer:
      "Citizens can report a marine incident by filling out the incident form with the required details and submitting it on OceanEye.",
  },
  {
    question: "What happens after I submit an incident?",
    answer:
      "The reported incident is sent to the official dashboard, where an authorized official can review the report and either approve or reject it.",
  },
  {
    question: "Who can see the reported incidents?",
    answer:
      "Pending reports are visible to officials for review. Once an incident is approved, it becomes visible to all citizens on the platform.",
  },
  {
    question: "Can officials reject an incident report?",
    answer:
      "Yes. Officials can review submitted reports and reject them if the information is incorrect, incomplete, or does not represent a valid incident.",
  },
  {
    question: "Can I see approved incidents?",
    answer:
      "Yes. Approved incidents are displayed on the platform so that citizens can stay informed about reported marine incidents.",
  },
];

const FAQ = () => {
  const [openIdx, setOpenIdx] = useState(null);

  const toggleFAQ = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section
      id="faq"
      className="relative py-24 px-6 bg-navy-950/20 border-t border-white/5"
    >
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-10 w-[300px] h-[300px] rounded-full bg-primary/5 blur-[100px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-2 rounded-xl bg-white/5 border border-white/5 text-primary-light mb-4">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h2 className="text-xs font-bold tracking-wider uppercase text-accent-light mb-3">
            Common Inquiries
          </h2>
          <p className="text-3xl font-extrabold text-white sm:text-4xl">
            Frequently Asked Questions
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="glass-panel rounded-2xl border border-white/5 bg-background-card hover:bg-background-cardHover transition-colors duration-300 overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full flex items-center justify-between p-6 text-left font-bold text-slate-100 hover:text-white transition-colors duration-200 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base leading-snug">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-primary-light" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 text-xs sm:text-sm text-slate-400 leading-relaxed font-normal border-t border-white/[0.02] pt-4">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
