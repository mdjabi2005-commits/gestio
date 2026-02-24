import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Reveal from "./Reveal";

const guides = [
  {
    title: "Guide de démarrage rapide",
    steps: [
      { bold: "Installez l'application", text: " en téléchargeant le fichier correspondant à votre système." },
      { bold: "Lancez Gestio", text: " - aucun compte ni configuration requise." },
      { bold: "Créez votre premier compte financier", text: " (ex: Compte courant, Livret A)." },
      { bold: "Définissez un solde initial", text: " pour commencer le suivi." },
      { bold: "Commencez à enregistrer", text: " vos transactions quotidiennes." },
    ],
    tip: "Vous pouvez créer plusieurs comptes pour séparer vos finances personnelles et professionnelles.",
  },
  {
    title: "Ajouter une transaction",
    steps: [
      { bold: "Cliquez sur \"Nouvelle transaction\"", text: " ou utilisez le raccourci clavier." },
      { bold: "Sélectionnez le type", text: " : Dépense ou Revenu." },
      { bold: "Entrez le montant", text: " et une description." },
      { bold: "Choisissez une catégorie", text: " (Alimentation, Transport, Loisirs...)." },
      { bold: "Validez", text: " - la transaction apparaît immédiatement dans votre historique." },
    ],
    tip: "Vous pouvez créer vos propres catégories personnalisées dans les paramètres.",
  },
  {
    title: "Configurer une récurrence",
    steps: [
      { bold: "Accédez à l'onglet \"Récurrences\"", text: " dans le menu principal." },
      { bold: "Cliquez sur \"Nouvelle récurrence\"", text: "." },
      { bold: "Remplissez les informations", text: " : nom (ex: Netflix), montant, catégorie." },
      { bold: "Définissez la fréquence", text: " : mensuelle, hebdomadaire, annuelle." },
      { bold: "Choisissez le jour d'exécution", text: " (ex: le 5 de chaque mois)." },
      { bold: "Activez", text: " la récurrence - Gestio générera automatiquement les transactions." },
    ],
    tip: "Utilisez les récurrences pour votre loyer, abonnements, et salaire afin de ne jamais oublier une transaction.",
  },
  {
    title: "Importer un ticket (OCR)",
    steps: [
      { bold: "Cliquez sur \"Importer\"", text: " puis \"Scanner un ticket\"." },
      { bold: "Sélectionnez une image", text: " de votre ticket ou reçu (JPG, PNG)." },
      { bold: "Patientez", text: " pendant l'analyse OCR (quelques secondes)." },
      { bold: "Vérifiez les informations", text: " extraites : montant, date, commerçant." },
      { bold: "Ajustez si nécessaire", text: " et sélectionnez la catégorie." },
      { bold: "Confirmez l'import", text: " pour créer la transaction." },
    ],
    tip: "Pour de meilleurs résultats, prenez des photos bien éclairées avec le ticket à plat.",
  },
  {
    title: "Lire les graphiques",
    steps: [
      { bold: "Tableau de bord", text: " : Vue d'ensemble avec solde total et tendances récentes." },
      { bold: "Graphique en camembert", text: " : Répartition des dépenses par catégorie." },
      { bold: "Graphique linéaire", text: " : Évolution de votre solde dans le temps." },
      { bold: "Barres mensuelles", text: " : Comparaison revenus vs dépenses mois par mois." },
      { bold: "Filtrez par période", text: " : Utilisez les sélecteurs pour analyser une période spécifique." },
    ],
    tip: "Exportez vos graphiques en image pour les conserver ou les partager.",
  },
];

const GuidesSection = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section className="py-[120px] bg-background" id="guides">
      <div className="container">
        <Reveal>
          <div className="text-center max-w-[700px] mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-wider mb-4">
              Guides
            </div>
            <h2 className="text-foreground text-[clamp(2rem,4vw,3rem)] font-bold mb-4">
              Apprenez à utiliser Gestio
            </h2>
            <p className="text-muted-foreground text-lg">
              Des mini-guides pour vous aider à démarrer rapidement et tirer le meilleur de l'application.
            </p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((g, i) => {
            const isActive = activeIndex === i;
            return (
              <Reveal key={g.title} delay={i * 80}>
                <div className={`bg-card border rounded-2xl overflow-hidden transition-all ${isActive ? "border-primary" : "border-border hover:border-primary"}`}>
                  <button
                    className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                    onClick={() => setActiveIndex(isActive ? null : i)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 bg-gradient-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                        {i + 1}
                      </div>
                      <h3 className="text-foreground font-semibold">{g.title}</h3>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isActive ? "rotate-180" : ""}`} />
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-400"
                    style={{ maxHeight: isActive ? "600px" : "0" }}
                  >
                    <div className="px-6 pb-6 border-t border-border">
                      <ol className="pt-6 pl-6 text-muted-foreground list-decimal">
                        {g.steps.map((s, j) => (
                          <li key={j} className="mb-3 leading-relaxed">
                            <strong className="text-foreground">{s.bold}</strong>
                            {s.text}
                          </li>
                        ))}
                      </ol>
                      <div className="mt-4 p-4 bg-primary/10 rounded-lg border-l-[3px] border-primary">
                        <p className="text-sm text-muted-foreground">
                          <strong className="text-primary">Astuce :</strong> {g.tip}
                        </p>
                      </div>
                    </div>
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

export default GuidesSection;
