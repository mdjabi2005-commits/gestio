import { X, Check } from "lucide-react";
import Reveal from "./Reveal";
import privacyVisual from "@/assets/privacy_visual.png";

const negatives = [
  "Pas de création de compte",
  "Pas de données envoyées vers des serveurs",
  "Pas de tracking ou analytics",
];

const positives = [
  "Contrôle total sur vos données",
  "Application gratuite (bêta)",
  "Multi-plateforme (Windows, macOS, Linux)",
];

const PrivacySection = () => (
  <section className="py-[120px] bg-gradient-subtle" id="securite">
    <div className="container">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <Reveal>
          <div>
            <h2 className="text-foreground text-[clamp(2rem,4vw,2.75rem)] font-bold mb-6">
              Pourquoi choisir Gestio ?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Dans un monde où vos données sont constamment collectées et analysées, Gestio adopte une approche radicalement différente : votre vie privée avant tout.
            </p>
            <div className="flex flex-col gap-4">
              {negatives.map((item) => (
                <div key={item} className="flex items-center gap-4 p-4 bg-card rounded-xl border border-destructive/30">
                  <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                    <X className="w-[18px] h-[18px] text-destructive" />
                  </div>
                  <span className="text-foreground text-[0.9375rem]">{item}</span>
                </div>
              ))}
              {positives.map((item) => (
                <div key={item} className="flex items-center gap-4 p-4 bg-card rounded-xl border border-primary/30">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Check className="w-[18px] h-[18px] text-primary" />
                  </div>
                  <span className="text-foreground text-[0.9375rem]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={200}>
          <div className="flex justify-center">
            <img
              src={privacyVisual}
              alt="Sécurité et vie privée"
              className="w-full max-w-[400px] rounded-3xl shadow-[0_32px_64px_rgba(0,0,0,0.4)]"
              loading="lazy"
            />
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

export default PrivacySection;
