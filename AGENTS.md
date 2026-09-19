# Gestio — instructions du projet

## Identité

- Projet : `gestio`
- Stack : Kotlin Multiplatform, Compose, SQLDelight.
- Agents : `gestio-codeur` implémente ; `gestio-reviewcode` relit et pousse après verdict vert.
- `reviewT` garde la validation métier et UX des parcours.

## Structure métier

Les services publics vivent dans `shared/src/commonMain/kotlin/com/gestio/core/services/` :

- `consultation/` lit les relevés, l'API bancaire et les données locales ;
- `calcul/` porte les règles métier et leurs résultats ;
- `presentation/` prépare les états destinés aux écrans.

Une responsabilité possède une classe publique de service. Une logique complexe
peut être répartie dans des fichiers internes au même service. Un calcul a un
propriétaire unique ; plusieurs parcours peuvent l'appeler.

`MainActivity` et `GestioStore` orchestrent le raccordement mais ne doivent pas
absorber les règles métier des services.

## Références et ordre des preuves

Le corpus UX/métier et les quatre graphes Mermaid vivent dans :
`C:\Users\djabi\bibliotheque\docs\knowledge\profiles\gestio\context`.
Son dernier commit observé est du 2026-08-31 : il peut être en retard sur le
code et doit être réconcilié avant de trancher une divergence.

Le checkpoint technique restauré dans `docs/AUDIT_SERVICES_PARCOURS_CHECKPOINT.md`
date du 2026-09-05 et décrit la photographie la plus récente des sources Kotlin.
Pour une décision d'implémentation, l'ordre est donc : besoin et UX du contexte,
faits techniques du checkpoint, puis vérification dans le code présent.

Le code Kotlin est cartographié avec Emerge. Graphify n'est pas requis pour
l'analyse Kotlin de ce projet.

## Routes documentaires et décisions

- Le template canonique d'une décision est dans
  `C:\Users\djabi\bibliotheque\docs\knowledge\templates\DECISION_TEMPLATE.md`
  et sa forme YAML dans `DECISION_TEMPLATE.yaml`.
- L'artefact produit est
  `.lamoms/decisions/<decision-id>.yaml`, un fichier par décision. Ne pas
  enregistrer une décision uniquement dans `POWENS.md`, une fiche de parcours
  ou un plan.
- Le template canonique d'une fiche de parcours est
  `C:\Users\djabi\bibliotheque\docs\knowledge\templates\JOURNEY_TEMPLATE.md`.
  `fiche create <journey_id> --project gestio --title <titre>` l'instancie
  dans `.lamoms/journeys/<journey_id>.md` tant que la fiche n'est pas validée.
  Après validation, la publication cible
  `knowledge/projects/<project_id>/journeys/<journey_id>.md`.
- La référence fournisseur Powens est
  `C:\Users\djabi\bibliotheque\docs\core\POWENS.md`.
- Avant de planifier ou coder, lire les décisions existantes, la fiche
  concernée et les références applicables. Une décision métier ou
  d'architecture reste `proposed` jusqu'à validation humaine ; ne pas choisir
  à la place de l'humain.
- `POWENS.md` décrit la décision retenue et ses conséquences ; il ne remplace
  pas l'artefact de décision canonique.

## Organisation des profils et contrats Codex

- Les profils utilisateur sélectionnables sont
  `C:\Users\djabi\.codex\gestio-codeur.config.toml` et
  `C:\Users\djabi\.codex\gestio-reviewcode.config.toml`. Ils sont chargés
  avec `codex --profile gestio-codeur` ou `codex --profile gestio-reviewcode` ;
  ce ne sont pas des agents permanents.
- Codex charge automatiquement `AGENTS.md` et les éventuels
  `AGENTS.override.md` depuis le global jusqu'au répertoire courant. Les
  fichiers `.claude/gestio-codeur.md` et `.claude/gestio-reviewcode.md` sont
  les contrats locaux du projet, conservés comme sources de synchronisation ;
  ils ne remplacent pas `AGENTS.md` dans la détection native de Codex.
- `reviewT` reste un rôle de validation métier et UX, pas un profil Codex
  persistant configuré par `lamoms-init`.

## Convention d'exécution

1. Lire l'issue ou le plan approuvé, ce fichier et les références du parcours.
2. Implémenter le plus petit changement cohérent avec les services existants.
3. Exécuter les commandes réellement disponibles et rapporter leurs résultats.
4. `gestio-codeur` crée toujours un commit local borné à sa tâche.
5. `gestio-reviewcode` relit ce commit ; GREEN et contrôles réussis
   autorisent le push, RED ou contrôle manquant interdit le push.

Ne pas copier les relevés réels dans le dépôt. Les données de validation restent
hors Git.

