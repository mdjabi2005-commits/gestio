# Gestio — réconciliation documentaire, porte de validation 1

Date : 2026-09-20. Base Git inspectée : `14cf798` (`main`).

Ce rapport prépare une décision humaine. Il ne constitue ni le PRD final, ni
une validation des parcours, ni une autorisation de commencer le code.
Les propositions de sections restent dans ce rapport jusqu'à l'arbitrage.

## Exécution et périmètre

- Orchestration Astra ; paramètres demandés : `gpt-6-astra`, effort `high`.
- Quatre workers effectivement lancés avec `gpt-5.6-luna`, effort `medium` :
  Première ouverture, Usage courant, Objectif / Point de situation, Simulation.
- Workers en lecture seule ; aucun choix métier délégué à un worker.
- Skill appliquée :
  `C:/Users/djabi/bibliotheque/lamoms-ia/agents/skills/lamoms/SKILL.md`.
- Aucun Graphify, appel bancaire, relevé réel, test applicatif ou navigation UX.
- Les constats de code sont statiques. Une classe présente, un lien Emerge ou
  une maquette ne prouvent pas le fonctionnement d'un parcours.

## Sources transverses et fraîcheur

Les chemins relatifs ci-dessous partent du dépôt Gestio. Le corpus désigne
`C:/Users/djabi/bibliotheque/docs/knowledge/profiles/gestio/context`.

| Source | Constat et portée |
|---|---|
| `AGENTS.md` | Convention des services, des rôles et des décisions ; sa date annoncée pour le corpus est périmée. |
| Corpus, historique Git | Dernier commit sur `context` : `214268d`, 2026-09-18, `docs: align savings contracts`, après les décisions d'août. |
| `docs/AUDIT_SERVICES_PARCOURS_CHECKPOINT.md:3` | Photographie du 2026-09-05, révision annoncée `c1bb09e` ; à confronter au code présent. |
| Kotlin actuel | Dernier commit touchant les fichiers `*.kt` : `9165669`, 2026-09-08 ; les commits documentaires récents ne livrent pas de nouveaux modules Kotlin. |
| `docs/emerge-kotlin.yaml`, `.lamoms/lab/emerge-kotlin/` | Exports existants consultés ; fichier de métriques daté localement du 2026-09-08. Aucun recalcul pendant cette phase. La date du fichier n'est pas une attestation de correspondance exacte à HEAD. |
| `.lamoms/refondation-identite-gestio.md`, `.lamoms/glossaire-gestio.md` | Nouveau cadrage du copilote, pockets, fonds d'urgence et objectifs multiples ; à réconcilier avec le corpus. |
| `.lamoms/stitch-brief.md:5` | Référence UX des quatre parcours actuels, dont Objectif ; aucune preuve Kotlin. |
| `tools/powens-sandbox/POWENS_TRANSACTION_MATRIX.md:619` | Contrats candidats, positions exprimées et matrice écrans/données ; actualisés jusqu'au commit `14cf798` du 20 septembre. Le document les qualifie de propositions, pas de validation métier/architecture. |
| `C:/Users/djabi/bibliotheque/docs/core/POWENS.md:7` | Référence fournisseur locale : exploration Sandbox partielle, intégration applicative et production non validées. API non revérifiée sur Internet pendant cette analyse documentaire. |
| `.lamoms/decisions/powens-backend-hosting-progression.yaml` | Seule décision canonique retrouvée dans ce dossier : `accepted`, `decided_by: user`, progression PC → Raspberry Pi → machine plus puissante selon mesures. Elle n'accepte pas à elle seule les contrats transactionnels ou le découpage des parcours. |

Les repères issus de l'historique des séances ont servi à retrouver les
évolutions des objectifs multiples ; les conclusions ci-dessous s'appuient
sur les fichiers relus dans cette phase.

## Vérifications réellement exécutées

| Contrôle | Résultat |
|---|---|
| `python C:\Users\djabi\bibliotheque\docs\bin\lamoms list journey --project gestio` | Réussi : `objectif`, `premiere-ouverture`, `simulation`, `usage-courant`, tous `draft`. |
| `python C:\Users\djabi\bibliotheque\docs\bin\lamoms check journey --all` | Échec : 4 fiches à corriger, toutes signalées pour fins de ligne CRLF. Le diagnostic indique que `set` réécrirait tout le fichier. |
| `lamoms sections journey objectif --project gestio` | Réussi : propriétaires de sections confirmés. |
| `lamoms get journey objectif journey --project gestio` | Réussi : intention, entrée, résultats et exclusions d'Objectif relus par l'outil canonique. |
| Git / inventaires / recherches / Emerge existant | Inspections statiques, sans régénération des exports. |

