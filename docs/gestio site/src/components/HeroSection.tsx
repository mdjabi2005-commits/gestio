import { Download, Play } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      <video
        className="absolute inset-0 w-full h-full object-cover opacity-50"
        autoPlay
        muted
        loop
        playsInline
        poster="/logo.png"
        src="/videos/hero_loop.mp4"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 to-background/90" />

      <div className="relative z-10 text-center max-w-[900px] px-6 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30 px-4 py-2 rounded-full text-sm text-primary mb-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          Version Bêta Gratuite
        </div>

        <h1 className="text-gradient text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[1.1] mb-6">
          Vos finances, vos données, votre contrôle
        </h1>

        <p className="text-muted-foreground text-[clamp(1.125rem,2vw,1.375rem)] mb-10 max-w-[600px] mx-auto">
          Gestio est l'application de gestion de finances personnelles qui respecte votre vie privée. 100% hors-ligne, sans compte, vos données restent sur votre ordinateur.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/telecharger"
            className="inline-flex items-center gap-2.5 bg-gradient-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold shadow-primary hover:-translate-y-1 hover:shadow-primary-hover transition-all no-underline"
          >
            <Download className="w-5 h-5" />
            Télécharger gratuitement
          </Link>
          <Link
            to="/fonctionnalites"
            className="inline-flex items-center gap-2.5 bg-card text-foreground border border-border px-8 py-4 rounded-xl font-semibold hover:bg-muted hover:border-primary transition-all no-underline"
          >
            <Play className="w-5 h-5" />
            Découvrir
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-12 sm:gap-12 mt-16 pt-12 border-t border-border">
          {[
            { value: "100%", label: "Hors-ligne" },
            { value: "0", label: "Données envoyées" },
            { value: "3", label: "Plateformes" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
