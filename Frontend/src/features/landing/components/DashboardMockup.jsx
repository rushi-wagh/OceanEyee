import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock } from "lucide-react";

const MOCK_REPORTS = [
  {
    id: "OE-1042",
    title: "Floating Debris Blockage",
    location: "Sandy Hook Channel",
    coords: "40.4632° N, 74.0051° W",
    status: "VERIFIED",
    time: "12 mins ago",
    desc: "Large floating shipping container spotted drifting in the main shipping lane. Hazard to incoming commercial vessels.",
    history: [
      { time: "19:42", log: "Incident reported by vessel Horizon Star" },
      { time: "19:45", log: "Coordinates verified by coastal monitoring radar" },
      { time: "19:50", log: "Assigned to regional Response Unit 2" }
    ]
  },
  {
    id: "OE-1043",
    title: "Submerged Rock Signage Failure",
    location: "Boston Inner Harbor",
    coords: "42.3551° N, 71.0423° W",
    status: "PENDING_AUTHORITY",
    time: "24 mins ago",
    desc: "Warning buoy for shallow reef is detached and drifting. Vessels unaware of shallow hazard risk grounding.",
    history: [
      { time: "19:28", log: "Citizen report received with photo attachment" },
      { time: "19:30", log: "Incident marked as PENDING_AUTHORITY review" }
    ]
  },
  {
    id: "OE-1044",
    title: "Commercial Gear Drifting",
    location: "Nantucket Sound",
    coords: "41.4284° N, 70.0921° W",
    status: "RESOLVED",
    time: "1 hour ago",
    desc: "Loose commercial fishing rigging drifting near recreational beach. Risk of swimmer entanglement.",
    history: [
      { time: "18:32", log: "Incident reported near public beach" },
      { time: "18:40", log: "Assigned to municipal marine safety unit" },
      { time: "19:15", log: "Gear retrieved and logged as RESOLVED" }
    ]
  }
];

const DashboardMockup = () => {
  const [selectedId, setSelectedId] = useState("OE-1042");
  const selectedReport = MOCK_REPORTS.find((r) => r.id === selectedId);

  const getStatusColor = (status) => {
    switch (status) {
      case "VERIFIED":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "RESOLVED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      default:
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
    }
  };

  return (
    <section id="platform" className="relative pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold tracking-wider uppercase text-primary-light mb-3">
            Operational Workspace
          </h2>
          <p className="text-3xl font-extrabold text-white sm:text-4xl">
            Live incident mapping and response coordination
          </p>
        </div>

        {/* Dashboard Shell */}
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden shadow-2xl bg-background-darker/60">
          {/* Workspace Header */}
          <div className="border-b border-white/5 bg-navy-950/40 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
                Active Dispatch Feed
              </span>
            </div>
            <div className="flex gap-2">
              <span className="px-2.5 py-1 rounded bg-white/5 text-[10px] font-mono text-slate-400">
                Region: Northeast Coast
              </span>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
            {/* Left Column: Report List */}
            <div className="lg:col-span-5 h-[480px] overflow-y-auto p-4 flex flex-col gap-3">
              {MOCK_REPORTS.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedId(report.id)}
                  className={`text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    selectedId === report.id
                      ? "bg-navy-950/80 border-primary shadow-glow-primary/10"
                      : "bg-white/[0.01] border-white/5 hover:bg-white/[0.03] hover:border-white/10"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {report.id}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {report.time}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-200 text-sm mb-1">
                    {report.title}
                  </h3>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary-light" />
                      {report.location}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusColor(
                        report.status
                      )}`}
                    >
                      {report.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Right Column: Active Map & Details */}
            <div className="lg:col-span-7 h-[480px] flex flex-col">
              {/* Map Preview Area */}
              <div className="h-1/2 bg-[#02070e] relative overflow-hidden flex items-center justify-center border-b border-white/5">
                {/* SVG Coastline Backdrop */}
                <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0,50 Q25,30 50,70 T100,50 L100,100 L0,100 Z" fill="#0ea5e9" />
                </svg>
                {/* Grid Lines */}
                <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none"></div>

                {/* Coordinate Markers */}
                <div className="absolute text-[9px] font-mono text-slate-600 top-2 left-2">41.000° N, 72.000° W</div>

                {/* Simulated Pins */}
                {MOCK_REPORTS.map((report, idx) => (
                  <button
                    key={report.id}
                    onClick={() => setSelectedId(report.id)}
                    className={`absolute flex flex-col items-center group transition-all duration-300 ${
                      idx === 0 ? "top-[40%] left-[30%]" : idx === 1 ? "top-[25%] left-[65%]" : "top-[70%] left-[50%]"
                    }`}
                  >
                    <div className={`p-1.5 rounded-full border transition-all duration-200 ${
                      selectedId === report.id
                        ? "bg-primary text-white scale-125 shadow-glow-primary"
                        : "bg-background-darker border-white/20 text-slate-400 group-hover:scale-110"
                    }`}>
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <span className="hidden group-hover:block absolute top-7 bg-navy-950 border border-white/10 px-2 py-0.5 rounded text-[10px] text-white whitespace-nowrap z-20">
                      {report.title}
                    </span>
                  </button>
                ))}
              </div>

              {/* Selected Report Details */}
              <div className="h-1/2 p-5 bg-navy-950/20 overflow-y-auto flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedReport.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-extrabold text-white text-base">
                        {selectedReport.title}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500">
                        {selectedReport.coords}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      {selectedReport.desc}
                    </p>

                    {/* Routing Logs */}
                    <div className="border-t border-white/5 pt-3">
                      <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Assignment Logs & Actions
                      </h5>
                      <div className="flex flex-col gap-1.5 font-mono text-[10px] text-slate-300">
                        {selectedReport.history.map((h, i) => (
                          <div key={i} className="flex gap-2.5 items-start">
                            <span className="text-slate-500">{h.time} UTC</span>
                            <span className="text-slate-400">—</span>
                            <span>{h.log}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardMockup;
