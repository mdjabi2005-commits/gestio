import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import screenshot2 from "@/assets/app_screenshot_2.png";

const HomeScreenshotSection = () => (
    <section className="py-0 pb-24 bg-background">
        <div className="container">
            <Reveal>
                <div className="relative rounded-2xl overflow-hidden border border-border shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
                    <img
                        src={screenshot2}
                        alt="Tableau de bord Gestio – Graphique Sunburst et KPIs"
                        className="w-full block"
                        loading="lazy"
                    />
                    {/* Overlay gradient with caption + link */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent p-8 flex items-end justify-between gap-4">
                        <p className="text-foreground font-semibold text-lg">
                            📊 Tableau de bord — Sunburst interactif &amp; indicateurs clés
                        </p>
                        <Link
                            to="/apercu"
                            className="inline-flex items-center gap-2 text-primary font-semibold text-sm no-underline shrink-0 hover:gap-3 transition-all"
                        >
                            Voir plus de captures
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </Reveal>
        </div>
    </section>
);

export default HomeScreenshotSection;