Le lancement Python a d'abord échoué dans la sandbox (`permission denied`),
puis les commandes de lecture ont réussi hors sandbox. L'échec `check` n'a
pas été contourné : aucune normalisation ni édition des fiches n'a été faite.
Il ne constitue pas une analyse sémantique des parcours ni un verdict UX.

## Arbitrages transverses proposés à l'humain

| Sujet | Sources en tension | Décision à consigner après réponse humaine |
|---|---|---|
| Public et promesse de la première version | `gestion-pourquoi.md:45` cible les étudiants autonomes et le suivi de dérive ; la refondation, lignes 27–65, parle plus largement de comprendre sa situation pour décider de ses objectifs. | Confirmer le public V1 et la promesse de référence ; dater explicitement ce qui remplace l'ancien cadrage. |
| Identité des parcours | Corpus : Première ouverture, Usage courant, Point de situation, Simulation. Fiches et brief : Première ouverture, Usage courant, Objectif, Simulation. | Fixer le rattachement d'Objectif et le propriétaire du suivi de trajectoire ; voir les options du worker 3. Aucun découpage ne peut encore être qualifié de définitif. |
| Fin de Première ouverture | Le corpus conduit jusqu'à la simulation, l'objectif et son financement ; la refondation, lignes 199–232, termine à la première situation puis Usage courant. | Dire si l'objectif est obligatoire à l'entrée, facultatif, ou repris dans un parcours distinct. |
| Flux entre plusieurs objectifs | `gestion-modele.md:159` impose une file à priorité stricte ; la fiche Objectif et la refondation, ligne 126, permettent de préparer le suivant avec la marge après effort choisi. | Articuler file séquentielle et préparation du prochain objectif ; décider si des efforts simultanés sont permis. Ne pas traiter ces formulations comme une règle unique déjà établie. |
| Fonds d'urgence | Corpus : fonds prioritaire et cible par défaut liée à six mois de vital. Refondation, lignes 153–165 et 234–240 : comptes désignés par l'utilisateur, solde réservé. | Définir le stock protégé, la cible éventuelle, l'alimentation et la reconstitution ; préciser ce qui se passe en l'absence de fonds. |
| Catégories et pockets | Corpus et Kotlin comportent un classement local ; matrice Powens, lignes 695–701 et 744–758 : catégorie fournisseur nominale, sans moteur concurrent automatique. | Stabiliser la relation catégorie fournisseur → pocket choisie et le comportement en cas de catégorie absente, notamment pour un import PDF. |
| Contrat transactionnel | `NormalizedTransaction.kt:25` ne porte pas séparément `type`, `categories`, `wording`, `comment`, `coming`, `active`, `deleted`. Les contrats candidats les distinguent. | Valider le contrat conservé, les absences/nulls et la séparation brut / dérivé / présentation, avant les tâches de migration. |
| Virements internes | Matrice, lignes 776–848 : neutralité au niveau des revenus/dépenses mais variation de liquidité par compte ; une jambe ambiguë exige un traitement explicite. | Définir les états incertains et leur effet sur les agrégats, sans assimiler tout `transfer` à un virement interne. |

Les positions déjà exprimées dans la matrice sont conservées comme telles.
L'arbitrage consiste à compléter et formaliser le contrat ; il n'est pas
nécessaire de redemander chaque préférence déjà explicitement formulée.

## Documents à conserver ou réconcilier

| Ensemble | Traitement proposé, soumis à validation |
|---|---|
| Les quatre fiches actuelles | Conserver pendant l'arbitrage. Première ouverture, Usage courant et Simulation ont un noyau commun aux deux cadrages. Le devenir d'Objectif dépend du choix sur Point de situation. |
| Une éventuelle fiche `point-de-situation` | Création uniquement si son identité autonome est retenue ; aucun fichier créé à ce stade. |
| `gestion-*.md`, refondation et glossaires | Chevauchements de règles et de vocabulaire à résoudre. Garder les raisons historiques ; référencer ensuite la source retenue et les décisions canoniques. Aucun document entier n'est déclaré supprimable par cette analyse. |
| Carte des écrans du corpus et `stitch-brief.md` | Deux découpages UX concurrents ; mettre à jour le brief après validation des parcours, sans en faire un contrat métier indépendant. |
| Corpus `parcours-*.mermaid` et `.lamoms/graphs/*.mermaid` | Pas des doublons équivalents : les premiers décrivent les parcours UX, les seconds des raccordements techniques visant le checkpoint. Garder la distinction, expliciter date et nature attendue/observée. |
| Checkpoint technique et exports Emerge | Conserver comme photographies datées ; vérifier chaque référence utile dans le code courant. |
| `POWENS_TRANSACTION_MATRIX.md` et décision d'hébergement | Conserver leurs rôles distincts : preuve/contrat candidat pour la matrice, décision acceptée pour l'hébergement. |

