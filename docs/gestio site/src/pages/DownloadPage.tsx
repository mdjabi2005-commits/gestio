import Navbar from "@/components/Navbar";
import DownloadSection from "@/components/DownloadSection";
import FooterSection from "@/components/FooterSection";

const DownloadPage = () => (
  <>
    <Navbar />
    <main className="pt-[72px]">
      <DownloadSection />
    </main>
    <FooterSection />
  </>
);

export default DownloadPage;

