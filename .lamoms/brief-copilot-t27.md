# Brief Copilot — T27 (#36)

## Mission
Préparer le worktree de T27 sur la base de `origin/main`, et ouvrir/actualiser l'issue #36 avec les consignes minimales pour Codex.

## Base de travail
- Branche : `issue-36`
- Worktree : `/mnt/c/Users/djabi/gestio/.worktrees/issue-36`
- Base : dernier `origin/main`
- Vérifier avant toute conclusion : `git merge-base --is-ancestor origin/main HEAD`

## Scope T27
- `src/pdf-import.ts` — extraction IBAN compte + consolidation parser Trade Republic
- `src/schema.ts`, `src/db.ts` — colonne `iban` sur `accounts` + migration conditionnelle
- `src/qualification.ts` — nouveau module de qualification des transactions
- `src/server.ts` — poser la nature à l'entrée des mouvements, rejouer sur l'existant
- `web/src/main.jsx` — affichage de la nature, `virement_a_verifier` visible et distinguable
- Tests : `src/pdf-import.test.ts`, `src/qualification.test.ts`, `src/server.test.ts`

## Interdits
- Ne pas toucher à `src/deduplication.ts`
- Ne rien porter de l'outillage Python
- Ne jamais supprimer/annuler/remplacer/remplacer une transaction : qualifier = annoter
- Ne pas fusionner les deux moitiés d'un virement interne
- Ne pas coder en dur le pays IBAN Trade Republic
- Aucun nom de personne dans `src/` ou `web/`

## Instructions minimales pour Codex
1. Oracle local : vérifier `Documents/releves-pdf/` et ses 214 appariements avant toute modification.
2. Ajouter `iban` sur `accounts` (schéma + migration conditionnelle).
3. Extraire l'IBAN de chaque compte dans `parsePdfStatement` ; LBP le porte déjà pour chaque compte.
4. Consolider le parser TR : segmentation par ligne `SYNTHÈSE DU RELEVÉ DE COMPTE`, `\d{1,2}` pour le jour, plage libellé, NFD, excludedProducts vide.
5. Créer `src/qualification.ts` : extraction IBAN, normalisation, prédicats, appariement mutuel, score, classification.
6. Poser la nature dans `src/server.ts`, puis rejouer la qualification sur l'existant.
7. Rendre la nature visible dans `web/src/main.jsx`, avec distinction `virement_a_verifier`.
8. Découpler le test parseur PDF de `web/src/main.jsx`.
9. Vérifications : corpus réel, 214 appariements, npm test, lint, typecheck, build.

## Critères d'acceptation
1. Les 214 virements inter-comptes sont retrouvés sur le corpus réel, même répartition des niveaux.
2. Les deux virements de 22,00 € du 17/06/2025 ne sont pas appariés au hasard.
3. Totaux par compte et agrégat identiques au centime avant/après qualification.
4. `src/deduplication.ts` inchangé ; tests T24 passent sans modification d'assertion.
5. Aucune transaction supprimée, aucun montant modifié.
6. `virement_a_verifier` est visible et distinguable.
7. Aucun nom de personne dans `src/` et `web/`.
8. `Documents/releves-pdf/` commité avant qualification, retiré après vert.

## Livrable attendu
- Worktree `issue-36` prêt sur `origin/main`
- Issue #36 actualisée avec ce scope et ces critères
- Aucun code de production modifié à ce stade
