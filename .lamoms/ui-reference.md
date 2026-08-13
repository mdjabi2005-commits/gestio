# Gestio — Référence UI et backend, état au 2026-08-11

Ce document est une **source de vérité statique** sur ce qui est implémenté, le rôle de chaque écran/endpoint, et ce qui manque pour valider le MVP sur les vraies contraintes du projet. Il ne décrit pas une future UI idéale, il constate l’existant et prépare le PRD 3 sans toucher au code.

## 1. Backend implémenté

### Endpoints Fastify

> La table qui figurait ici a été RETIRÉE le 2026-08-11 : elle repérait par numéro de ligne, contre la convention du 2026-08-06, et se trompait sur cinq entrées — `DELETE /transactions/:id` (272 et non 227), `POST /enable-banking/sync/:id` (501), `GET /enable-banking/status/:id` (488), et `GET /sw.js`, qui n'est pas une route déclarée mais un fichier servi par `fastify-static` depuis `dist/web`.
>
> L'inventaire complet et vérifié des 18 routes, des 7 endpoints Enable Banking appelés, des 34 fonctions exportées et des 15 points d'appel du navigateur vit désormais dans **`.lamoms/inventaire-methodes.md`**, repéré par symboles.

### Modules métier

| Module | Ce qui est fait | Fichier |
|--------|-----------------|---------|
| `src/db.ts` | Ouverture SQLCipher, migration auto, chiffrement base entière | `src/db.ts` |
| `src/qualification.ts` | Qualification automatique : virements internes/externes, retraits, dépôts, virements à vérifier ; pose `nature`, `qualification_label`, `linkedTransactionId` | `src/qualification.ts` |
| `src/deduplication.ts` | Déduplication par date+montant, FIFO, Jaccard labels ; marquage `needs_review` | `src/deduplication.ts` |
| `src/pdf-import.ts` | Parsing PDF LBP, Nickel, Trade Republic ; extraction transactions, soldes, IBAN ; vérification arithmétique ; import lazy + shims Node pour DOMMatrix/Path2D | `src/pdf-import.ts` |
| `src/enable-banking.ts` | Client Enable Banking : auth, sessions, transactions, soldes | `src/enable-banking.ts` |
| `src/ui-logic.ts` | Fonctions pures pour UI : agrégat établissement, fraîcheur, groupes review, labels nature | `src/ui-logic.ts` |
| `src/server.ts` | Orchestration balance, transactions, imports, connexions bancaires | `src/server.ts` |

## 2. Frontend implémenté

### Écrans

| Écran | Ce qui est fait | Fichier:ligne |
|-------|-----------------|---------------|
| `setup/login` | Création mot de passe local ou connexion | `web/src/main.jsx:87` |
| `combien` | Tréso totale, fraîcheur solde, avertissement incomplet, bouton sync | `web/src/main.jsx:114` |
| `ou` | Établissements + comptes avec soldes et dates | `web/src/main.jsx:126` |
| `quoi` | Transactions, groupes doublons, suppression doublon, résolution groupe | `web/src/main.jsx:143` |
| `Ajouter ou importer` | Création établissement/compte, saisie manuelle, import PDF | `web/src/main.jsx:172` |
| `Connecter votre première banque` | Flow Enable Banking OOB + polling | `web/src/main.jsx:263` |
| Offline | Service worker + cache dernier solde connu | `web/public/sw.js`, `web/src/main.jsx:43` |

### Parcours

- **Setup** → login → `combien` / `ou` / `quoi`
- **Onboarding** si aucun compte : `Connecter votre première banque` OU `Ajouter un compte manuel`
- **Import PDF** : choix fichiers + mapping comptes → résultat importé
- **Hors ligne** : dernier solde connu + date affichés, transactions indisponibles

## 3. Données

### Schéma

