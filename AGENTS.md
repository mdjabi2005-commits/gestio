# Gestio Core — instructions du projet

## Identité

- Projet : `gestio-core`
- Stack : Kotlin Multiplatform, Compose, SQLDelight.
- Agents : `gestio-core-codeur` implémente ; `gestio-core-reviewcode` relit et pousse après verdict vert.
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

## Convention d'exécution

1. Lire l'issue ou le plan approuvé, ce fichier et les références du parcours.
2. Implémenter le plus petit changement cohérent avec les services existants.
3. Exécuter les commandes réellement disponibles et rapporter leurs résultats.
4. `gestio-core-codeur` crée toujours un commit local borné à sa tâche.
5. `gestio-core-reviewcode` relit ce commit ; GREEN et contrôles réussis
   autorisent le push, RED ou contrôle manquant interdit le push.

Ne pas copier les relevés réels dans le dépôt. Les données de validation restent
hors Git.

