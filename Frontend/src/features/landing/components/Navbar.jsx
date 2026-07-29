import React, { useState, useEffect } from "react";
import { Eye, Menu, X, ChevronRight } from "lucide-react";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Platform", href: "#platform" },
    { name: "Metrics", href: "#metrics" },
    { name: "Features", href: "#features" },
    { name: "Workflow", href: "#workflow" },
    { name: "Incident Map", href: "#map" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "glass-panel py-4 shadow-lg border-b border-white/5"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-glow-primary transition-transform duration-300 group-hover:scale-105">
            <Eye className="w-5.5 h-5.5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              OceanEye
            </span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase -mt-1">
              Maritime Response
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="/login"
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors py-2.5 px-4"
          >
            Authority Portal
          </a>
          <a
            href="/report"
            className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark transition-all duration-200 py-2.5 px-5 rounded-xl shadow-glow-primary hover:scale-[1.02]"
          >
            Report Incident
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-slate-400 hover:text-white focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass-panel border-b border-white/5 py-6 px-6 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-5">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-base font-medium text-slate-300 hover:text-white transition-colors"
              >
                {link.name}
              </a>
            ))}
            <div className="h-px bg-white/5 my-2"></div>
            <div className="flex flex-col gap-4">
              <a
                href="/login"
                onClick={() => setIsOpen(false)}
                className="text-center py-3 text-base font-semibold text-slate-300 hover:text-white transition-colors rounded-xl border border-white/5 hover:bg-white/5"
              >
                Authority Portal
              </a>
              <a
                href="/report"
                onClick={() => setIsOpen(false)}
                className="text-center py-3 text-base font-semibold text-white bg-primary hover:bg-primary-dark transition-all rounded-xl shadow-glow-primary"
              >
                Report Incident
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
