import { DollarSign, Edit3, Image, BarChart3, WifiOff, Lock } from "lucide-react";
import Reveal from "./Reveal";

const features = [
  { icon: DollarSign, title: "Gestion des transactions", desc: "Enregistrez facilement vos dépenses et revenus. Catégorisez chaque transaction pour une vue claire de vos habitudes financières." },
  { icon: Edit3, title: "Récurrences automatiques", desc: "Configurez vos abonnements, loyers et salaires une seule fois. Gestio les enregistre automatiquement chaque mois." },
  { icon: Image, title: "Import OCR intelligent", desc: "Photographiez vos tickets et reçus. Notre technologie OCR extrait automatiquement les informations pour vous." },
  { icon: BarChart3, title: "Tableaux de bord visuels", desc: "Visualisez vos finances avec des graphiques clairs et interactifs. Identifiez vos tendances et optimisez vos dépenses." },
  { icon: WifiOff, title: "100% Hors-ligne", desc: "Aucune connexion internet requise. Gérez vos finances n'importe où, même sans réseau. Vos données restent locales." },
  { icon: Lock, title: "Vie privée garantie", desc: "Vos données financières sont stockées uniquement sur votre ordinateur. Pas de compte, pas de serveur, pas de tracking." },
];

const FeaturesSection = () => (
  <section className="py-[120px] bg-background" id="fonctionnalites">
    <div className="container">
      <Reveal>
        <div className="text-center max-w-[700px] mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-wider mb-4">
            Fonctionnalités
          </div>
          <h2 className="text-foreground text-[clamp(2rem,4vw,3rem)] font-bold mb-4">
            Tout ce dont vous avez besoin pour gérer vos finances
          </h2>
          <p className="text-muted-foreground text-lg">
            Des outils puissants et intuitifs pour suivre, analyser et optimiser vos finances personnelles.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i * 100}>
            <div className="bg-card border border-border rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:border-primary hover:shadow-[0_24px_48px_rgba(0,0,0,0.3)] h-full">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
                <f.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-foreground text-xl font-semibold mb-3">{f.title}</h3>
              <p className="text-muted-foreground text-[0.9375rem] leading-relaxed">{f.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