La redondance porte sur des règles recopiées, pas automatiquement sur des
fichiers intégralement inutiles. Aucune suppression n'est autorisée par ce rapport.

## Reprise après validation

Prochain propriétaire : maître de projet pour les arbitrages, puis Astra en
cadrage/plan pour leur transcription. Les décisions métier ou d'architecture
retenues devront vivre dans `.lamoms/decisions/<decision-id>.yaml` selon le
template canonique et le rôle humain prévu par Lamoms.

Après arbitrage : résoudre le défaut CRLF des seules fiches concernées,
reprendre `sections → get → set --as` pour chaque section autorisée, relire et
relancer `check journey --all`. Les statuts et `ux_validation` restent soumis
à la décision humaine. Le PRD unique `.lamoms/prd.md` vient après validation
des fiches ; les tasks viennent après acceptation du PRD ; le code vient après
validation du PRD et des tasks.

## Réconciliation technique des retours workers

Les quatre retours ont été reçus. Les synthèses suivantes corrigent les
généralisations des rapports bruts : un écran décrit dans le corpus n'est pas
forcément une convergence avec la fiche ; une relation Emerge vers un symbole
importé ne prouve pas que ce symbole est implémenté ; une proposition de worker
ne fixe pas le rattachement d'Objectif.

| Constat statique revérifié par l'orchestrateur | Conséquence |
|---|---|
| `androidApp/src/main/kotlin/com/gestio/app/MainActivity.kt:11` appelle seulement `SoldeDuMois(state = null)`. | Aucun des quatre parcours complets n'est accessible depuis cette entrée Android. |
| `shared/src/commonMain/kotlin/com/gestio/core/services/presentation/PresentationUsageCourant.kt:17` passe cinq arguments à `usageCourantState`, dont la définition dans `core/ui/UsageCourant.kt:37` en accepte quatre. | Incompatibilité de signature retrouvée ; aucun verdict de compilation n'est revendiqué. |
| Le même présentateur, ligne 25, construit `MonthExpensesScreenState` avec courbes/transactions/engagements ; la déclaration UI, ligne 56, attend mois/bilan/transactions. | Le présentateur et l'état d'écran ne sont pas alignés. |
| `PresentationSimulation.kt:46` passe six arguments à `SimulationScreenState`, déclaré avec cinq propriétés dans `core/ui/SimulationBudget.kt:25`. Il utilise aussi `state.pocketNames`, absent de cet état. | Autre rupture entre présentateur et UI. |
| Dans ce constructeur, `note` contient « Seuil haut observé… » et occupe la place de `objectiveConsequence`. | Ce texte ne peut pas être compté comme une projection d'objectif implémentée. |
| `ProjectionObjectifs.kt:5` importe les types `objectives`, puis `simulation` et `trajectory`. Les recherches dans les sources actuelles ne retrouvent pas leurs définitions. D'autres services importent aussi des types de comptes, pockets et budget absents. | Le socle est partiellement présent ; plusieurs façades dépendent encore d'éléments à réconcilier/récupérer. Leur présence ne suffit pas à déclarer le métier implémenté. |
| `LectureBancaire.kt:18` contient bien un appel aux transactions puis aux soldes Enable Banking, contrairement au manque décrit dans le checkpoint. | Le checkpoint ne doit pas être repris mot pour mot. Cela ne prouve ni un client fonctionnel complet, ni une intégration Powens. |
| Emerge actuel : 38 fichiers, 67 entités, 429 parsing hits ; checkpoint : 55 fichiers, 171 entités, 835 hits. | Les deux jeux de résultats ne décrivent pas le même périmètre. La présence de nœuds importés et l'absence de correspondance attestée à HEAD limitent la portée d'Emerge existant. |

Les chemins `core/...` ci-dessus sont relatifs à
`shared/src/commonMain/kotlin/com/gestio/`. Dans les annexes, les services
nommés renvoient à `shared/src/commonMain/kotlin/com/gestio/core/services/`,
avec les sous-dossiers `consultation`, `calcul` et `presentation`.

## Worker 1 — Première ouverture

### 1. Sources utilisées

Sources communes : AGENTS, skill Lamoms, décision d'hébergement, glossaire,
checkpoint et Emerge cités plus haut. Sources propres :
`context/parcours-premiere-ouverture.mermaid`, `context/carte-des-ecrans.mermaid`,
`context/gestion-categories.md`, `context/gestion-glossaire.md`,
`.lamoms/journeys/premiere-ouverture.md`, `core/POWENS.md` dans la bibliothèque,
matrice Powens lignes 619–848, services de Première ouverture et UI associée.