| Table | Rôle |
|-------|------|
| `institutions` | Établissements bancaires |
| `accounts` | Comptes : type `BANK/LIVRET_A/OTHER`, soldes, IBAN, `external_hash` sync, `institution_id` |
| `transactions` | Movements : `source`, `fingerprint`, `occurrence`, `qualification_label`, `nature`, `needs_review`, `resolved_at`, `transaction_at` |
| `bank_connections` | Connexions Enable Banking : consentement, session, statut |
| `local_auth` + `auth_sessions` | Auth locale |
| `application_secrets` | Secrets applicatifs |

### Modèle à deux niveaux

- 1 établissement → N comptes
- Seul le compte porte un solde ; l’établissement affiche la somme
- ~~6 comptes cibles~~ **Aucun nombre de comptes ne s'écrit** *(corrigé le 2026-08-13)*. Le six a déjà bougé deux fois — Revolut rend le compte et ses trois pockets, l'interface prévoit deux clés de relevé PEA, la base en porte neuf, Sumeria n'y est pas. Un critère qui nommerait un chiffre serait satisfait en oubliant le dernier compte ajouté : c'est le mode de panne du projet, et le §1 du PRD final l'interdit. La liste s'établit au parcours.
- **L'IBAN ne distingue pas tous les comptes** *(mesuré le 2026-08-13)* : les trois segments Trade Republic en partagent un, les trois pockets Revolut n'en ont aucun. Voir la décision 28 du PRD et l'acquis A4 de `contraintes.md`.

## 4. Ce qui est manquant pour tester les vraies contraintes

### 4.1 CSV import
- **Décision** : abandonné. L’UI et le backend ne gardent que l’import PDF comme alimentation manuelle.
- **Raison** : le CSV est un fallback historique ; le MVP valide PDF + Enable Banking.

### 4.2 Review UI des virements internes
- **Backend** : `qualifyTransactions` pose `virement_intercompte` + `linkedTransactionId` (`src/qualification.ts`)
- **UI** : aucune section dédiée pour vérifier, accepter ou rejeter une paire
- **Impact** : l’utilisateur ne peut pas valider manuellement les paires douteuses

### 4.3 Workflow “Premier import / état des lieux guidé”
- **UI** : pas de mode guidé pour importer les relevés de chaque banque
- **Besoin** : déterminer l’historique disponible par banque et signaler les trous
- **Contrainte métier** : LBP 90 jours glissants, Revolut 10 ans API, Trade Republic 90 jours

### 4.4 Filtre période sur transactions
- **UI** : pas de filtre par période pour le bilan mensuel
- **Besoin** : vérifier l’impact d’une dépense/revenue récurrent sur un mois donné

### 4.5 Gestion des connexions Enable Banking
- **UI** : pas de liste des connexions, pas de statut, pas de relance manuelle
- **Besoin** : voir les banques connectées, leur dernière synchro, relancer si besoin

### 4.6 Différenciation mobile/desktop
- **Décision** : UI unique et identique sur mobile et desktop pour le MVP
- **Différenciation** : à faire après PRD 3, dans `src/ui-logic.ts`, sans réécriture

## 5. Rôles et objectifs de chaque écran

### 5.1 Tréso (`combien`)
- **Rôle** : répondre à “combien je dispose maintenant”
- **Objectif** : afficher le vrai disponible agrégé et par compte, sans double compte des virements internes, avec la date de fraîcheur du solde
- **Amélioration nécessaire** : indicateur par compte “solde importé” vs “calculé”, badge “virements internes exclus”

### 5.2 Comptes (`ou`)
- **Rôle** : répondre à “où est mon argent”
- **Objectif** : montrer la structure établissement → comptes, avec source (API/PDF/manuel) et fraîcheur
- **Amélioration nécessaire** : ajouter la source et la date de dernière mise à jour dans la ligne compte

### 5.3 Transactions (`quoi`)
- **Rôle** : répondre à “qu’est-ce qui a bougé” et “quel est l’impact”
- **Objectif** : lister les transactions avec nature qualifiée, filtrer par période, actions par type
- **Amélioration nécessaire** : filtrage période, affichage `qualification_label` + `nature`, section “À vérifier”

