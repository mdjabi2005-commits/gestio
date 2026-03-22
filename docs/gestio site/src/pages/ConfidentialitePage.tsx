import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import Reveal from "@/components/Reveal";
import { Shield, Lock, X, Check, AlertTriangle } from "lucide-react";

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
              <p className="text-muted-foreground text-sm">Dernière mise à jour : 4 mars 2026</p>
            </div>
          </Reveal>

          {/* Résumé hero */}
          <Reveal>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
              {[
                { q: "Données stockées ?", r: "Sur votre appareil uniquement", warn: false },
                { q: "Accès Lamom's ?", r: "Non, jamais", warn: false },
                { q: "Données partagées ?", r: "Non (sauf IA OCR opt.)", warn: true },
                { q: "Compte requis ?", r: "Non", warn: false },
                { q: "Fonctionne hors ligne ?", r: "Oui (sauf OCR IA opt.)", warn: true },
                { q: "Cookies / tracking ?", r: "Aucun", warn: false },
              ].map(({ q, r, warn }) => (
                <div key={q} className={`bg-card border rounded-xl p-4 text-center ${warn ? "border-amber-500/30" : "border-primary/20"}`}>
                  <p className="text-muted-foreground text-xs mb-1">{q}</p>
                  <p className={`font-semibold text-sm ${warn ? "text-amber-500" : "text-primary"}`}>{r}</p>
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
                    "N'envoie AUCUNE donnée financière vers des serveurs externes",
                    "Ne collecte AUCUNE information sur votre utilisation",
                    "Ne partage AUCUNE donnée avec des tiers à des fins commerciales",
                    "N'utilise PAS de services d'analytics ou de tracking",
                    "Ne requiert PAS de connexion internet pour fonctionner",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                      <X className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground text-sm">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-start gap-3 mt-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground text-sm">
                    <strong className="text-amber-500">Exception optionnelle :</strong> si vous activez l'analyse IA des tickets (OCR Groq), le texte extrait est transmis à l'API Groq. → <a href="#groq" className="text-amber-500 hover:underline">Voir section 7.2</a>
                  </span>
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
              <div id="groq" className="bg-card border border-border rounded-2xl p-8">
                <h2 className="text-foreground text-xl font-semibold mb-5 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm shrink-0">7</span>
                  Services tiers
                </h2>
                <div className="space-y-4">

                  {/* 7.1 OCR local */}
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                    <h3 className="text-foreground font-medium mb-2 flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      7.1 Extraction OCR — 100% local (RapidOCR)
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      L'extraction du texte depuis vos images et PDF de tickets se fait <strong className="text-foreground">entièrement sur votre appareil</strong> via RapidOCR. Aucune image, aucun fichier PDF n'est jamais transmis vers l'extérieur.
                    </p>
                  </div>

                  {/* 7.2 Groq — service cloud optionnel */}
                  <div className="p-4 bg-amber-500/5 border border-amber-500/30 rounded-xl">
                    <h3 className="text-foreground font-medium mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      7.2 Classification IA — Groq (service optionnel, cloud)
                    </h3>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>
                        Gestio propose en option une classification intelligente des tickets via <strong className="text-foreground">l'API Groq</strong> (Groq, LLC — États-Unis), utilisant le modèle <code className="bg-muted px-1 py-0.5 rounded text-xs">llama-3.3-70b-versatile</code>.
                      </p>
                      <div className="space-y-2">
                        <p className="text-foreground font-medium text-xs uppercase tracking-wide">Ce qui est transmis à Groq :</p>
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>Le <strong className="text-foreground">texte brut extrait</strong> de votre ticket (résultat de l'OCR local). <em>Pas l'image originale, pas votre nom, pas vos données bancaires.</em></span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-foreground font-medium text-xs uppercase tracking-wide">Ce qui n'est pas transmis :</p>
                        {[
                          "Vos données financières (montants, soldes, historique)",
                          "Vos fichiers ou images originaux",
                          "Toute information permettant de vous identifier",
                        ].map((item) => (
                          <div key={item} className="flex items-start gap-2">
                            <X className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 space-y-1">
                        <p className="text-amber-500 font-medium text-xs">⚠️ Conditions d'activation</p>
                        <ul className="space-y-1 list-none">
                          {[
                            "Vous devez configurer votre propre clé API Groq (GROQ_API_KEY)",
                            "Cette fonctionnalité est inactive par défaut — l'OCR reste local si aucune clé n'est fournie",
                            "Vous pouvez supprimer votre clé à tout moment depuis les paramètres de l'application",
                          ].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-muted-foreground">
                              <span className="text-amber-500 mt-0.5">›</span>{item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <p>
                        En utilisant cette fonctionnalité, vous acceptez la{" "}
                        <a
                          href="https://groq.com/privacy-policy/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-500 hover:underline font-medium"
                        >
                          Politique de confidentialité de Groq, LLC
                        </a>
                        . Les données transmises sont soumises au droit américain.
                      </p>
                    </div>
                  </div>

                  {/* 7.3 Aucun autre service cloud */}
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                    <h3 className="text-foreground font-medium mb-1 flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      7.3 Aucun autre service cloud
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      En dehors de Groq (optionnel et sous votre contrôle), Gestio n'utilise aucun autre service cloud pour le stockage, le traitement ou l'analyse de vos données.
                    </p>
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

