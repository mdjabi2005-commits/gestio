# Checkpoint — services, données et pages de Gestio

Date : 2026-09-05. Révision applicative analysée : `c1bb09e` sur `main`.

## Résultat

Le code ne suit pas encore entièrement l'organisation retenue : famille →
classe publique du service → fichiers internes si nécessaire. Les calculs
existent largement sous forme de fonctions Kotlin par domaine, mais les
responsabilités de consultation, calcul et présentation se rejoignent dans
`MainActivity` et `GestioStore`. Les 16 noms proposés ne correspondent pas encore
à 16 classes publiques de services dans les sources de production.

La maquette est bien en React/TypeScript. Elle apporte des écrans et une
navigation de démonstration ; elle n'est pas connectée au stockage Kotlin.
Des écrans Compose et des raccordements Android existent déjà. Finaliser demande
de réutiliser ces éléments, corriger les raccordements incomplets et compléter
les actions manquantes. Il ne suffit pas de brancher la maquette à une API.

Ce checkpoint conserve le code applicatif avant corrections. Il n'atteste pas
la validation humaine des quatre parcours ni la finalisation de l'application.

## Périmètre et preuves

- Sources Kotlin de production : `androidApp/src/main`, `shared/src/commonMain`
  et implémentations de plateforme de `shared`.
- Référence fonctionnelle : les quatre graphes `parcours-*.mermaid` du dossier
  `C:/Users/djabi/bibliotheque/docs/knowledge/profiles/gestio/context`, ainsi que
  les fiches [.lamoms/journeys](../.lamoms/journeys).
- Référence de pages : [maquette/src/App.tsx](../maquette/src/App.tsx), ses 18
  écrans et [NavigationContext.tsx](../maquette/src/context/NavigationContext.tsx).
- Emerge : 55 fichiers Kotlin analysés, 171 entités extraites, 835 parsing hits
  et 13 parsing misses. Le graphe de dépendances exporté contient 330 nœuds
  (dont références externes) et 744 liens. Ce ne sont pas 330 classes internes.
- Tests, worktrees, maquette, caches et fichiers générés exclus du graphe Kotlin.
- Les liens importants et absences d'appels ont été vérifiés dans les sources ;
  Emerge n'est ni une preuve de chronologie d'exécution ni une preuve d'absence.

### Mesures des deux points de concentration

| Nœud Emerge | Méthodes détectées | SLOC mesurées | Dépendances sortantes |
|---|---:|---:|---:|
| `com.gestio.app.MainActivity` | 46 | 614 | 48 |
| `com.gestio.core.storage.GestioStore` | 57 | 926 | 82 |

Les volumes ne sont pas à eux seuls un défaut. Les dépendances suivantes sont
également présentes dans le graphe et confirmées dans le code :

- `MainActivity` → `GestioStore`, `capacityProfile`, `projectObjective`,
  `calculateSavingsGap`.
- `GestioStore` → `calculateMonthBalance`, `MonthScreenState`, `monthScreenState`.

Les méthodes `loadUsageState`, `loadSituationState`, `loadSimulationState` et
les écritures directes de [MainActivity.kt](../androidApp/src/main/kotlin/com/gestio/app/MainActivity.kt)
illustrent le mélange. [GestioStore.kt](../shared/src/commonMain/kotlin/com/gestio/core/storage/GestioStore.kt)
contient à la fois accès SQL, ingestion, règles métier et `screenState` (ligne 546).

## Correspondance des 16 services avec l'existant

Les noms de gauche sont la cible fonctionnelle, pas des classes déjà créées.
Chaque calcul doit avoir un propriétaire unique ; plusieurs parcours appellent
ce même service. Cette table n'autorise pas une réécriture des formules.

