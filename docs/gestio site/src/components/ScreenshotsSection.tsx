import Reveal from "./Reveal";
import screenshot1 from "@/assets/app_screenshot_1.png";
import screenshot2 from "@/assets/app_screenshot_2.png";
import screenshot3 from "@/assets/privacy_visual.png";

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
            Découvrez l'expérience Gestio avec un design sombre élégant et des visualisations claires de vos finances.
          </p>
        </div>
      </Reveal>
      <Reveal delay={100}>
        <div className="mt-12">
          <div className="relative rounded-2xl overflow-hidden border border-border shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
            <img src={screenshot2} alt="Tableau de bord Gestio – Graphique Sunburst et KPIs" className="w-full block" loading="lazy" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-6">
              <p className="text-foreground font-semibold">📊 Tableau de bord financier — Sunburst interactif & indicateurs clés</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            <div className="rounded-xl overflow-hidden border border-border transition-all hover:border-primary hover:scale-[1.02] relative group">
              <img src={screenshot1} alt="Page d'accueil Gestio" className="w-full block" loading="lazy" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-foreground text-sm font-semibold">🏠 Accueil — Navigation rapide</p>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden border border-border transition-all hover:border-primary hover:scale-[1.02] relative group">
              <img src={screenshot3} alt="Import OCR – Scan de tickets" className="w-full block" loading="lazy" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-foreground text-sm font-semibold">📷 Import OCR — Scan de tickets automatique</p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

export default ScreenshotsSection;