### 5.4 Import (`Ajouter ou importer`)
- **Rôle** : alimenter l’état des lieux puis le suivi courant
- **Objectif** : importer les relevés PDF des banques dont la fenêtre API est courte (ex: LBP 90 jours, pas Revolut)
- **Amélioration nécessaire** : workflow guidé “Premier import” par banque, récapitulatif par compte

### 5.5 Connexion bancaire
- **Rôle** : synchro courante pour banques API-first
- **Objectif** : mettre à jour les comptes automatiquement
- **Amélioration nécessaire** : liste connexions, statut, date dernière synchro, bouton relance

### 5.6 Offline
- **Rôle** : garantir “jamais un écran d’erreur nu”
- **Objectif** : afficher dernier solde connu + date, clairement pas actuel
- **Amélioration nécessaire** : rendre la date plus visible, avertissement explicite

## 6. Décisions actées

- **CSV import** : abandonné pour le MVP, on garde PDF seulement comme import manuel
- **UI unique** : mobile et desktop partagent le même code et le même parcours
- **Virements internes** : le backend les qualifie (`nature = virement_intercompte`, `linkedTransactionId`) mais ne les retire **jamais** d'un solde. Un virement interne est un mouvement réel pour chacun des deux comptes ; l'exclure fausserait les soldes par compte et pourrait afficher `0,00 €` pour un compte dont tous les mouvements sont internes — interdit par `DESIGN.md`. L'agrégat est correct sans exclusion, les deux jambes s'annulant. L'exclusion a sa place dans les **dépenses / le bilan**, pas dans `GET /balance` : arbitré par Lamoms le 2026-08-11, à traiter dans le PRD 3.
- **PRD 3** : portera sur l’algorithme de prise de connaissance de l’utilisateur et la révision UI des contraintes métier

## 7. Prochaines étapes proposées pour le PRD 3 — *toutes arbitrées le 2026-08-13*

Cette liste datait du 2026-08-11 et n'avait jamais été confrontée au PRD final. Chacune a désormais un propriétaire ou une raison d'être dehors.

1. **Review UI des virements internes** : section “À vérifier” avec paires liées, actions confirmer interne/externe/distinct → **T35**
2. **Workflow “Premier import”** : checklist guidée par banque, PDF seulement, détection des trous d’historique → **T45a/T45b** pour le guidage, **T42** pour les trous
3. **Filtre période** sur transactions pour bilan mensuel → **T47**
4. **Gestion des connexions Enable Banking** : liste, statut, relance → **T34**
5. **Amélioration affichage comptes** : source, fraîcheur, indicateur solde importé/calculé → **D5**, une ligne de périmètre ajoutée le 2026-08-13. La fraîcheur est déjà au §1 du PRD, l'inconnu est le cœur de D5 ; ce qui manquait est *importé vs calculé*, et c'est exactement l'écart mesuré le 2026-08-04 — 4,57 € affichés pour −537,74 € de somme sur La Banque Postale, parce qu'un solde synchronisé n'est pas la somme de ses transactions
6. **Amélioration offline** : avertissement plus visible, date de fraîcheur en évidence → **écartée**, §9 du PRD. L'étape 10 du protocole l'éprouve ; si le parcours montre qu'elle gêne, elle devient une tâche. Écartée par décision, pas par oubli.

## 8. Preuves de l’existant

- Tests : 39 pass, 0 fail, **1 skip** (`npm test`) — chiffre revérifié le 2026-08-13, inchangé, **et c'est le problème** : le test sauté est le rejeu des 606 décisions, et il se saute parce que `node --test` ne lit pas `.env`, même ici où la clé existe. Ce n'est pas « un skip explicite », c'est la preuve la plus citée du projet qui ne s'exécute jamais. T31 le corrige ; le critère devient **0 skip**.
- Build : OK (`npm run build`)
- Backend lancé sur Windows PowerShell Node 20 : OK
- Binaire SQLCipher local : `/home/djabi/.local/bin/sqlcipher`
- Oracle T27 revalidé : 191 paires / 606 décisions
- 43 transactions réelles LBP intégrées dans les tests