| Famille | Service cible | Existant à réutiliser | Écart d'organisation |
|---|---|---|---|
| Consultation | `LectureReleves` | Callbacks `openJson`/`openPdf`, `AndroidGestioVaultImporter`, `ingestStatement` ; Monopoly pour l'extraction | Import piloté par l'activité ; protocole PC → téléphone non raccordé dans ce chemin Android |
| Consultation | `LectureBancaire` | `EnableBankingClient`, `EnableBankingAisp.kt`, `EnableBankingSync.kt`, worker Android | Transport, ingestion et message d'affichage mélangés ; récupération des soldes non appelée par la synchronisation Android |
| Consultation | `LectureDonneesLocales` | Lectures de `GestioStore`, `DriverFactory`, SQLDelight | La classe de stockage expose aussi des calculs et un état d'écran |
| Calcul | `AnalyseTransactions` | `Ingestion.kt`, `Coverage.kt`, `Categorization.kt`, `Recurrences.kt`, `Confirmations.kt`, `Transfers.kt`, rapprochement Enable Banking | Fonctions et orchestration réparties ; absence de classe propriétaire ; certains raccordements absents |
| Calcul | `BilanMensuel` | `Balance.kt::calculateMonthBalance`, `GestioStore.monthBalance` | Orchestration dans le stockage |
| Calcul | `SeuilsEtCapacites` | `HighThreshold.kt`, `Pockets.kt`, `Simulation.kt::capacityProfile`, `GestioStore.lowThreshold` | Logique appelée depuis activité et stockage |
| Calcul | `RepartitionEnveloppes` | `Simulation.kt::simulateDistribution`, `pocketIncreaseEffects`, `proposeCompensation`, `applyCompensation`, `GestioStore.applySimulation` | Calcul et persistence à séparer ; commandes de création/réglage à raccorder |
| Calcul | `BudgetLibre` | `budget/BudgetLibre.kt::calculateBudgetLibre`, `nextIncomeDate`, `recurringEngagements`, `GestioStore.budgetLibre` | Préparation des données dans stockage et activité |
| Calcul | `Liquidite` | `budget/BudgetLibre.kt::liquidityAlerts`, `GestioStore.emitLiquidityAlerts` | Calcul, enregistrement d'émission et affichage ne sont pas correctement coordonnés |
| Calcul | `DepensesDuMois` | `budget/BudgetLibre.kt::spendingCurves`, `MainActivity.loadMonthExpensesState` | Chargement/préparation d'écran dans l'activité |
| Calcul | `ProjectionObjectifs` | `Objectives.kt::projectObjective`, `allocateCapacity`, `objectiveProposal`, `queueWithEmergency` | Fonctions disponibles ; création d'objectif non accessible depuis Android |
| Calcul | `EcartTrajectoire` | `Trajectory.kt::calculateSavingsGap`, `attributeGap`, `pocketGapContributions`, `savingsCurves`, `gapConsequence` | Assemblage incomplet dans l'activité |
| Affichage | `PresentationPremiereOuverture` | `DeuxQuestions`, `SoldeDuMois`, `CompteConfiguration`, confirmations, marquage, `TonObjectif` | États et callbacks dans l'activité ; progression incomplète |
| Affichage | `PresentationUsageCourant` | `ui/UsageCourant.kt` : budget, dépense prévue, alerte, courbes | Chargements dans l'activité ; erreurs et navigation à compléter |
| Affichage | `PresentationPointDeSituation` | `ui/PointDeSituation.kt`, arbitrages, notification Android | Données de courbe/contributions incomplètes ; notification non raccordée |
| Affichage | `PresentationSimulation` | `ui/SimulationBudget.kt`, `SimulationScreenState` | Recalcul des conséquences incomplet ; création de poche absente |

Les écritures validées restent indispensables. Leur contrat doit être explicite
au point d'entrée du service concerné ; elles ne doivent pas être cachées dans
une simple lecture ou dans un composant d'affichage.

## Pages React et équivalents Kotlin

| Page de maquette | Équivalent Compose / constat |
|---|---|
| `PremiereOuvertureEstimation` | `DeuxQuestions` existe et reçoit des callbacks Android |
| `ImportationReleve` | Sélecteurs Android JSON puis PDF ; écran d'import dédié et transfert PC à compléter |
| `ConfirmationReleve` | Présente dans React ; retirée du parcours de référence : ne pas la reproduire automatiquement |
| `SoldeDuMois` | `SoldeDuMois` existe et reçoit les résultats du stockage |
| `ArbitrageTransactions` | `ArbitrageCategorie` existe |
| `ConfirmationRecurrences` | `ConfirmationRecurrences` existe ; retour vers la suite d'onboarding incomplet |
| `MarquagePoches` | `MarquagePoches` existe ; accès dépend du chemin de configuration des comptes |
| `TonObjectif` | `TonObjectif` affiche un objectif existant ; pas de formulaire de création raccordé |
| `BudgetLibre` | `BudgetLibre` existe ; lecture et calcul déjà branchés mais soldes/fraîcheur à compléter |
| `PlanifierDepense` | `PlanifierDepense` existe ; date/catégorie en saisie brute et prévu/réalisé à raccorder |
| `AlerteLiquidite` | `AlerteLiquidite` existe ; callback « Ouvrir ma banque » revient au budget |
| `TesDepensesDuMois` | `DepensesDuMois` existe avec graphique Compose et sélection d'un jour |
| `PointDeSituation` | `PointDeSituation` existe ; courbe réelle et attribution insuffisamment alimentées |
| `EnveloppesDeVie` | `EnveloppesDeVie` existe |
| `DetailsPocheSorties` | `DetailsPoche` existe ; période de calcul différente de l'écran parent |
| `TransactionsSorties` | `TransactionsPoche` existe ; période/tri à aligner sur le contexte |
| `SimulationBudget` | `SimulationBudget` existe ; conséquences à recalculer et clés des poches à harmoniser |
| `CreerPoche` | Pas de route ni de formulaire Compose raccordé ; `GestioStore.createPocket` existe |

