import { Download, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import Reveal from "./Reveal";

const HomeCtaSection = () => (
    <section className="py-24 bg-gradient-download">
        <div className="container">
            <Reveal>
                <div className="text-center max-w-[620px] mx-auto">
                    <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30 px-4 py-2 rounded-full text-sm text-primary mb-6">
                        Gratuit pendant la bêta — sans limite
                    </div>
                    <h2 className="text-foreground text-[clamp(2rem,4vw,3rem)] font-bold mb-4">
                        Prêt à reprendre le contrôle ?
                    </h2>
                    <p className="text-muted-foreground text-lg mb-10">
                        Téléchargez Gestio en quelques secondes et commencez à gérer vos finances — aucune inscription requise.
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
                            to="/guides"
                            className="inline-flex items-center gap-2.5 bg-card text-foreground border border-border px-8 py-4 rounded-xl font-semibold hover:bg-muted hover:border-primary transition-all no-underline"
                        >
                            <BookOpen className="w-5 h-5" />
                            Voir les guides
                        </Link>
                    </div>
                </div>
            </Reveal>
        </div>
    </section>
);

export default HomeCtaSection;
