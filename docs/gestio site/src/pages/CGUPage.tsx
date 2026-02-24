import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import Reveal from "@/components/Reveal";

const CGUPage = () => (
  <>
    <Navbar />
    <main className="pt-[72px]">
      <section className="py-20 bg-background min-h-screen">
        <div className="container max-w-[860px]">
          <Reveal>
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-wider mb-4">
                Légal
              </div>
              <h1 className="text-foreground text-[clamp(2rem,4vw,3rem)] font-bold mb-3">
                Conditions Générales d'Utilisation
              </h1>
              <p className="text-muted-foreground text-sm">Dernière mise à jour : 16 février 2026</p>
            </div>
          </Reveal>

          <div className="space-y-10 text-[0.9375rem] leading-relaxed">

            {/* 1 */}
            <Reveal>
              <div className="bg-card border border-border rounded-2xl p-8">
                <h2 className="text-foreground text-xl font-semibold mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm shrink-0">1</span>
                  Présentation
                </h2>
                <p className="text-muted-foreground mb-4">
                  Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») régissent l'utilisation de l'application <strong className="text-foreground">Gestio</strong>, éditée par <strong className="text-foreground">Lamom's</strong>.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li><span className="text-foreground font-medium">Application :</span> Gestio</li>
                  <li><span className="text-foreground font-medium">Éditeur :</span> Lamom's</li>
                  <li><span className="text-foreground font-medium">Contact :</span>{" "}
                    <a href="mailto:lamoms954@gmail.com" className="text-primary hover:underline">lamoms954@gmail.com</a>
                  </li>
                  <li><span className="text-foreground font-medium">Plateformes :</span> Windows, macOS, Linux (Desktop uniquement)</li>
                </ul>
              </div>
            </Reveal>

            {/* 2 */}
            <Reveal>
              <div className="bg-card border border-border rounded-2xl p-8">
                <h2 className="text-foreground text-xl font-semibold mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm shrink-0">2</span>
                  Objet de l'application
                </h2>
                <p className="text-muted-foreground mb-3">Gestio est une application de <strong className="text-foreground">gestion de finances personnelles</strong> permettant de :</p>
                <ul className="space-y-2 text-muted-foreground list-none">
                  {[
                    "Enregistrer et catégoriser des transactions (dépenses et revenus)",
                    "Gérer des transactions récurrentes (abonnements, loyers, etc.)",
                    "Importer des tickets via reconnaissance optique (OCR)",
                    "Visualiser ses finances via des tableaux de bord et graphiques",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-primary mt-1">›</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* 3 */}
            <Reveal>
              <div className="bg-card border border-destructive/40 rounded-2xl p-8">
                <h2 className="text-foreground text-xl font-semibold mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center text-destructive font-bold text-sm shrink-0">3</span>
                  Version Bêta
                </h2>
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-4">
                  <p className="text-destructive font-semibold text-sm">⚠️ IMPORTANT : L'application Gestio est actuellement en version bêta.</p>
                </div>
                <p className="text-muted-foreground mb-3">Cela signifie que :</p>
                <ul className="space-y-2 text-muted-foreground list-none">
                  {[
                    "L'application peut contenir des bugs ou dysfonctionnements",
                    "Certaines fonctionnalités peuvent être modifiées ou supprimées sans préavis",
                    "L'application est fournie « en l'état » à des fins de test et de feedback",
                    "Aucune garantie de stabilité ou de disponibilité n'est offerte",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-destructive mt-1">›</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-muted-foreground mt-4">
                  En utilisant cette version bêta, vous acceptez ces conditions et vous engagez à signaler tout problème à{" "}
                  <a href="mailto:lamoms954@gmail.com" className="text-primary hover:underline">lamoms954@gmail.com</a>.
                </p>
              </div>
            </Reveal>

            {/* 4 */}
            <Reveal>
              <div className="bg-card border border-border rounded-2xl p-8">
                <h2 className="text-foreground text-xl font-semibold mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm shrink-0">4</span>
                  Acceptation des CGU
                </h2>
                <p className="text-muted-foreground">
                  L'utilisation de Gestio implique l'acceptation pleine et entière des présentes CGU. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'application.
                </p>
              </div>
            </Reveal>

            {/* 5 */}
            <Reveal>
              <div className="bg-card border border-border rounded-2xl p-8">
                <h2 className="text-foreground text-xl font-semibold mb-5 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm shrink-0">5</span>
                  Accès à l'application
                </h2>
                <div className="space-y-5">
                  <div>
                    <h3 className="text-foreground font-medium mb-2">5.1 Gratuité</h3>
                    <p className="text-muted-foreground">L'application Gestio est actuellement proposée <strong className="text-foreground">gratuitement</strong> dans sa version bêta.</p>
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium mb-2">5.2 Prérequis techniques</h3>
                    <p className="text-muted-foreground mb-2">L'utilisateur doit disposer :</p>
                    <ul className="space-y-1 text-muted-foreground list-none">
                      <li className="flex items-start gap-2"><span className="text-primary mt-1">›</span>D'un ordinateur compatible (Windows, macOS ou Linux)</li>
                      <li className="flex items-start gap-2"><span className="text-primary mt-1">›</span>D'un espace de stockage suffisant pour l'application et ses données</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium mb-2">5.3 Absence de compte utilisateur</h3>
                    <p className="text-muted-foreground">Gestio ne requiert <strong className="text-foreground">aucune création de compte</strong>. Aucune inscription, email ou mot de passe n'est demandé.</p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* 6 */}
            <Reveal>
              <div className="bg-card border border-border rounded-2xl p-8">
                <h2 className="text-foreground text-xl font-semibold mb-5 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm shrink-0">6</span>
                  Propriété intellectuelle
                </h2>
                <div className="space-y-5">
                  <div>
                    <h3 className="text-foreground font-medium mb-2">6.1 Droits de l'éditeur</h3>
                    <p className="text-muted-foreground">L'application Gestio, son code source, son interface, ses graphismes et sa documentation sont la propriété exclusive de Lamom's, protégés par les lois sur la propriété intellectuelle.</p>
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium mb-2">6.2 Licence d'utilisation</h3>
                    <p className="text-muted-foreground">Lamom's accorde à l'utilisateur une licence personnelle, non exclusive, non transférable et révocable d'utilisation de Gestio.</p>
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium mb-2">6.3 Restrictions</h3>
                    <p className="text-muted-foreground mb-2">Il est interdit de :</p>
                    <ul className="space-y-1 text-muted-foreground list-none">
                      {[
                        "Copier, modifier, distribuer ou vendre l'application",
                        "Décompiler, désassembler ou procéder à de l'ingénierie inverse",
                        "Utiliser l'application à des fins commerciales sans autorisation",
                        "Supprimer ou modifier les mentions de propriété intellectuelle",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="text-destructive mt-1">✕</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* 7 */}
            <Reveal>
              <div className="bg-card border border-border rounded-2xl p-8">
                <h2 className="text-foreground text-xl font-semibold mb-5 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm shrink-0">7</span>
                  Responsabilités
                </h2>
                <div className="space-y-5">
                  <div>
                    <h3 className="text-foreground font-medium mb-2">7.1 Responsabilité de l'éditeur</h3>
                    <p className="text-muted-foreground mb-3">Lamom's s'efforce de fournir une application fonctionnelle mais <strong className="text-foreground">ne peut garantir</strong> : l'absence totale de bugs, la compatibilité avec tous les systèmes, l'exactitude des calculs, ni la conservation des données en cas de dysfonctionnement.</p>
                    <div className="bg-muted/50 border border-border rounded-lg p-4">
                      <p className="text-muted-foreground text-sm"><strong className="text-foreground">En aucun cas</strong>, Lamom's ne pourra être tenu responsable de pertes de données, de dommages directs ou indirects, ou de décisions financières prises sur la base des informations de l'application.</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium mb-2">7.2 Responsabilité de l'utilisateur</h3>
                    <p className="text-muted-foreground mb-2">L'utilisateur est seul responsable :</p>
                    <ul className="space-y-1 text-muted-foreground list-none">
                      {[
                        "De la véracité des données qu'il saisit",
                        "De la sauvegarde régulière de ses données",
                        "Des décisions financières qu'il prend",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="text-primary mt-1">›</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* 8 */}
            <Reveal>
              <div className="bg-card border border-border rounded-2xl p-8">
                <h2 className="text-foreground text-xl font-semibold mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm shrink-0">8</span>
                  Données personnelles
                </h2>
                <p className="text-muted-foreground">
                  Les données saisies dans Gestio sont stockées <strong className="text-foreground">exclusivement en local</strong> sur votre appareil. Aucune donnée n'est transmise à Lamom's ni à des tiers.
                  Pour plus de détails, consultez notre{" "}
                  <a href="/confidentialite" className="text-primary hover:underline font-medium">Politique de Confidentialité</a>.
                </p>
              </div>
            </Reveal>

            {/* 9 */}
            <Reveal>
              <div className="bg-card border border-border rounded-2xl p-8">
                <h2 className="text-foreground text-xl font-semibold mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm shrink-0">9</span>
                  Modifications des CGU
                </h2>
                <p className="text-muted-foreground">
                  Lamom's se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés des modifications lors de la mise à jour de l'application. L'utilisation continue de l'application après modification vaut acceptation des nouvelles CGU.
                </p>
              </div>
            </Reveal>

            {/* 10 */}
            <Reveal>
              <div className="bg-card border border-border rounded-2xl p-8">
                <h2 className="text-foreground text-xl font-semibold mb-5 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm shrink-0">10</span>
                  Résiliation
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-foreground font-medium mb-1">10.1 Par l'utilisateur</h3>
                    <p className="text-muted-foreground">L'utilisateur peut cesser d'utiliser Gestio à tout moment en désinstallant l'application.</p>
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium mb-1">10.2 Par l'éditeur</h3>
                    <p className="text-muted-foreground">Lamom's peut suspendre ou résilier l'accès à l'application en cas de non-respect des CGU.</p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* 11 */}
            <Reveal>
              <div className="bg-card border border-border rounded-2xl p-8">
                <h2 className="text-foreground text-xl font-semibold mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm shrink-0">11</span>
                  Droit applicable et litiges
                </h2>
                <p className="text-muted-foreground">
                  Les présentes CGU sont régies par le <strong className="text-foreground">droit français</strong>. En cas de litige, les parties s'engagent à rechercher une solution amiable. À défaut, les tribunaux français seront compétents.
                </p>
              </div>
            </Reveal>

            {/* 12 */}
            <Reveal>
              <div className="bg-card border border-primary/30 rounded-2xl p-8">
                <h2 className="text-foreground text-xl font-semibold mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm shrink-0">12</span>
                  Contact
                </h2>
                <p className="text-muted-foreground">
                  Pour toute question concernant ces CGU :{" "}
                  <a href="mailto:lamoms954@gmail.com" className="text-primary hover:underline font-medium">lamoms954@gmail.com</a>
                </p>
              </div>
            </Reveal>

            <Reveal>
              <p className="text-center text-muted-foreground text-sm pt-4">© 2026 Lamom's — Tous droits réservés</p>
            </Reveal>

          </div>
        </div>
      </section>
    </main>
    <FooterSection />
  </>
);

export default CGUPage;

