import { useState } from "react";
import { Plus } from "lucide-react";
import Reveal from "./Reveal";

const faqs = [
  {
    q: "Gestio est-il vraiment gratuit ?",
    a: "Oui, Gestio est entièrement gratuit pendant la phase bêta. Nous souhaitons recueillir un maximum de retours utilisateurs avant d'envisager un modèle économique. Aucune fonctionnalité n'est bloquée, et il n'y a pas de publicité.",
  },
  {
    q: "Où sont stockées mes données ?",
    a: "Toutes vos données sont stockées localement sur votre ordinateur, dans un fichier sécurisé. Aucune information n'est jamais envoyée vers nos serveurs ou un service tiers.",
  },
  {
    q: "Le script d'installation pour macOS/Linux est-il sûr ?",
    a: "Oui, totalement. Ce script officiel télécharge simplement le programme depuis les serveurs sécurisés de GitHub et l'installe à la bonne place, pour vous faire gagner du temps. Le code du script est transparent et consultable depuis le dépôt GitHub.",
  },
  {
    q: "Puis-je synchroniser mes données entre plusieurs appareils ?",
    a: "Actuellement, Gestio ne propose pas de synchronisation automatique entre appareils (pour préserver votre vie privée). Vous pouvez cependant exporter et importer manuellement vos données via la fonction d'export/import dans les paramètres.",
  },
  {
    q: "L'application fonctionne-t-elle sur smartphone ?",
    a: "Pour l'instant, Gestio est disponible uniquement sur ordinateur (Windows, macOS, Linux). Une version mobile est envisagée pour le futur.",
  },
  {
    q: "Comment puis-je sauvegarder mes données ?",
    a: "Allez dans Paramètres, puis \"Sauvegarde\". Vous pouvez exporter toutes vos données dans un fichier que vous pouvez stocker où vous voulez (clé USB, cloud personnel, etc.).",
  },
  {
    q: "Comment signaler un bug ou suggérer une fonctionnalité ?",
    a: "Envoyez-nous un email à lamoms954@gmail.com avec une description détaillée du bug ou de votre suggestion. Nous lisons tous les messages.",
  },
];

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section className="py-[120px] bg-gradient-subtle" id="faq">
      <div className="container">
        <Reveal>
          <div className="text-center max-w-[700px] mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-wider mb-4">
              FAQ
            </div>
            <h2 className="text-foreground text-[clamp(2rem,4vw,3rem)] font-bold mb-4">
              Questions fréquentes
            </h2>
            <p className="text-muted-foreground text-lg">
              Trouvez les réponses aux questions les plus posées sur Gestio.
            </p>
          </div>
        </Reveal>
        <div className="max-w-[800px] mx-auto space-y-4">
          {faqs.map((f, i) => {
            const isActive = activeIndex === i;
            return (
              <Reveal key={i} delay={i * 60}>
                <div className={`bg-card border rounded-xl overflow-hidden transition-all ${isActive ? "border-primary" : "border-border hover:border-primary"}`}>
                  <button
                    className="w-full p-6 flex items-center justify-between gap-4 text-left"
                    onClick={() => setActiveIndex(isActive ? null : i)}
                    aria-expanded={isActive}
                  >
                    <h3 className="text-foreground font-semibold">{f.q}</h3>
                    <Plus className={`w-5 h-5 text-primary shrink-0 transition-transform ${isActive ? "rotate-45" : ""}`} />
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-400"
                    style={{ maxHeight: isActive ? "300px" : "0" }}
                  >
                    <p className="px-6 pb-6 text-muted-foreground leading-relaxed">{f.a}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
