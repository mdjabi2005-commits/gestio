import Navbar from "@/components/Navbar";
import FAQSection from "@/components/FAQSection";
import FooterSection from "@/components/FooterSection";

const FAQPage = () => (
  <>
    <Navbar />
    <main className="pt-[72px]">
      <FAQSection />
    </main>
    <FooterSection />
  </>
);

export default FAQPage;

