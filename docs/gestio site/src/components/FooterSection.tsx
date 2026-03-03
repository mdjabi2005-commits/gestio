import { Link } from "react-router-dom";
import GestioLogo from "./GestioLogo";

const FooterSection = () => (
  <footer className="bg-card border-t border-border pt-16 pb-8">
    <div className="container">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        <div>
          <Link to="/" className="flex items-center gap-3 text-2xl font-bold text-foreground no-underline mb-4">
            <GestioLogo />
            Gestio
          </Link>
          <p className="text-muted-foreground text-[0.9375rem] leading-relaxed">
            L'application de gestion de finances personnelles qui respecte votre vie privée. 100% hors-ligne, sans compte, vos données restent sur votre ordinateur.
          </p>
        </div>
        <div>
          <h4 className="text-foreground text-sm font-semibold uppercase tracking-wider mb-5">Navigation</h4>
          <ul className="space-y-3 list-none">
            <li><Link to="/fonctionnalites" className="text-muted-foreground hover:text-primary transition-colors text-[0.9375rem] no-underline">Fonctionnalités</Link></li>
            <li><Link to="/securite" className="text-muted-foreground hover:text-primary transition-colors text-[0.9375rem] no-underline">Sécurité</Link></li>
            <li><Link to="/apercu" className="text-muted-foreground hover:text-primary transition-colors text-[0.9375rem] no-underline">Aperçu</Link></li>
            <li><Link to="/telecharger" className="text-muted-foreground hover:text-primary transition-colors text-[0.9375rem] no-underline">Télécharger</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-foreground text-sm font-semibold uppercase tracking-wider mb-5">Ressources</h4>
          <ul className="space-y-3 list-none">
            <li><Link to="/guides" className="text-muted-foreground hover:text-primary transition-colors text-[0.9375rem] no-underline">Guides</Link></li>
            <li><Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors text-[0.9375rem] no-underline">FAQ</Link></li>
            <li><a href="mailto:lamoms954@gmail.com" className="text-muted-foreground hover:text-primary transition-colors text-[0.9375rem] no-underline">Support</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-foreground text-sm font-semibold uppercase tracking-wider mb-5">Contact</h4>
          <ul className="space-y-3 list-none">
            <li>
              <a href="mailto:lamoms954@gmail.com" className="text-muted-foreground hover:text-primary transition-colors text-[0.9375rem] no-underline">
                lamoms954@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-muted-foreground text-sm">© 2025–2026 Gestio par Lamom's. Tous droits réservés.</p>
        <div className="flex gap-6">
          <Link to="/cgu" className="text-muted-foreground hover:text-primary transition-colors text-sm no-underline">
            Conditions d'utilisation
          </Link>
          <Link to="/confidentialite" className="text-muted-foreground hover:text-primary transition-colors text-sm no-underline">
            Politique de confidentialité
          </Link>
        </div>
      </div>
    </div>
  </footer>
);

export default FooterSection;
