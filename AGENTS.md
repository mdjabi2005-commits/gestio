# Gestio

## Profil Lamoms
Profil : `gestio`
Workspace : `/mnt/c/Users/djabi/gestio`
Chef de projet : Hermès
Équipe : Hermès → AGY → Claude → Codex → Copilot (si nécessaire) → Hermès-juge

## Projet
Gestion de trésorerie personnelle : savoir exactement combien tu disposes, où, et l'impact immédiat d'une dépense ou d'un revenu récurrent.

## Objectif
Savoir la situation financière à tout moment pour gérer les imprévus.

## Utilisateurs ciblés
1 utilisateur auto-hébergé.

## Problème
Pas de vue fiable sur la trésorerie disponible → décisions d'argent à l'aveugle.

## Core Feature
Affichage de la trésorerie disponible à l'instant T, agrégée et par compte.

## Fonctionnement
- **État des lieux** : import CSV/PDF de toutes les transactions depuis la création des comptes.
- **Suivi courant** : synchro via Enable Banking API (90 jours d'historique). Comptes non disponibles → import CSV/PDF mensuel ou saisie manuelle. Le **Livret A n'est pas exposé par l'API** (vérifié : la session ne renvoie que le compte courant, `CACC`/`PRIV`) — il passe par la saisie manuelle, ce n'est pas un repli mais le seul chemin.
- **Bilan mensuel** : import des transactions du mois pour chaque compte.

## Stack active
Fullstack TypeScript : Node.js / Fastify + React Vite PWA + Drizzle + `better-sqlite3-multiple-ciphers`.

## Fonctionnalités
- tréso disponible agrégée + par compte
- synchro bancaire Enable Banking (43 transactions réelles validées)
- import CSV/PDF (état des lieux + bilan mensuel)
- saisie manuelle fallback
- UI différente mobile/desktop sur même frontend

## Contraintes
- frontend et backend unifiés, UI différenciée mobile/desktop depuis une base de code unique
- Enable Banking API : historique limité à 90 jours en arrière **sur La Banque Postale** ; consentement plafonné par `maximum_consent_validity` de la banque (180 j pour la plupart) et **lu** dans `access.valid_until` — voir « trois durées » plus bas
- fallback CSV puis PDF si compte non disponible sur API
- 1 utilisateur, mot de passe local, maintenance minimale
- backend et données sur RPi : portabilité PC→RPi sans réécriture

## Scope initial
- 1 utilisateur.
- Comptes : bancaire + Livret A (évolutif).
- Frontend partagé entre mobile et desktop, UI différente par plateforme.

## Décisions

### Données
- Pompe principale : Enable Banking API (validée en production, 43 transactions réelles lues).
- **Enable Banking — trois durées à ne jamais confondre** *(précisé le 2026-08-01, ma formulation précédente écrasait les trois en une)* :
  1. **Jeton d'accès ASPSP** : courte durée, **rafraîchi automatiquement par Enable Banking**. Le client n'a rien à gérer, rien à stocker, rien à faire expirer.
  2. **Consentement / session** : durée **demandée** par le client dans `valid_until` du `POST /auth`, **plafonnée** par `maximum_consent_validity` (en secondes) que renvoie `GET /aspsps` pour chaque banque — **180 jours pour la majorité des ASPSP**, plafond qui vient de l'amendement EBA RTS de 2022 portant le renouvellement de SCA de 90 à 180 jours pour l'accès AIS. La valeur **accordée** se lit dans `access.valid_until` de `GET /sessions/{id}` ; la session réelle du lab porte `2027-01-01`. Donc : les 180 jours existent bel et bien, mais comme **plafond par banque**, pas comme durée à coder en dur — on lit le plafond, puis la valeur accordée.
  3. **Profondeur d'historique : 90 jours en arrière — constaté sur La Banque Postale**, qui refuse au-delà (`HTTP 422 / WRONG_TRANSACTIONS_PERIOD`, vérifié en direct). ⚠️ Ce n'est **pas** une constante Enable Banking : leur documentation indique que la plupart des ASPSP donnent au moins un an. Toute autre banque ajoutée exige de re-constater sa fenêtre.
- Fallback : CSV (BP validé), puis PDF si CSV indisponible.
- Moteur de déduplication : clé (date, centimes) + FIFO + Jaccard tokens — validé 27/27, 98.6% moyen.

### Stack technique
- **Backend** : Node.js / Fastify
- **Base de données** : SQLite via `better-sqlite3-multiple-ciphers` — SQLCipher AES-256 sur **toute la base**, pas seulement les jetons Enable Banking : comptes, soldes et transactions sont chiffrés eux aussi (`PRAGMA key` porte sur le fichier entier — voir P21)
- **ORM** : Drizzle
- **Frontend** : React Vite PWA — UI différenciée mobile/desktop depuis une base de code unique
- **Langage** : TypeScript fullstack

### Infrastructure
- **Hébergement cible** : Raspberry Pi always-on (2–5 W). Phase MVP : PC hôte.
- **Accès mobile depuis l'extérieur** : Tailscale (WireGuard E2EE, 0 port ouvert, 0 €/mois).
- **redirect_url Enable Banking** : `https://localhost:3443/` (**MVP**), `https://localhost:3000/` (enregistrée mais inutilisable, voir ci-dessous) et `https://gestio.software/auth/callback` (phase RPi). Ce sont les **trois seules** URL enregistrées par l'utilisateur. ⚠️ Toute autre URL échoue **après** l'authentification forte — ne pas inventer, ne pas reprendre celle du script du lab (`http://localhost:3000/callback`). Tailscale Funnel est écarté : aucune exposition publique n'est nécessaire.
- **Le port du MVP est 3443, pas 3000.** Le port 3000 est occupé en permanence sur la machine hôte par le serveur Lamoms (vérifié le 2026-08-01) — il empêche aussi de lancer les tests. C'est pour cette raison que `https://localhost:3443/` a été enregistrée chez Enable Banking et qu'elle fait foi pour le MVP.
- **Le MVP tourne sur le PC hôte, pas sur le RPi** → le PC est éteint une partie du temps, donc le mode hors connexion est requis : dernier solde connu + sa date, jamais un écran d'erreur nu. Le RPi always-on lèvera cette contrainte plus tard, sans réécriture.
- **SCA Enable Banking : c'est le SERVEUR qui reçoit le retour de la banque** — le PC hôte d'abord, le RPi ensuite. Pattern Out-of-Band Auth + polling : le backend fabrique l'URL bancaire, l'utilisateur l'ouvre dans un vrai navigateur, le backend encaisse le callback et le client interroge le backend jusqu'à ce que la session soit établie. Ça évite le problème iOS Safari standalone et ça rend la migration PC → RPi transparente : le rôle ne se déplace pas, il reste au serveur.
  - **En MVP, l'authentification forte se termine sur la machine serveur**, non par choix mais parce que la `redirect_url` est `https://localhost:3443/` : `localhost` ne résout que sur cette machine. Depuis le téléphone, la banque renverrait le mobile vers lui-même.
  - **En phase RPi**, la `redirect_url` devient `https://gestio.software/auth/callback`, une URL publique : le callback atteint le serveur quel que soit l'appareil, donc l'authentification peut alors être lancée depuis le mobile. C'est l'URL qui lève la contrainte, pas le code.
- **Sauvegarde** : `sqlcipher_export()` en cron journalier, rotation 30 jours, sauvegarde chiffrée et réouvrable avec la même clé. ⚠️ **Pas `sqlite3 .backup`** : le shell refuse la copie page à page entre bases chiffrées (`backup is not supported with encrypted databases`). Erreur corrigée le 2026-08-01 après signalement de Codex.
- **Portabilité** : migration PC → RPi sans réécriture (même stack, même fichier DB).

### Lab AGY — lecture encouragée, jamais versionné
Le dossier `/mnt/c/Users/djabi/gestio/.lamoms/lab/agy/` **n'est pas dans git** et ne doit jamais y entrer : il contient des données bancaires réelles (IBAN, nom, 43 transactions authentiques) et `.session_cache.json`, qui porte une **session Enable Banking vivante** donnant accès en lecture au compte réel jusqu'au 2027-01-01.

Tout est local, donc **tout agent peut et doit s'y rendre par chemin absolu** quand il en a besoin — depuis un worktree aussi, le chemin reste le même.

- **`.lamoms/lab/agy/rapport_architecture_gestio.md`** — le rapport d'architecture, **à lire avant de coder la synchro bancaire**. Sa **section Q4** consigne, banque par banque et relevé à la source, quels champs de transaction sont réellement fournis, leur taux de présence, et la profondeur d'historique (LBP 90 j · Trade Republic 90 j · Revolut 3727 j). C'est la référence pour savoir ce qui est codable.
- `enable_banking_transactions_reelles.json` et les deux CSV La Banque Postale — jeu de test réel.

**Interdits** : recopier un fichier du lab dans le dépôt, y écrire des identifiants, versionner quoi que ce soit de ce dossier.

### Exclusions actées
- Cloudflare Tunnel : exclu (terminaison TLS côté Cloudflare = données bancaires lisibles par un tiers).

## Critères de qualité
- Le besoin est couvert.
- Les validations du projet passent.
- La livraison est relue avant le verdict.
- Le verdict cite la preuve qui le fonde.

## Workflow git
- `master` est la version fonctionnelle officielle de l'application.
- Pour toute feature : PRD/milestone d'abord, puis code dans un worktree isolé avec sa branche et son issue, puis push sur `main`.
- `main` sert à tester l'intégration de la feature ; une fois validée, elle est mergée dans `master`.
- Cela permet de ne pas fusionner dans la version officielle une feature qui n'apporte pas la valeur attendue.

## Contrat de l'équipe
Hermès : cadrer le besoin, arbitrer et rendre le verdict | modifie : AGENTS.md et `.lamoms/project.json` uniquement pendant le bootstrap ; aucune modification applicative | produit : décision, synthèse ou verdict | précédent : humain ou étape précédente | suivant : AGY, Claude ou l'humain selon le handoff | limites : ne code pas, ne remplace pas la recherche technique d'AGY, ne déverrouille l'équipe qu'après un bootstrap cohérent, et ne rend jamais un verdict sans citer la preuve qui le fonde (voir « Verdict relisible »).

AGY : chercher les faits et les options avec leurs sources | modifie : uniquement des essais bornés dans `.lamoms/lab/agy` | produit : rapport sourcé avec faits, hypothèses et incertitudes | précédent : Hermès | suivant : Hermès | limites : ne produit ni implémentation finale ni PRD.

Claude : analyser les problèmes, conséquences et risques avant le PRD | modifie : PRD et tâches dans le parcours usine ; l'exception directe passe par une action explicite de Lamoms | produit : brief de problèmes, impacts, risques, critères et PRD | précédent : AGY ou Hermès | suivant : Codex, Copilot si nécessaire | limites : ne code pas, ne choisit pas seul la valeur produit et ne masque pas les problèmes non résolus.

Copilot : préparer le git-ops puis relire la livraison | modifie : branches, worktrees et intégration selon l'étape ; pas le périmètre fonctionnel de Codex | produit : issues, worktrees ou rapport de review | précédent : Claude ou Codex | suivant : Codex ou Hermès | limites : ne réécrit pas la tâche pour contourner un verdict ROUGE ; fait respecter les garde-fous d'intégration en comparant systématiquement la livraison au main courant et en signalant toute collision d'intégration.

Codex : implémenter l'issue approuvée dans son worktree | modifie : le code du périmètre de l'issue uniquement | produit : code et validations exécutées | précédent : Claude ou Copilot | suivant : Copilot ou Hermès | limites : ne commit, ne push ni ne fusionne pendant la phase code.

## Équipe
```
Hermès → AGY → Claude → Codex → Copilot (si nécessaire) → Hermès-juge
```

## Garde-fous d'intégration (actés le 2026-08-02 après la review ROUGE de l'issue #12)

Les livraisons parallèles ne se voient pas : T6 et T5 ont résolu le même problème (deux transactions identiques) sous deux noms (`fingerprint_occurrence` vs `occurrence`) parce que chacune travaillait sur un socle différent. Aucun graphe initial ne peut prévoir ces collisions avant le code — la review de diff contre `main` à jour est le filet obligatoire, et deux règles complètent le graphe :

4. **Avant de lancer une issue, recalculer ses dépendances à partir de `main` et des acquis consignés**, pas uniquement du graphe créé au début du projet.
5. **Avant de coder, vérifier que le worktree part du dernier `origin/main`.** Les tâches touchant les mêmes tables ou invariants doivent être séquencées, sauf interface commune explicitement actée.

Après chaque livraison relue (VERT ou ROUGE), les acquis empiriques sont consignés au graphe : choix de schéma actés, colonnes/index existants, dépendances de fait découvertes entre tâches, pièges de nommage. Toute issue lancée ensuite lit ces acquis avant de coder — on réutilise un mécanisme consigné, on n'en invente pas un parallèle.

## Verdict relisible (acté le 2026-08-03)

Hermès est le seul nœud de la chaîne que personne ne relit. Les tests vérifient Codex, `git` vérifie Copilot, Claude est contesté — un verdict, lui, est le dernier mot. La confiance qu'on lui accorde se nourrit donc de l'absence de vérification, et non d'une vérification réussie.

Le cas qui l'a montré : le critère de sauvegarde de T1 exigeait explicitement « une lecture réelle dans le fichier de sauvegarde, **pas sa seule existence** ». Seule la production du fichier a été livrée. Le verdict a été VERT. Personne ne l'a vu sur le moment — le défaut a été trouvé le 2026-08-02, par hasard, en relisant du code. Le critère était écrit, non ambigu, et en plein cœur du métier du juge.

6. **Un verdict cite l'observation qui le fonde — commande et sortie, ou fichier:ligne lu — jamais la conclusion seule.** Un critère dont la preuve n'est pas citable n'est pas VERT : il est ROUGE ou explicitement « non prouvé ». L'existence d'un artefact ne prouve jamais le critère qu'il devait satisfaire.

Cette règle ne rend pas le juge meilleur, elle rend son travail **relisible**. Lamoms est le seul au-dessus de lui : une preuve citée lui permet de relancer la commande et de comparer, au lieu de relire une conclusion bien formée sans moyen de la contredire. Le pouvoir décisionnel peut rester fort tant qu'il est adossé à du vérifiable.

Portée : la règle s'applique aux verdicts à partir de maintenant. Les verdicts de T2 à T6 n'ont pas été rejoués et restent dans cet angle mort — risque ouvert, pas réglé.

