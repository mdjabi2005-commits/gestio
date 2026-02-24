import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import PrivacySection from "@/components/PrivacySection";
import ScreenshotsSection from "@/components/ScreenshotsSection";
import FooterSection from "@/components/FooterSection";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    // Si on arrive ici depuis la navbar avec une ancre en state
    const anchor = (location.state as { anchor?: string } | null)?.anchor;
    if (!anchor) return;

    // Attendre que le DOM soit peint avant de scroller
    const frame = requestAnimationFrame(() => {
      const el = document.getElementById(anchor);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return () => cancelAnimationFrame(frame);
  }, [location.state]);

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PrivacySection />
        <ScreenshotsSection />
      </main>
      <FooterSection />
    </>
  );
};

export default Index;
