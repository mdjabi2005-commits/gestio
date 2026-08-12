# Verdict Hermès — T30 (#40) — mise en service n°2

**Date** : 2026-08-11
**Juge** : Hermès
**Tâche** : T30 (#40) — mise en service n°2
**PRD actif** : `.lamoms/prd.md` — le lot annexe
**Cycle** : cycle 2 clos par verdict VERT sur T27 (#36)

## Verdict

**ROUGE** sur le besoin produit.

T30 n’est pas jugée seulement sur ses propres critères, mais sur ce qu’elle révèle du besoin global après intégration dans `main` (`e92d82e` == `origin/main`).

## Preuves citées

1. Blocage dur étape 7, hors M1  
- Corpus BP arrêté au `2026-06-08` ; pas de relevé août disponible.  
- Prérequis P35 non tenu : sans relevé de juin à août 2026, un trou définitif s’ouvre le `2026-09-06`.  
- Source : `.lamoms/problems.json:436-446`

2. Mapping import PDF bloqué par les noms ambigus  
- `src/server.ts:306` : `each statement account must map to a different accountId`  
- `web/src/main.jsx:237-251` : choix du compte par `account.name`  
- 9 comptes sans IBAN, noms ambigus en base : trois orthographes du nom du titulaire, dont une répétée à l'identique sur les quatre comptes Revolut *(valeurs exactes non recopiées — dépôt public)*  
- Conséquence : étape 7 bloquée par couplage « corpus manquant + mapping par noms »

3. Connectivité bancaire : 2e banque impossible sans écraser la 1re  
- `web/src/main.jsx:15,287-289` : `SyncButton` conditionné à `localStorage["gestio.authorization-id"]`  
- 3 connexions `AUTHORIZED` en base ; l’interface ne liste pas les connexions  
- Conséquence : impossible d’éprouver la multi-banque, pourtant dans le périmètre P28

4. Aucune route PUT/PATCH → qualification inattaquable  
- `.lamoms/inventaire-methodes.md:79` : aucun `PUT`, aucun `PATCH`  
- `src/server.ts` : 18 routes, 7 GET, 10 POST, 1 DELETE  
- Étape 8 et promesse utilisateur « où je peux dépenser » incomplètes

5. Trade Republic non synchronisable  
- `TR SYNC_FAILED` en base ; pas de relevé août côté corpus  
- Blocage réel, pas seulement théorique

## Constats complémentaires

- Rapport complet Codex non versionné : traçabilité partielle
- Fragments de clé PEM dans sortie de session Codex : recommandation rotation clé Enable Banking
- Écriture potentielle sur base réelle lors du parcours Codex : non constatée, possible

## Points non prouvés

- Rotation clé Enable Banking obligatoire pour le MVP
- Modifications de contenu de la base réelle par le parcours Codex
- Rapport Codex complet hors dépôt

## Décision

- Ne pas ouvrir de worktree maintenant
- Le blocage étape 7 devient la tâche suivante du lot annexe
- Copilot formalise l’issue après intégration de ce verdict
- Prérequis : télécharger le relevé BP d’août 2026 avant le `2026-09-06`
