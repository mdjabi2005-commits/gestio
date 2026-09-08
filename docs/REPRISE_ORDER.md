# Ordre de reprise de Gestio Core

Date : 2026-09-08.

Ce document fixe le point de départ après la suppression du dépôt original. Le
socle restauré vient de `recovery/rebuilt/gestio-core` ; `recovery/` reste hors
Git et conserve les patchs de session pour comparaison.

## Sources dans leur ordre d'autorité

1. Le besoin, l'UX et les décisions fonctionnelles viennent du contexte Gestio
   dans `C:\Users\djabi\bibliotheque\docs\knowledge\profiles\gestio\context`.
   Son dernier commit observé est le 2026-08-31 : toute divergence avec le code
   doit être signalée et réconciliée.
2. `docs/AUDIT_SERVICES_PARCOURS_CHECKPOINT.md` décrit l'état technique observé
   le 2026-09-05 avant la suppression du dépôt.
3. Le code présent et ses validations réelles tranchent ce qui existe aujourd'hui.

## État initial vérifié

Emerge, lancé avec `docs/emerge-kotlin.yaml` après exclusion de `recovery/`,
a trouvé :

- 38 fichiers Kotlin de production scannés ;
- 67 entités extraites ;
- 429 parsing hits ;
- 1 924 lignes source mesurées ;
- 16 classes publiques dans `services/` : consultation, calcul et présentation.

Le projet ne contient pas de wrapper Gradle et aucun JDK/Gradle n'est disponible
dans le PATH courant. Le build Kotlin reste donc `non vérifié` tant que cet
outillage n'est pas réinstallé ou fourni par l'environnement Android.

## Ordre d'implémentation

### 1. Première ouverture

Raccorder la navigation et les états Android à `PresentationPremiereOuverture`,
`LectureReleves`, `LectureDonneesLocales`, `AnalyseTransactions` et
`BilanMensuel`. Vérifier la progression import → couverture → arbitrages →
comptes → marquage → objectif. Le PDF réel reste hors Git et sera utilisé en
validation finale.

### 2. Usage courant

Raccorder `PresentationUsageCourant`, `LectureBancaire`, `BudgetLibre`,
`Liquidite` et `DepensesDuMois`. Préserver la distinction entre solde API daté,
solde de relevé et données locales. Vérifier les alertes, dépenses prévues et
réalisations.

### 3. Point de situation

Raccorder `PresentationPointDeSituation`, `ProjectionObjectifs`,
`EcartTrajectoire` et les données observées. Aligner la période des poches, des
transactions et des courbes avant de valider l'écran.

### 4. Simulation

Raccorder `PresentationSimulation`, `SeuilsEtCapacites`,
`RepartitionEnveloppes` et `ProjectionObjectifs`. Recalculer les conséquences à
chaque hypothèse et conserver les identifiants de poches utilisés par le domaine.

### 5. Preuves de livraison

Après les quatre parcours : installer l'APK, importer un relevé réel depuis le
PC, vérifier le chemin d'import et réaliser la validation visuelle. `gestio-core-codeur`
committe chaque étape ; `gestio-core-reviewcode` relit puis pousse seulement un
commit GREEN avec contrôles réels.

## Règle de structure

Une classe publique porte chaque service dans
`shared/src/commonMain/kotlin/com/gestio/core/services/`. Une logique complexe
reste dans des fichiers internes au même service. Un calcul a un seul
propriétaire. `MainActivity` et `GestioStore` raccordent les services mais ne
récupèrent pas leurs règles métier.