Compose possède aussi des pages propres aux comptes, aux arbitrages et à
Enable Banking. Le nombre de pages React n'est donc pas un objectif numérique
de transposition.

## Ruptures concrètes à traiter après le checkpoint

### Première ouverture

1. Le bouton d'import de `SoldeDuMois` n'est rendu que lorsque `state == null`
   (lignes 70–80). Une fois un premier relevé présent, le même écran ne propose
   plus l'import suivant ; une couverture incomplète retourne aussi avant les
   actions finales (ligne 88). Cela empêche la progression prévue par imports
   successifs depuis cet écran.
2. L'ingestion applique les décisions de récurrence déjà enregistrées, mais
   `GestioStore.categorize(rulesDocument)` n'est appelé que dans les tests parmi
   les sources Kotlin inspectées. Les règles de classement doivent être
   disponibles et déclenchées dans le parcours de production.
3. `continueAfterAccountConfiguration` porte la suite récurrences/marquage,
   alors que `refreshAfterImport` repart via `initialAppNavigation`. Il manque
   une progression explicite indépendante du fait qu'un compte ait demandé une
   correction. `OBJECTIVE` possède un rendu mais aucun appel de navigation depuis
   l'UI ; `createObjective` et `createObjectiveFromReadSavings` ne sont pas appelés
   par l'application Android.

### Usage courant

4. `performEnableBankingSync` appelle `fetchAllTransactions`, pas
   `fetchAccountBalances`, pourtant disponible dans `EnableBankingAisp.kt`.
   Le mapper API ne renseigne pas `balanceAfterCents` ; `accountSnapshots` déduit
   le solde des transactions qui portent cette valeur. Le parcours ne garantit
   donc pas un solde courant actualisé par API : il peut rester absent ou provenir
   d'un relevé ancien. Les règles de solde disponible/comptabilisé doivent être
   préservées au raccordement, sans inventer un zéro.
5. `loadUsageState` enregistre les alertes via `emitLiquidityAlerts`. L'action
   ouvrant l'alerte rappelle `loadUsageState` et redétecte avec les clés déjà
   enregistrées : l'alerte peut disparaître avant son affichage. Le callback
   « Ouvrir ma banque » navigue seulement vers `USAGE_COURANT`.
6. `realizePlannedExpense` existe mais n'a aucun appel dans le chemin Android
   ou l'ingestion inspectée. L'arrivée d'une transaction ne raccorde pas encore
   automatiquement l'objet prévu à sa réalisation. La saisie de date accepte un
   texte non vide ; le contrat de validation et les erreurs utilisateur restent
   à vérifier de bout en bout.

### Point de situation

7. `loadSituationState` passe `emptyMap()` à `savingsCurves` et construit
   `GapAttribution` sans contributions. `loadArbitrationState` fournit également
   une liste vide pour les transactions non reconnues. Les fonctions métier
   existent, mais leurs données d'entrée ne sont pas toutes raccordées.
8. `loadLifeEnvelopesState` filtre le mois courant ; `loadPocketDetailsState`
   cumule tous les mois. La navigation parent → poche ne conserve donc pas le
   même périmètre de dépenses. Le tri des poches les plus débordantes et celui
   des transactions complètes ne sont pas appliqués dans ces chargements.
9. Aucun appel de production à `WeeklyNotificationScheduler.schedule` n'a été
   trouvé. Le receiver utilise un message fixé dans l'intent au lieu de calculer
   au moment de l'émission et ouvre `MainActivity` sans destination de parcours.
   La demande de permission Android n'est pas raccordée dans l'activité.

### Simulation

10. `moveSimulation` ne recalcule que les bornes et la répartition ;
    `remainingCents` reste celui du chargement et `objectiveConsequence` n'est
    jamais fourni par `loadSimulationState`. Les deux conséquences attendues
    ne suivent donc pas le curseur.
11. `observedByPocket` est indexé par nom dans l'activité, tandis que
    `pocketEnvelopes` utilise les identifiants. L'UI fusionne ces clés : noms et
    identifiants différents produisent des lignes incohérentes et peuvent rendre
    une validation incompatible avec les clés exigées par `applySimulation`.
