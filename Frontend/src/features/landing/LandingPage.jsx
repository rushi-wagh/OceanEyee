import Hero from "./components/Hero";
import DashboardMockup from "./components/DashboardMockup";
import Stats from "./components/Stats";
import Features from "./components/Features";
import Timeline from "./components/Timeline";
import AIVision from "./components/AIVision";
import MapPreview from "./components/MapPreview";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-slate-100 bg-grid-pattern relative overflow-hidden">
      {/* Background glow radial effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[30%] right-[-10%] w-[60%] h-[60%] rounded-full bg-accent/5 blur-[150px] pointer-events-none"></div>

      <Hero />
      <DashboardMockup />
      {/* <Stats /> */}
      <Features />
      <Timeline />
      <AIVision />
      <MapPreview />
      <FAQ />
      <Footer />
    </div>
  );
};

export default LandingPage;
