import Navbar from "@/components/Navbar";
import PrivacySection from "@/components/PrivacySection";
import FooterSection from "@/components/FooterSection";

const SecuritePage = () => (
    <>
        <Navbar />
        <main className="pt-[72px]">
            <PrivacySection />
        </main>
        <FooterSection />
    </>
);

export default SecuritePage;