### 2. Convergences

Importer avant d'analyser, rendre les lacunes d'historique visibles, distinguer
le solde mensuel de la capacité, permettre les corrections et laisser la
qualification vital/plaisir à l'utilisateur. La fiche, lignes 47–79, expose
ces résultats ; les services présents couvrent partiellement leurs opérations.

### 3. Divergences

Le Mermaid commence par deux questions et va jusqu'à l'objectif/financement ;
la fiche commence par l'apport de données et s'arrête à une situation exploitable
puis Usage courant. Les deux questions ne sont donc pas un consensus établi
entre ces deux sources. Le corpus intercale Simulation avant Objectif ; la
fiche demande le rôle des comptes d'urgence, une profondeur visée de douze mois
et une lecture mensuelle/annuelle non exposées comme telles dans le présentateur.
Le Mermaid retire la confirmation du relevé et ouvre l'arbitrage depuis le
solde. Le classement local observé doit aussi être confronté à la position
Powens récente.

### 4. Écrans concernés

Corpus : Deux questions, Import, Solde du mois, Arbitrage des grosses lignes,
Confirmation des récurrences, Vital ou plaisir, Objectif et financement
(`parcours-premiere-ouverture.mermaid:10`). Simulation est un passage
interparcours. Le brief récent décrit plutôt PO-01 Historique disponible,
PO-02 Répartition, PO-03 Qualification, PO-04 Fonds d'urgence et PO-05 Première
situation (`.lamoms/stitch-brief.md:84`). Le choix de la séquence reste humain.

### 5. Données nécessaires par écran

| Écran / étape | Données utiles |
|---|---|
| Deux questions, si conservé | Estimation d'épargne et intention saisies ; aucune transaction requise. |
| Import / historique | Source, compte, identité technique, période et rapport d'import ; couverture et lacunes. |
| Solde / répartition | Revenus, dépenses, période, catégories et rapprochements internes. |
| Arbitrage | Ligne identifiable, montant, date, libellé humain, catégorie et contrepartie si disponible. |
| Récurrences | Séries, dates, montants, fréquence et nature fixe/variable à confirmer. |
| Qualification | Pockets, montants observés, décision vital/plaisir. |
| Fonds d'urgence | Comptes/supports identifiés, soldes datés, rôle désigné par l'utilisateur. |
| Situation / objectif éventuel | SH, SB, SPP, CP, limites de calcul ; cible, échéance et affectations explicites si Objectif est inclus. |

### 6. Calculs nécessaires

Couverture, bilan mensuel, rapprochement interne, récurrences, répartition,
seuils et CP. Si l'objectif est inclus : reste à financer et projection.
`BilanMensuel`, `AnalyseTransactions`, `SeuilsEtCapacites`,
`RepartitionEnveloppes` et `ProjectionObjectifs` sont les points d'entrée
existants à examiner ; leurs dépendances absentes empêchent de conclure à un
ensemble exécutable.

### 7. Services présents

`PresentationPremiereOuverture.kt:16` expose progression, déclarations,
arbitrage, qualification et création d'objectif ; `LectureReleves.kt:6`
expose l'import, `LectureBancaire.kt:9` la synchronisation bancaire existante,
`LectureDonneesLocales.kt:5` l'accès au store. `AnalyseTransactions.kt:9`
et `BilanMensuel.kt:6` portent les façades d'analyse et de bilan.

### 8. Capacités attendues absentes ou incomplètes

Navigation Android complète, choix dédié des comptes d'urgence, synthèse
annuelle, présentation de la profondeur historique, intégration Powens et
politique des transferts ambigus. La progression présente dans
`PresentationPremiereOuverture.kt:22` renvoie vers Simulation quand aucun
objectif non urgent n'existe, mais ne prouve pas une route utilisateur aboutie
vers sa création. Aucun nouveau service n'est imposé pour chacun de ces manques.

### 9. Liens avec les autres parcours

Sortie commune vers Usage courant. Le caractère obligatoire de Simulation et
d'Objectif dépend de l'arbitrage. Le Point de situation a besoin d'une règle
explicite lorsque l'utilisateur n'a pas encore d'objectif.

### 10. Propositions de sections, non appliquées

