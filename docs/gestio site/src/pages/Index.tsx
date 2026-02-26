import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HomeHighlightsSection from "@/components/HomeHighlightsSection";
import HomeScreenshotSection from "@/components/HomeScreenshotSection";
import HomeCtaSection from "@/components/HomeCtaSection";
import FooterSection from "@/components/FooterSection";

const Index = () => (
  <>
    <Navbar />
    <main>
      <HeroSection />
      <HomeHighlightsSection />
      <HomeScreenshotSection />
      <HomeCtaSection />
    </main>
    <FooterSection />
  </>
);

export default Index;
