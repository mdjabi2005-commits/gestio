import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import Reveal from "@/components/Reveal";
import { Shield, Lock, X, Check } from "lucide-react";

const ConfidentialitePage = () => (
  <>
    <Navbar />
    <main className="pt-[72px]">
      <section className="py-20 bg-background min-h-screen">
        <div className="container max-w-[860px]">
          <Reveal>
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-wider mb-4">
                <Shield className="w-4 h-4" />
                Légal
              </div>
              <h1 className="text-foreground text-[clamp(2rem,4vw,3rem)] font-bold mb-3">
                Politique de Confidentialité
              </h1>
              <p className="text-muted-foreground text-sm">Dernière mise à jour : 16 février 2026</p>
            </div>
          </Reveal>

          {/* Résumé hero */}
          <Reveal>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
              {[
                { q: "Données stockées ?", r: "Sur votre appareil uniquement" },
                { q: "Accès Lamom's ?", r: "Non, jamais" },
                { q: "Données partagées ?", r: "Non, avec personne" },
                { q: "Compte requis ?", r: "Non" },
                { q: "Fonctionne hors ligne ?", r: "Oui, 100%" },
                { q: "Cookies / tracking ?", r: "Aucun" },
              ].map(({ q, r }) => (
                <div key={q} className="bg-card border border-primary/20 rounded-xl p-4 text-center">
                  <p className="text-muted-foreground text-xs mb-1">{q}</p>
                  <p className="text-primary font-semibold text-sm">{r}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <div className="space-y-8 text-[0.9375rem] leading-relaxed">

            {/* 1 */}
            <Reveal>
              <div className="bg-card border border-border rounded-2xl p-8">
                <h2 className="text-foreground text-xl font-semibold mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm shrink-0">1</span>
                  Introduction
                </h2>
                <p className="text-muted-foreground mb-3">
                  La présente Politique de Confidentialité décrit comment l'application <strong className="text-foreground">Gestio</strong>, éditée par <strong className="text-foreground">Lamom's</strong>, traite vos données personnelles.
                </p>
                <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
                  <p className="text-foreground text-sm font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary shrink-0" />
                    Gestio a été conçu avec une approche <em>« Privacy by Design »</em> : vos données restent sur votre appareil.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* 2 */}
            <Reveal>
              <div className="bg-card border border-border rounded-2xl p-8">
                <h2 className="text-foreground text-xl font-semibold mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm shrink-0">2</span>
                  Éditeur et contact
                </h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li><span className="text-foreground font-medium">Application :</span> Gestio</li>
                  <li><span className="text-foreground font-medium">Éditeur :</span> Lamom's</li>
                  <li>
                    <span className="text-foreground font-medium">Email :</span>{" "}
                    <a href="mailto:lamoms954@gmail.com" className="text-primary hover:underline">lamoms954@gmail.com</a>
                  </li>
                </ul>
              </div>
            </Reveal>

            {/* 3 */}
            <Reveal>
              <div className="bg-card border border-border rounded-2xl p-8">
                <h2 className="text-foreground text-xl font-semibold mb-5 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm shrink-0">3</span>
                  Données traitées par l'application
                </h2>
                <div className="space-y-5">
                  <div>
                    <h3 className="text-foreground font-medium mb-3">3.1 Données que vous saisissez</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left text-foreground font-semibold py-2 pr-4">Type de donnée</th>
                            <th className="text-left text-muted-foreground font-medium py-2">Exemples</th>
                          </tr>
                        </thead>
                        <tbody className="text-muted-foreground">
                          {[
                            ["Transactions financières", "Montants, dates, descriptions"],
                            ["Catégories", "Alimentation, Logement, Transport, etc."],
                            ["Transactions récurrentes", "Abonnements, loyers, salaires"],
                            ["Pièces jointes", "Photos de tickets, reçus"],
                          ].map(([type, ex]) => (
                            <tr key={type} className="border-b border-border/50">
                              <td className="py-3 pr-4 text-foreground">{type}</td>
                              <td className="py-3">{ex}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium mb-2">3.2 Données techniques</h3>
                    <p className="text-muted-foreground mb-2">L'application peut stocker localement :</p>
                    <ul className="space-y-1 text-muted-foreground list-none">
                      {["Vos préférences d'affichage", "L'historique de vos filtres et recherches", "La configuration de l'application"].map((item) => (
                        <li key={item} className="flex items-start gap-2"><span className="text-primary mt-1">›</span>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* 4 */}
            <Reveal>
              <div className="bg-card border border-primary/30 rounded-2xl p-8">
                <h2 className="text-foreground text-xl font-semibold mb-5 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm shrink-0">4</span>
                  Stockage des données : 100% Local
                </h2>
                <div className="bg-primary/10 border border-primary/30 rounded-xl p-5 mb-5">
                  <p className="text-foreground font-semibold text-base flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary shrink-0" />
                    Toutes vos données sont stockées EXCLUSIVEMENT sur votre appareil.
                  </p>
                  <p className="text-muted-foreground text-sm mt-2">Gestio utilise une base de données locale (SQLite) qui réside uniquement sur votre ordinateur.</p>
                </div>
                <h3 className="text-foreground font-medium mb-3">4.2 Aucune transmission de données</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "N'envoie AUCUNE donnée vers des serveurs externes",
                    "Ne collecte AUCUNE information sur votre utilisation",
                    "Ne partage AUCUNE donnée avec des tiers",
                    "N'utilise PAS de services d'analytics ou de tracking",
                    "Ne requiert PAS de connexion internet pour fonctionner",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                      <X className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground text-sm">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground text-sm mt-4">
                  <strong className="text-foreground">4.3 Emplacement des données :</strong> Vos données sont stockées dans le dossier d'installation de l'application. Vous en êtes l'unique propriétaire et responsable.
                </p>
              </div>
            </Reveal>

            {/* 5 */}
            <Reveal>
              <div className="bg-card border border-border rounded-2xl p-8">
                <h2 className="text-foreground text-xl font-semibold mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm shrink-0">5</span>
                  Pas de compte utilisateur
                </h2>
                <p className="text-muted-foreground mb-3">Gestio ne requiert <strong className="text-foreground">aucune création de compte</strong>. Nous ne collectons donc :</p>
                <div className="space-y-2">
                  {["Aucune adresse email", "Aucun mot de passe", "Aucune information d'identification"].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <X className="w-4 h-4 text-destructive shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* 6 */}
            <Reveal>
              <div className="bg-card border border-border rounded-2xl p-8">
                <h2 className="text-foreground text-xl font-semibold mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm shrink-0">6</span>
                  Pas de cookies ni traceurs
                </h2>
                <p className="text-muted-foreground mb-3">L'application Gestio étant une application desktop (et non un site web), elle :</p>
                <div className="space-y-2">
                  {["N'utilise pas de cookies", "N'utilise pas de pixels de tracking", "Ne collecte pas d'identifiants publicitaires"].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <X className="w-4 h-4 text-destructive shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* 7 */}
            <Reveal>
              <div className="bg-card border border-border rounded-2xl p-8">
                <h2 className="text-foreground text-xl font-semibold mb-5 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm shrink-0">7</span>
                  Services tiers
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                    <h3 className="text-foreground font-medium mb-1">7.1 OCR (Reconnaissance de caractères)</h3>
                    <p className="text-muted-foreground text-sm">La fonctionnalité d'import de tickets par OCR traite les images <strong className="text-foreground">localement</strong> sur votre appareil. Aucune image n'est envoyée vers des serveurs externes.</p>
                  </div>
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                    <h3 className="text-foreground font-medium mb-1">7.2 Aucun service cloud</h3>
                    <p className="text-muted-foreground text-sm">Gestio n'utilise aucun service cloud pour le stockage ou le traitement de vos données.</p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* 8 */}
            <Reveal>
              <div className="bg-card border border-border rounded-2xl p-8">
                <h2 className="text-foreground text-xl font-semibold mb-5 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm shrink-0">8</span>
                  Sécurité des données
                </h2>
                <div className="mb-4">
                  <h3 className="text-foreground font-medium mb-2">8.1 Mesures techniques</h3>
                  <ul className="space-y-1 text-muted-foreground list-none">
                    {["Les données sont stockées dans une base SQLite locale", "L'accès aux données est limité à l'application Gestio"].map((item) => (
                      <li key={item} className="flex items-start gap-2"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-foreground font-medium mb-2">8.2 Recommandations utilisateur</h3>
                  <ul className="space-y-1 text-muted-foreground list-none">
                    {[
                      "🔐 Protégez votre session utilisateur par un mot de passe",
                      "💾 Effectuez des sauvegardes régulières de vos données",
                      "🛡️ Maintenez votre système d'exploitation à jour",
                      "🔒 Chiffrez votre disque dur si vous manipulez des données sensibles",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 py-1">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>

            {/* 9 */}
            <Reveal>
              <div className="bg-card border border-border rounded-2xl p-8">
                <h2 className="text-foreground text-xl font-semibold mb-5 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm shrink-0">9</span>
                  Vos droits
                </h2>
                <p className="text-muted-foreground mb-4">Étant donné que vos données sont stockées <strong className="text-foreground">uniquement sur votre appareil</strong>, vous disposez d'un contrôle total :</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-foreground font-semibold py-2 pr-4">Droit</th>
                        <th className="text-left text-muted-foreground font-medium py-2">Comment l'exercer</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      {[
                        ["Accès", "Consultez vos données directement dans l'application"],
                        ["Rectification", "Modifiez vos transactions à tout moment"],
                        ["Suppression", "Supprimez vos données ou désinstallez l'application"],
                        ["Portabilité", "Exportez vos données (fonctionnalité à venir)"],
                      ].map(([droit, comment]) => (
                        <tr key={droit} className="border-b border-border/50">
                          <td className="py-3 pr-4 text-primary font-medium">{droit}</td>
                          <td className="py-3">{comment}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-muted-foreground text-sm mt-4 italic">Lamom's n'ayant pas accès à vos données, nous ne pouvons pas les modifier, supprimer ou vous les transmettre.</p>
              </div>
            </Reveal>

            {/* 10 */}
            <Reveal>
              <div className="bg-card border border-border rounded-2xl p-8">
                <h2 className="text-foreground text-xl font-semibold mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm shrink-0">10</span>
                  Utilisation par les mineurs
                </h2>
                <p className="text-muted-foreground mb-3">Gestio peut être utilisé par des personnes de tout âge. Étant donné que l'application ne collecte aucune donnée personnelle et ne requiert pas de compte, il n'existe pas de restriction d'âge légale.</p>
                <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-primary">Recommandation :</strong> Pour les jeunes utilisateurs, nous encourageons l'accompagnement d'un parent ou tuteur afin de favoriser une bonne éducation financière.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* 11 */}
            <Reveal>
              <div className="bg-card border border-border rounded-2xl p-8">
                <h2 className="text-foreground text-xl font-semibold mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm shrink-0">11</span>
                  Modifications de cette politique
                </h2>
                <p className="text-muted-foreground">
                  Cette Politique de Confidentialité peut être mise à jour occasionnellement. La date de « Dernière mise à jour » en haut du document sera modifiée en conséquence. Nous vous encourageons à consulter régulièrement cette page.
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
                  Pour toute question relative à cette Politique de Confidentialité ou à la protection de vos données :{" "}
                  <a href="mailto:lamoms954@gmail.com" className="text-primary hover:underline font-medium">lamoms954@gmail.com</a>
                </p>
              </div>
            </Reveal>

            <Reveal>
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
                <p className="text-primary font-semibold italic text-lg">« Gestio respecte votre vie privée. Vos finances, vos données, votre contrôle. »</p>
                <p className="text-muted-foreground text-sm mt-2">© 2026 Lamom's — Tous droits réservés</p>
              </div>
            </Reveal>

          </div>
        </div>
      </section>
    </main>
    <FooterSection />
  </>
);

export default ConfidentialitePage;