| Section | Contenu proposé |
|---|---|
| `journey` | Construire une première situation exploitable ; conserver le rôle humain sur qualification et urgence. Borner explicitement la sortie après arbitrage. |
| `user_flow` | Apport de données → couverture → analyse → corrections/qualification → rôle urgence → situation ; questions initiales, simulation et objectif à inclure seulement selon la décision. Étapes `expected` tant que non jouées. |
| `journey_links` | Sortie Usage courant ; liens Objectif/Simulation conditionnés par le découpage retenu. |
| `execution_flow` | Attendu : ingestion → normalisation → rapprochement/classification → agrégats → état d'écran. Présent mais non exécuté : fonctions repérées ci-dessus ; ne pas marquer tout le flux `observed` par lecture du code. |
| `supporting_tools`, `dependencies` | Sources financières, comptes, couverture, stockage, classification, décisions utilisateur ; Powens attendu, accès Enable Banking présent mais non validé. |
| `code_refs` | Référencer les fichiers de services réellement présents et l'entrée Android, avec leur limite ; aucun module absent. |
| Preuves / journal / checkpoints | Attendre un import vérifié, ses limites de couverture et les choix explicites ; observations d'usage à produire ensuite par reviewT. |

## Worker 2 — Usage courant

### 1. Sources utilisées

Sources communes ci-dessus ; `.lamoms/journeys/usage-courant.md`,
`.lamoms/graphs/usage-courant.mermaid`, `context/parcours-usage-courant.mermaid`,
`context/gestion-usage-courant.md`, `context/gestion-modele.md`,
`context/gestion-glossaire.md`, matrice Powens lignes 619–848,
`core/ui/UsageCourant.kt`, services de consultation et de calcul correspondants.

### 2. Convergences

Budget libre distinct de CP, engagements connus, planification explicite,
liquidité par compte et lecture des dépenses. L'affectation d'épargne reste
distincte d'une pocket de dépenses. L'arrivée d'une dépense simulée n'engage
la situation courante qu'après décision explicite.

### 3. Divergences

Le corpus privilégie une consultation courte centrée sur « combien dépenser
maintenant ? » ; la fiche, lignes 10–29, comprend aussi vue mensuelle/annuelle,
rythme financier, protection et changements depuis la dernière visite. Le
brief récent répartit ces lectures dans UC-01 à UC-04. Le Kotlin présent
reste plus proche du budget libre historique. La réserve automatique
d'épargne positive non encore virée est explicite dans le modèle du corpus,
mais doit être articulée avec la définition plus courte du glossaire récent.

### 4. Écrans concernés

Corpus : Usage courant, Alerte de liquidité, Planifier une dépense, Dépenses
du mois (`parcours-usage-courant.mermaid:8`). Brief récent : Situation actuelle,
Rythme financier, Pockets, Protection (`stitch-brief.md:175`). Le contrôle de
liquidité volontaire du glossaire récent doit être articulé avec l'alerte
prioritaire du corpus, sans en déduire un tableau de bord permanent.

### 5. Données nécessaires par écran

| Écran | Données utiles |
|---|---|
| Budget libre | Soldes courants datés, prochaine entrée/horizon, engagements, épargne réservée selon contrat, trois mouvements à venir et trois récents. |
| Liquidité | Compte d'origine, solde daté, séquence d'engagements, date, montant, déficit ou information insuffisante. |
| Planifier | Montant, date, compte, catégorie/pocket et nature ; lien avec le mouvement réalisé pour éviter le double comptage. |
| Dépenses du mois | Mois, réalisé, plafond, regroupements et transactions ; exclusion métier des internes confirmés. |
| Rythme / protection, si retenus | Profil mensuel, variabilité, CP et stock protégé ; état explicite lorsque les données manquent. |

### 6. Calculs nécessaires

Budget libre, horizon de prochaine entrée, engagements, liquidité par compte,
cumul mensuel et courbes réel/plafond. Les calculs ne doivent pas confondre
`coming`, `active`, `deleted`, absence et zéro. Le contrat des transferts doit
préserver leur effet sur la liquidité sans augmenter revenus/dépenses.

### 7. Services présents

`BudgetLibre.kt:6`, `Liquidite.kt:8`, `DepensesDuMois.kt:10`,
`SeuilsEtCapacites`, `AnalyseTransactions`, les deux lecteurs bancaire/local
et `PresentationUsageCourant.kt:12`. Ce dernier expose aussi `planifier`
et `realiser`. Les composables BudgetLibre, PlanifierDepense, AlerteLiquidite
et DepensesDuMois sont présents dans `core/ui/UsageCourant.kt`.

### 8. Capacités attendues absentes ou incomplètes

Raccordement Android, alignement présentateur/UI, dépendances métier manquantes,
états rythme/protection/annuel/changements et traitement des transferts
incertains. L'appel de réalisation d'une dépense planifiée lors de la réception
d'une transaction n'est pas démontré. `PlannedExpenseDraft.canSave`, ligne 51,
ne vérifie que la non-vacuité de la date : il ne constitue pas une validation
complète de l'entrée. Le contrôle doit être suivi jusqu'au stockage avant
toute future correction.

