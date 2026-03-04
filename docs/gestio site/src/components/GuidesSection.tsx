import { useState } from "react";
import { ChevronDown, Play } from "lucide-react";
import Reveal from "./Reveal";

const guides = [
	{
		id: "demarrage",
		title: "Premiers pas — installation & lancement",
		description: "En quelques minutes, Gestio est prêt sur votre machine.",
		video: "/videos/guide_1_demarrage.webp",
		steps: [
			{ bold: "Téléchargez l'installateur", text: " depuis la page Télécharger — aucun compte requis." },
			{ bold: "Lancez le fichier .exe", text: " : l'installation se fait dans votre espace utilisateur, sans droits admin." },
			{ bold: "Gestio s'ouvre dans votre navigateur", text: " automatiquement au premier lancement." },
			{ bold: "Explorez le tableau de bord", text: " : accueil, ajout de transactions, récurrences et graphiques accessibles depuis le menu." },
		],
		tip: "Aucune connexion internet requise après installation — vos données restent 100% locales.",
	},
	{
		id: "transactions",
		title: "Ajouter & gérer ses transactions",
		description: "Plusieurs modes d'ajout pour s'adapter à votre façon de travailler.",
		video: "/videos/guide_2_transactions.webp",
		steps: [
			{ bold: "Mode Récurrence", text: " : configurez vos dépenses fixes (loyer, abonnements, salaire) une seule fois — Gestio les génère automatiquement." },
			{ bold: "Mode CSV/Excel", text: " : importez d'un coup l'historique de votre banque." },
			{ bold: "Mode PDF", text: " : idéal pour vos factures et fiches de paie." },
			{ bold: "Modification directe", text: " : éditez ou supprimez vos transactions directement dans le tableau interactif." },
		],
		tip: "Les récurrences sont le moyen le plus rapide de garder votre suivi à jour sans aucune saisie manuelle répétitive.",
	},
	{
		id: "ocr",
		title: "Scanner un ticket (OCR)",
		description: "Photographiez votre ticket, l'IA extrait montant, date et catégorie.",
		video: "/videos/guide_3_ocr.webp",
		steps: [
			{ bold: "Placez vos tickets", text: " dans votre dossier de surveillance configuré dans Gestio." },
			{ bold: "Cliquez « Analyser »", text: " — Gestio traite tous les tickets en attente en quelques secondes." },
			{ bold: "Vérifiez les données extraites", text: " : montant, date, commerçant et catégorie proposés par l'IA." },
			{ bold: "Cliquez « Valider et Ranger »", text: " pour enregistrer et archiver le ticket automatiquement." },
		],
		tip: "Pour de meilleurs résultats, prenez des photos bien éclairées avec le ticket à plat.",
	},
	{
		id: "graphiques",
		title: "Analyser avec les graphiques",
		description: "Visualisez vos finances en un coup d'œil grâce aux tableaux de bord interactifs.",
		video: "/videos/guide_4_graphiques.webp",
		steps: [
			{ bold: "Graphique Sunburst", text: " : répartition hiérarchique de vos dépenses par catégorie et sous-catégorie." },
			{ bold: "Graphique d'évolution", text: " : revenus vs dépenses et solde mois par mois." },
			{ bold: "Tableau interactif", text: " : toutes vos transactions filtrables et éditables en un clic." },
			{ bold: "Filtrez par période", text: " : utilisez le calendrier pour analyser un mois, un trimestre ou une année." },
		],
		tip: "Cliquez sur une section du sunburst pour vous focaliser sur une catégorie de dépenses.",
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
							Des mini-guides vidéo pour démarrer rapidement et tirer le meilleur de l&apos;application.
						</p>
					</div>
				</Reveal>

				<div className="flex flex-col gap-4">
					{guides.map((g, i) => {
						const isActive = activeIndex === i;
						return (
							<Reveal key={g.id} delay={i * 60}>
								<div
									className={`bg-card border rounded-2xl overflow-hidden transition-all duration-300 ${isActive ? "border-primary shadow-lg shadow-primary/10" : "border-border hover:border-primary/50"
										}`}
								>
									{/* Header */}
									<button
										className="w-full p-6 flex items-center justify-between hover:bg-muted/40 transition-colors text-left"
										onClick={() => setActiveIndex(isActive ? null : i)}
										aria-expanded={isActive}
									>
										<div className="flex items-center gap-4">
											<div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
												{i + 1}
											</div>
											<div>
												<h3 className="text-foreground font-semibold text-base">{g.title}</h3>
												<p className="text-muted-foreground text-sm mt-0.5">{g.description}</p>
											</div>
										</div>
										<div className="flex items-center gap-3 shrink-0 ml-4">
											{!isActive && (
												<span className="hidden sm:flex items-center gap-1.5 text-xs text-primary font-medium bg-primary/10 px-3 py-1.5 rounded-full">
													<Play className="w-3 h-3" />
													Voir le guide
												</span>
											)}
											<ChevronDown
												className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isActive ? "rotate-180" : ""}`}
											/>
										</div>
									</button>

									{/* Content */}
									<div
										className="overflow-hidden transition-all duration-500"
										style={{ maxHeight: isActive ? "1400px" : "0" }}
									>
										<div className="border-t border-border">
											<div className="flex flex-col gap-0">

												{/* Steps + Tip — en haut */}
												<div className="px-6 py-6">
													<ol className="pl-5 text-muted-foreground list-decimal space-y-3">
														{g.steps.map((s, j) => (
															<li key={j} className="leading-relaxed">
																<strong className="text-foreground">{s.bold}</strong>
																{s.text}
															</li>
														))}
													</ol>
													<div className="mt-5 p-4 bg-primary/10 rounded-xl border-l-[3px] border-primary">
														<p className="text-sm text-muted-foreground">
															<strong className="text-primary">Astuce :</strong> {g.tip}
														</p>
													</div>
												</div>

												{/* Vidéo — en bas, pleine largeur */}
												{g.video && (
													<div className="px-5 pb-5">
														<div className="relative rounded-xl overflow-hidden border border-border/60 shadow-[0_8px_32px_rgba(0,0,0,0.45)] bg-black">
															{/* Barre fenêtre fictive */}
															<div className="flex items-center gap-1.5 px-3 py-2 bg-muted/60 border-b border-border/40">
																<span className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
																<span className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
																<span className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
																<span className="ml-3 text-[10px] text-muted-foreground/60 font-mono truncate">gestio — {g.title}</span>
															</div>
															<img
																src={g.video}
																alt={`Démonstration : ${g.title}`}
																className="w-full object-contain"
															/>
														</div>
													</div>
												)}

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
