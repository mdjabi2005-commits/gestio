import Navbar from "@/components/Navbar";
import GuidesSection from "@/components/GuidesSection";
import FooterSection from "@/components/FooterSection";

const GuidesPage = () => (
  <>
    <Navbar />
    <main className="pt-[72px]">
      <GuidesSection />
    </main>
    <FooterSection />
  </>
);

export default GuidesPage;