### 9. Liens avec les autres parcours

Première ouverture fournit la situation. Objectif et Simulation sont des
sorties volontaires de la fiche ; le corpus mène aussi vers Point de situation
pour le suivi et les arbitrages. Une simulation confirmée peut revenir sous
forme de dépense planifiée, sans double comptage lors de sa réalisation.

### 10. Propositions de sections, non appliquées

| Section | Contenu proposé |
|---|---|
| `journey` | Fixer la question dominante budget libre et décider si rythme/protection font partie de cette journey ou sont des lectures liées. |
| `user_flow` | Ouvrir → lire le disponible et ses limites → explorer engagements/dépenses → planifier volontairement ; conserver les états incomplets. |
| `journey_links` | Première ouverture en amont ; Objectif, Simulation et suivi de situation selon rattachement validé. |
| `execution_flow` | Attendu : soldes/transactions → engagements/rapprochement → budget/liquidité → état écran. Signaler les ruptures statiques ; aucun parcours `observed` bout en bout. |
| `supporting_tools`, `dependencies` | Source bancaire, store, comptes d'origine, fraîcheur, catégories, récurrences et engagement planifié. |
| `code_refs` | Services cités et `core/ui/UsageCourant.kt` réellement présents ; ne pas inventer de route Android. |
| Preuves / journal / checkpoints | Budget explicable à une date, manque de données visible, planification confirmée et rapprochement sans doublon ; validation UX ultérieure. |

## Worker 3 — Objectif / Point de situation

### 1. Sources utilisées

Sources communes ; `.lamoms/journeys/objectif.md`, glossaire récent,
`context/parcours-point-de-situation.mermaid`, `context/gestion-point-de-situation.md`,
`context/gestion-modele.md`, `context/gestion-glossaire.md`,
`context/carte-des-ecrans.mermaid`, matrice Powens lignes 619–848, services
ProjectionObjectifs, EcartTrajectoire, PresentationPointDeSituation et UI objectif.

### 2. Convergences

Un objectif se confronte à une situation exploitable ; le suivi compare
épargne affectée et trajectoire sans jugement. La chaîne de détail
enveloppes → pocket → transactions est volontaire. Stocks affectés et
capacité mensuelle doivent rester distincts.

### 3. Divergences

La fiche Objectif possède sa propre intention et un déclenchement après
Usage courant (`objectif.md:11`) ; le corpus place sa création dans Première
ouverture et sa progression dans Point de situation. Aucun lien explicite
vers ce dernier n'est présent dans la fiche.

Le modèle du corpus utilise un profil de capacités mensuelles et une file
séquentielle ; la fiche exprime effort choisi, marge disponible et préparation
d'un prochain objectif. `CP = SH - SB - SPP` peut être compatible avec le
profil mensuel si la période de SH et les règles de répartition sont précisées ;
ce n'est pas une contradiction algébrique à résoudre en choisissant une formule.

### 4. Écrans concernés

Objectif et financement ; Point de situation ; Enveloppes ; Pocket ;
Transactions ; notification hebdomadaire en amont. Le brief récent ajoute
les lectures OBJ-01 à OBJ-05 : cible, somme affectée, échéance et évaluations
avec/sans échéance. La notification n'est pas un écran Kotlin démontré.

### 5. Données nécessaires par écran

| Écran | Données utiles |
|---|---|
| Objectif / financement | Nom, cible, échéance facultative, supports, somme affectée, reste à financer, effort choisi et capacité commune. |
| Évaluation | Effort requis ou délai, écart, marge restante, hypothèses de projection. |
| Point de situation | Objectif actif, épargne affectée, période, courbes observée/référence, écart signé, conséquence temporelle, arbitrages. |
| Enveloppes | Dépensé/prévu par pocket et période, dépassement. |
| Pocket | Contribution, enveloppe, trois plus grosses sorties, accès à l'ajustement. |
| Transactions | Liste filtrée et datée, libellé humain, montant, catégorie et commentaire éventuel. |
| Notification | Jour choisi, information utile de suivi, lien vers la situation ; règle sans objectif à décider. |

### 6. Calculs nécessaires

Reste à financer, effort/délai, profil mensuel, allocation multi-objectifs,
écart, contribution des pockets et conséquence en temps. Le corpus prévoit
l'empilement des capacités et un secours constant explicitement estimé si
l'historique est insuffisant. Le calcul doit porter l'épargne affectée à
l'objectif, sans assimiler tout le stock d'épargne à sa progression.

### 7. Services présents