12. Les fonctions de création de poche et de compensation existent, mais la
    création n'a pas de route Compose et l'ajustement depuis une poche ne
    transmet pas le choix explicite entre augmenter la vie et compenser ailleurs.

### Commun aux parcours

13. `AppNavigationState` ne conserve qu'un écran, sans historique. Plusieurs
    pages n'ont pas de retour et `MainActivity` n'intègre pas de traitement du
    retour système. Le lancement revient au solde/configuration/questions,
    plutôt qu'à une racine d'usage courant déterminée par la progression.
14. Les états absents de nombreux écrans retombent sur `SoldeDuMois`, sans
    expliquer le prérequis propre au parcours. Plusieurs lectures/écritures
    SQLite et lectures de fichiers sont déclenchées directement dans l'activité.

## Limites de la maquette comme source d'implémentation

- `NavigationContext.tsx` initialise des comptes, montants, objectifs et
  transactions fictifs. Le sélecteur d'import change de page sans extraire ni
  importer les données. Ne pas reprendre ces valeurs comme données réelles.
- `SimulationBudget.tsx` calcule une durée avec une division sur des constantes
  (155 et 1200). Le domaine Kotlin prévoit un empilement des capacités ; la
  formule de la maquette ne doit pas remplacer le domaine.
- React passe encore par `ConfirmationReleve`, alors que le Mermaid de première
  ouverture la retire explicitement (commentaire ligne 15).
- Cette analyse compare sources, actions et données. Elle n'est pas une
  comparaison visuelle des rendus Android et React sur appareil.

## Vérifications réalisées

- `:shared:jvmTest :androidApp:assembleDebug --offline --no-daemon` :
  **BUILD SUCCESSFUL** avec JDK 21 et le cache Gradle utilisateur. Rapports JVM :
  **132 tests, 0 échec, 0 erreur, 0 ignoré**.
- Maquette : `tsc --noEmit` passe.
- Emerge : extraction et exports JSON, GraphML et HTML produits avec la
  configuration [emerge-kotlin.yaml](emerge-kotlin.yaml).
- Le raccordement Kotlin a été réalisé : les services de consultation, calcul et
  présentation possèdent leurs classes publiques ; les écrans Android les
  appellent pour les données courantes, les poches, la simulation et les
  dépenses prévues. Les soldes API datés restent distincts des soldes PDF et les
  alertes sont consultées sans être acquittées par simple ouverture.
- Le dossier des relevés réels `C:\Users\djabi\Documents\relevé pdf` n'a pas été
  copié dans le dépôt. Il reste à exécuter l'import réel, installer sur un
  téléphone et faire la validation visuelle et iOS.
- Emerge a été reconstruit après les modifications Kotlin. Le dossier `.idea/`
  préexistant et les exports `.lamoms/lab/` restent hors du commit.

## Reproduire l'analyse Emerge

Depuis la racine de `gestio-core`, avec l'environnement Emerge installé :

```powershell
New-Item -ItemType Directory -Force .lamoms/lab/emerge-kotlin | Out-Null
& C:/tmp/emerge-venv/Scripts/python.exe -c "from emerge.main import run; run()" -c docs/emerge-kotlin.yaml
```

Sortie locale : `.lamoms/lab/emerge-kotlin/html/emerge.html`. Les exports bruts
restent ignorés par Git ; ils contiennent des chemins propres à la machine.

## Ordre de raccordement exécuté après ce checkpoint

1. Les entrées/sorties des services sont maintenant portées par des classes
   publiques dans `shared/.../services`, sans recopier les formules du domaine.
2. Première ouverture est raccordée à l'import, aux comptes, au classement,
   aux arbitrages, au marquage, à la simulation et à la création d'objectif.
3. Usage courant est raccordé aux soldes datés, au budget, aux dépenses prévues,
   aux réalisations, aux alertes et au détail mensuel.
4. Point de situation et simulation sont raccordés aux courbes observées, aux
   périodes de poches, aux bornes, aux conséquences, aux créations et aux
   compensations explicites.
5. La preuve utilisateur sur les relevés réels et la comparaison visuelle restent
   la prochaine étape d'acceptation, après installation de l'APK.

Points à clarifier pendant le raccordement : la première simulation précède
l'objectif alors que sa maquette affiche déjà une date d'objectif ; l'accès au
point de situation sans objectif est indéfini dans les références ; la lecture
PC/téléphone doit avoir un contrat de transfert explicite. Aucun de ces cas ne
doit être résolu en inventant une donnée ou un objectif.
