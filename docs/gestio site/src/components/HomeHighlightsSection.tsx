import { Lock, Zap, BarChart3, ArrowRight, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import Reveal from "./Reveal";

const highlights = [
    {
        icon: Lock,
        color: "text-emerald-400",
        bg: "bg-emerald-400/10",
        border: "border-emerald-400/20 hover:border-emerald-400/60",
        title: "Vie privée totale",
        desc: "Zéro compte, zéro serveur. Toutes vos données financières restent sur votre ordinateur — point.",
        to: "/securite",
        label: "Voir la politique de sécurité",
    },
    {
        icon: Zap,
        color: "text-violet-400",
        bg: "bg-violet-400/10",
        border: "border-violet-400/20 hover:border-violet-400/60",
        title: "Puissant & simple",
        desc: "Transactions, récurrences, import OCR, export CSV. Tout ce dont vous avez besoin, sans superflu.",
        to: "/fonctionnalites",
        label: "Voir toutes les fonctionnalités",
    },
    {
        icon: BarChart3,
        color: "text-sky-400",
        bg: "bg-sky-400/10",
        border: "border-sky-400/20 hover:border-sky-400/60",
        title: "Visualisations claires",
        desc: "Graphiques interactifs, tableaux de bord et indicateurs clés pour comprendre vos finances en un coup d'œil.",
        to: "/apercu",
        label: "Voir l'aperçu de l'interface",
    },
];

const HomeHighlightsSection = () => (
    <section className="py-24 bg-background">
        <div className="container">
            <Reveal>
                <div className="text-center max-w-[600px] mx-auto mb-14">
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Une application de gestion financière conçue autour d'un seul principe : <strong className="text-foreground">vos finances vous appartiennent</strong>.
                    </p>
                </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {highlights.map((h, i) => (
                    <Reveal key={h.title} delay={i * 100}>
                        <div
                            className={`group bg-card border ${h.border} rounded-2xl p-8 flex flex-col h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_24px_48px_rgba(0,0,0,0.35)]`}
                        >
                            {/* Icon */}
                            <div className={`w-14 h-14 ${h.bg} rounded-xl flex items-center justify-center mb-6 shrink-0`}>
                                <h.icon className={`w-7 h-7 ${h.color}`} />
                            </div>

                            {/* Content */}
                            <h2 className="text-foreground text-xl font-bold mb-3">{h.title}</h2>
                            <p className="text-muted-foreground text-[0.9375rem] leading-relaxed flex-1">{h.desc}</p>

                            {/* Link */}
                            <Link
                                to={h.to}
                                className={`inline-flex items-center gap-2 mt-6 text-sm font-semibold ${h.color} no-underline opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                            >
                                {h.label}
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </Reveal>
                ))}
            </div>

            <Reveal delay={400}>
                <div className="flex items-start gap-2 mt-8 max-w-[600px] mx-auto px-4 py-3 bg-amber-500/5 border border-amber-500/20 rounded-xl text-center justify-center">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-muted-foreground text-xs">
                        <strong className="text-amber-500">OCR IA (optionnel) :</strong> si vous utilisez l'analyse de tickets par Groq, seul le texte extrait du ticket est transmis — jamais vos données financières.{" "}
                        <Link to="/confidentialite#groq" className="text-amber-500 hover:underline">En savoir plus</Link>
                    </p>
                </div>
            </Reveal>
        </div>
    </section>
);

export default HomeHighlightsSection;