`ProjectionObjectifs.kt:18` expose projection/allocation/courbes et un secours
constant ; `EcartTrajectoire.kt:16` expose calcul et attribution ;
`PresentationPointDeSituation.kt:12` expose situation, enveloppes, pocket,
transactions et objectif actif. `core/ui/TonObjectif.kt:23` et
`core/ui/Creation.kt:23` contiennent état/formulaire. Plusieurs types et états
référencés ne sont toutefois pas définis dans le checkout.

### 8. Capacités attendues absentes ou incomplètes

Socle persistant complet des objectifs/affectations, références UI manquantes,
navigation Android, notification hebdomadaire et présentation fiable de
l'attribution. Le présentateur lit `store.savingsBalance()` pour construire
la progression (`PresentationPointDeSituation.kt:16`) : le raccordement entre
épargne globale et épargne affectée nécessite une preuve dédiée. Le code
présent ne prouve pas le contrat multi-objectifs récent.

### 9. Options de découpage laissées à l'humain

| Option | Argument | Fiches et conséquence |
|---|---|---|
| A — Objectif autonome et Point de situation distinct | Intention de création/évaluation distincte de la consultation hebdomadaire ; conforme à l'autonomie de la fiche actuelle. | Conserver les quatre fiches et créer une cinquième `point-de-situation` si ce suivi est retenu. Ajouter leurs liens et définir le comportement sans objectif. |
| B — Objectif intégré à Première ouverture | Conforme à la carte historique qui termine par Objectif et financement. | Conserver Première ouverture, Usage courant, Simulation ; créer/réorienter une fiche de suivi Point de situation. Décider du devenir d'`objectif.md` et de l'accès à la création après onboarding. Aucune suppression automatique. |
| C — Objectif sous-parcours de Point de situation | Le suivi est dominé par l'objectif et ses conséquences. | Réorienter l'actuelle fiche vers un ensemble Point de situation + gestion d'objectif, avec accord explicite sur l'identifiant. Distinguer les préconditions créer/consulter/suivre. |

Ces options ne constituent pas une recommandation imposée. Les quatre workers
décrivent quatre axes d'analyse ; leur nombre ne fixe pas le nombre final de
journeys. Il faut aussi décider si le suivi concerne un objectif actif ou
plusieurs, et s'il reste utile sans objectif.

### 10. Propositions de sections, non appliquées

| Section | Contenu proposé |
|---|---|
| `journey` | Distinguer créer/évaluer un objectif et vérifier une trajectoire ; placer ces intentions selon A, B ou C après arbitrage. |
| `user_flow` | Situation exploitable → cible/affectation/échéance → évaluation → décision ; suivi périodique et détail volontaire dans la partie correspondante. |
| `journey_links` | Rendre explicites création, consommation par le suivi, entrée Usage courant et exploration Simulation ; ne pas référencer comme existante une fiche non créée. |
| `execution_flow` | Attendu : lecture de la situation et des affectations → projection/écart → état principal/détails → action confirmée. Présence statique des façades à signaler séparément. |
| `supporting_tools`, `dependencies` | Soldes datés, affectations, profil de capacité, classification, notification si retenue ; stockage et navigation à compléter. |
| `code_refs` | Seulement les fichiers présents cités plus haut ; une référence peut pointer du code partiel sans attester son bon fonctionnement. |
| Preuves / journal / checkpoints | Montant et pocket confirmés, réserve d'urgence exclue, affectations sans double comptage, projection explicable, suivi daté ; décision UX humaine ultérieure. |

## Worker 4 — Simulation

### 1. Sources utilisées

Sources communes ; `.lamoms/journeys/simulation.md`, glossaire récent,
`context/parcours-simulation.mermaid`, `context/gestion-simulation.md`,
`context/gestion-modele.md`, matrice Powens lignes 619–848,
PresentationSimulation, RepartitionEnveloppes, SeuilsEtCapacites,
ProjectionObjectifs, `core/ui/SimulationBudget.kt`, store, modèle transactionnel,
rapprochement interne et bilan.

### 2. Convergences

Explorer sans adoption automatique, préserver la référence, rendre les
conséquences explicites, laisser les affectations à l'utilisateur, distinguer
capacité et argent disponible. L'écran de simulation utilise des agrégats
métier ; aucune transaction Powens brute n'y est nécessaire.

### 3. Divergences

Le corpus décrit surtout le réglage de l'enveloppe entre deux seuils et la
création de pocket. La fiche décrit objectifs, répartition, achats ponctuels,
charges récurrentes, imprévus et reconstitution de l'urgence
(`simulation.md:16`). Le Kotlin visible contient essentiellement un curseur
d'enveloppe. Le périmètre V1 doit dire quelles familles sont incluses.

### 4. Écrans concernés

