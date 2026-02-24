import Reveal from "./Reveal";
import screenshot1 from "@/assets/app_screenshot_1.png";
import screenshot2 from "@/assets/app_screenshot_2.png";
import privacyVisual from "@/assets/privacy_visual.png";

const ScreenshotsSection = () => (
  <section className="py-[120px] bg-background" id="captures">
    <div className="container">
      <Reveal>
        <div className="text-center max-w-[700px] mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-wider mb-4">
            Aperçu
          </div>
          <h2 className="text-foreground text-[clamp(2rem,4vw,3rem)] font-bold mb-4">
            Une interface moderne et intuitive
          </h2>
          <p className="text-muted-foreground text-lg">
            Découvrez l'expérience Gestio avec un design sombre élégant et des visualisations claires.
          </p>
        </div>
      </Reveal>
      <Reveal delay={100}>
        <div className="mt-12">
          <img src={screenshot1} alt="Tableau de bord Gestio" className="w-full rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.5)] border border-border" loading="lazy" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            <div className="rounded-xl overflow-hidden border border-border transition-all hover:border-primary hover:scale-[1.02]">
              <img src={screenshot2} alt="Détail des transactions" className="w-full block" loading="lazy" />
            </div>
            <div className="rounded-xl overflow-hidden border border-border transition-all hover:border-primary hover:scale-[1.02]">
              <img src={privacyVisual} alt="Import OCR" className="w-full block" loading="lazy" />
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

export default ScreenshotsSection;
