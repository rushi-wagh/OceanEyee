import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Info, Globe, ShieldAlert, CheckCircle } from "lucide-react";

const MAP_PINS = [
  {
    id: "OE-128",
    type: "Hazardous Spill",
    title: "Minor Oil Sheen",
    coords: "41.2842° N, 70.0921° W",
    status: "VERIFIED",
    severity: "High",
    description: "Slick covering approximately 100 meters, moving east-northeast."
  },
  {
    id: "OE-132",
    type: "Debris Obstruction",
    title: "Drifting Timber Pack",
    coords: "40.8215° N, 72.4123° W",
    status: "SUBMITTED",
    severity: "Medium",
    description: "Floating wood pile threatening small vessel navigation lanes."
  },
  {
    id: "OE-139",
    type: "Navigational Aid",
    title: "Dislocated Channel Marker",
    coords: "41.6521° N, 69.9542° W",
    status: "RESOLVED",
    severity: "Low",
    description: "Marker buoy displaced from its shallow anchor, now retrieved."
  }
];

function MapPreview() {
  const [activePinId, setActivePinId] = useState("OE-128");
  const activePin = MAP_PINS.find((p) => p.id === activePinId);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "High":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      case "Medium":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      default:
        return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
    }
  };

  return (
    <section id="map" className="relative py-24 px-6 bg-[#02060d]/40">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold tracking-wider uppercase text-primary-light mb-3">
            Coordinate Telemetry
          </h2>
          <p className="text-3xl font-extrabold text-white sm:text-4xl">
            Interactive coastal incident preview
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Interactive Incidents List */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="p-4 border-b border-white/5 bg-navy-950/20 rounded-xl mb-2 flex items-center gap-3">
              <Globe className="w-5 h-5 text-primary-light" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select coordinate marker
              </span>
            </div>

            {MAP_PINS.map((pin) => (
              <button
                key={pin.id}
                onMouseEnter={() => setActivePinId(pin.id)}
                onClick={() => setActivePinId(pin.id)}
                className={`text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  activePinId === pin.id
                    ? "bg-navy-950/60 border-primary shadow-glow-primary/5"
                    : "bg-white/[0.01] border-white/5 hover:bg-white/[0.03] hover:border-white/10"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-mono font-bold text-slate-500">{pin.id}</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getSeverityColor(pin.severity)}`}>
                    {pin.severity} Priority
                  </span>
                </div>
                <h3 className="font-bold text-slate-200 text-sm mb-1">{pin.title}</h3>
                <p className="text-xs text-slate-400 font-mono mt-2">{pin.coords}</p>
              </button>
            ))}
          </div>

          {/* Right Column: Coastal Map Viewport */}
          <div className="lg:col-span-8 glass-panel rounded-3xl border border-white/5 overflow-hidden min-h-[420px] bg-[#02070e]/80 relative flex items-center justify-center">
            {/* SVG Shoreline Graphics */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 200 200" preserveAspectRatio="none">
              <path d="M 0,100 C 50,70 80,130 130,90 C 180,50 170,120 200,90 L 200,200 L 0,200 Z" fill="#0ea5e9" />
              <path d="M 20,40 Q 60,80 110,30 T 200,60" fill="none" stroke="#22d3ee" strokeWidth="0.5" />
            </svg>
            <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none"></div>

            {/* Latitude / Longitude lines indicator */}
            <div className="absolute bottom-4 right-4 bg-navy-950/80 border border-white/5 px-2.5 py-1 rounded text-[10px] font-mono text-slate-500">
              Grid: UTM Zone 19T
            </div>

            {/* Pulsing incident pins */}
            {MAP_PINS.map((pin, idx) => {
              const isActive = activePinId === pin.id;
              return (
                <button
                  key={pin.id}
                  onClick={() => setActivePinId(pin.id)}
                  onMouseEnter={() => setActivePinId(pin.id)}
                  className={`absolute flex flex-col items-center group transition-all duration-300 ${
                    idx === 0 ? "top-[45%] left-[28%]" : idx === 1 ? "top-[65%] left-[55%]" : "top-[30%] left-[75%]"
                  }`}
                >
                  {/* Pulse Rings */}
                  {isActive && (
                    <span className="absolute -inset-2 rounded-full bg-primary/20 animate-ping pointer-events-none"></span>
                  )}
                  <div className={`p-2 rounded-full border transition-all duration-300 ${
                    isActive
                      ? "bg-primary text-white scale-125 shadow-glow-primary border-primary-light"
                      : "bg-background-darker border-white/10 text-slate-400 group-hover:scale-110"
                  }`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                </button>
              );
            })}

            {/* Float Info Box */}
            <AnimatePresence mode="wait">
              {activePin && (
                <motion.div
                  key={activePin.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-6 left-6 right-6 md:right-auto md:w-80 glass-panel p-5 rounded-2xl border border-white/10 bg-navy-950/90 shadow-2xl z-20"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono font-bold text-primary-light uppercase tracking-wider">
                      {activePin.type}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {activePin.id}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-white text-sm mb-1.5">{activePin.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">{activePin.description}</p>
                  <div className="border-t border-white/5 pt-2.5 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                    <span>Coordinates</span>
                    <span className="text-slate-300">{activePin.coords}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MapPreview;