Corpus : Simulation et Créer une pocket. Fiche/brief : choix de scénario,
variation d'objectif avec délai ou effort résultant, imprévu, comparaison et
décision. Les scénarios achat/charge de la fiche nécessitent aussi des états
appropriés, même s'ils partagent une surface ; aucun nombre de nouveaux écrans
n'est imposé par ce rapport.

### 5. Données nécessaires par écran

| Écran / scénario | Données utiles |
|---|---|
| Répartition | SH/SB, pockets, SPP, enveloppes, profil mensuel, CP et référence conservée. |
| Créer une pocket | Nom, qualification, montant proposé, historique si disponible, portée de la confirmation. |
| Objectif | Cible, échéance, somme affectée, effort retenu, autres objectifs et capacité disponible. |
| Achat ponctuel | Montant, date, compte éventuel, engagements et liquidité de référence. |
| Charge récurrente | Montant, périodicité, début et durée/horizon. |
| Imprévu | Choc, stock d'urgence protégé, reliquat, effort et délai de reconstitution, objectifs affectés. |
| Comparaison / adoption | Référence et scénario distingués, effets, action explicitement choisie et possibilité d'abandon. |

### 6. Calculs nécessaires

Répartition et compensation, CP, effort/délai d'objectif, achat sur liquidité
et trajectoire, coût récurrent sur horizon explicite, absorption/reconstitution
de l'urgence, effet sur plusieurs objectifs. Les calculs de comparaison
référence/scénario et les règles d'adoption restent à définir selon le
périmètre approuvé.

### 7. Services présents

`PresentationSimulation.kt:9` expose charger/déplacer/modifier/valider/créer/
compenser ; `RepartitionEnveloppes.kt:26` expose la répartition,
`SeuilsEtCapacites.kt:10` les bornes/capacités, `ProjectionObjectifs.kt:18`
les projections. `BudgetLibre` expose séparément la planification. Leur
présence ne résout pas les types manquants ni le désaccord présentateur/UI.

### 8. Capacités attendues absentes ou incomplètes

Comparaison générique, achat/charge/imprévu, reconstitution de l'urgence,
résultat multi-objectifs et adoption d'une dépense simulée ne sont pas
retrouvés comme flux complets. Une surface de répartition en mémoire existe
partiellement : il serait excessif de déclarer tout état temporaire absent.
En revanche `creerPoche`, ligne 28, appelle directement le store ; la frontière
entre création réelle et création dans un scénario doit être explicitée avant
de qualifier l'ensemble de non persistant jusqu'à validation.

### 9. Liens avec les autres parcours

Objectif ↔ Simulation pour explorer des variantes. Usage courant → Simulation
pour tester une dépense ou répartition. Point de situation → Simulation depuis
une pocket à ajuster. Retour vers Usage courant sous forme d'engagement
uniquement après confirmation. Lien avec Première ouverture selon arbitrage.

### 10. Propositions de sections, non appliquées

| Section | Contenu proposé |
|---|---|
| `journey` | Lister les familles retenues en V1 et exclure explicitement celles reportées ; conserver la décision de l'utilisateur. |
| `user_flow` | Charger référence → choisir scénario → ajuster → comparer → abandonner ou confirmer une action nommée. |
| `journey_links` | Relier création/évaluation, suivi et usage courant ; expliciter le retour comme engagement confirmé. |
| `execution_flow` | Attendu : état temporaire → calculs partagés → comparaison → persistance de la seule action confirmée. La répartition partielle et ses ruptures restent des faits statiques. |
| `supporting_tools`, `dependencies` | Situation exploitable, historique, pockets qualifiées, objectif si nécessaire, fonds d'urgence et engagements ; source bancaire en amont. |
| `code_refs` | Fichiers réels listés ; calculs futurs uniquement dans attendu/dépendances. |
| Preuves / journal / checkpoints | Référence inchangée à l'abandon, différence explicable, confirmation avant engagement, absence de double comptage ; reviewT puis validation humaine. |

## Sortie de cette phase

Un seul fichier documentaire créé par l'orchestrateur : ce rapport. Aucune
fiche, décision, maquette, source Kotlin, donnée utilisateur, PRD ou task
d'implémentation modifiée/créée. Les workers n'ont écrit aucun fichier.

Modifications préexistantes préservées : `tools/powens-sandbox/REPORT.md`,
`.graphify/`, `.lamoms/maquettes-compilees/`, `config/`. Aucun de ces éléments
n'entre dans le commit du rapport.

L'exécution s'arrête ici conformément à la première porte demandée : le maître
de projet doit arbitrer le découpage et les règles ci-dessus avant toute
réconciliation des fiches et production du PRD.
