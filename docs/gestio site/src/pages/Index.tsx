import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import PrivacySection from "@/components/PrivacySection";
import ScreenshotsSection from "@/components/ScreenshotsSection";
import GuidesSection from "@/components/GuidesSection";
import FAQSection from "@/components/FAQSection";
import FooterSection from "@/components/FooterSection";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    const anchor = (location.state as { anchor?: string } | null)?.anchor;
    if (!anchor) return;
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
        <GuidesSection />
        <FAQSection />
      </main>
      <FooterSection />
    </>
  );
};

export default Index;
