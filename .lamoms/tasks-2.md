# Tâches du cycle 2 — remise en état

**Émis le** 2026-08-04 par le Planificateur, à partir de `.lamoms/prd-2.md`.
**Suivi** : GitHub (une issue par tâche, milestone du cycle 2). Ce fichier est le plan, pas le suivi.
**Numérotation** : reprend à **T13**, après les T1–T12 du MVP.

L'ordre ci-dessous est **imposé par les faits**, pas par une préférence. Chaque tâche rend la suivante observable ou moins risquée.

| | Tâche | Problèmes | Fichiers principaux |
|---|---|---|---|
| **T13** | Trade Republic entre en base | P38 (cause), P44 | `src/enable-banking.ts` |
| **T14** | Un échec de synchro cesse d'être invisible | P38 (chaîne), P28 | `src/server.ts`, `src/ui-logic.ts`, `web/src/main.jsx` |
| **T15** | L'import CSV refuse ce qu'il ne peut pas placer | P41, P42 (cause a) | `src/server.ts` |
| **T16** | Le rapprochement signale l'incertain | P42 (causes b, c) | `src/server.ts`, `src/deduplication.ts` |
| **T17** | Chaque compte porte un nom qui le distingue | P39, P25 | `src/server.ts`, `web/src/main.jsx` |
| **T18** | Les trois portes manquantes | P40 | `web/src/main.jsx` |
| **T19** | Le hors connexion tient sa promesse | P43, P16 | `web/public/sw.js`, `vite.config`, `web/src/main.jsx` |

Les sept tâches sont prêtes. L'arbitrage qui bloquait T15 a été rendu par Lamoms le 2026-08-04 — voir T15.

---

## T13 — Trade Republic entre en base

**Problèmes** : P38 (cause), P44.
**Pourquoi en premier** : c'est une **horloge de perte de données**. Trade Republic sert une fenêtre glissante de 90 jours, sa synchro est cassée, et la capture du 2026-08-04 porte un `continuation_key` non nul — de l'historique est disponible et personne ne le descend. Chaque jour d'attente en efface un, définitivement.

### Périmètre
`src/enable-banking.ts` — `parseBankTransaction` (l. 83-103), `decimalCents` (l. 124), `parseBalance` (l. 105-122). Tests dans `src/enable-banking.test.ts`.

### Ne pas toucher
`signedAmountCents` (`src/deduplication.ts:53`) — il fait déjà `Math.abs()` avant d'appliquer l'indicateur, donc **aucune double négation n'est possible** et il n'a pas à changer. Ne pas toucher non plus au moteur de déduplication, ni à `src/server.ts`.

### Étapes
- [ ] `parseBankTransaction` (l. 92-94) : traiter `remittance_information: null` comme **absent**, au même titre que `undefined`. Le garde actuel teste `remittance !== undefined`, or JSON rend `null` — c'est un bug franc, aucune décision à prendre. Un tableau mal formé reste refusé.
- [ ] `decimalCents` (l. 124) : accepter un nombre quelconque de décimales **à condition que tout ce qui dépasse le centième soit zéro** ; refuser sinon, avec le message actuel. La garantie « jamais un chiffre faux silencieusement » est conservée.
- [ ] `parseBankTransaction` (l. 99) : accepter un montant **signé**. Passer `signed = true` à `decimalCents` ; le signe final vient toujours de `credit_debit_indicator`.
- [ ] `parseBalance` (l. 110-116) : quand **plusieurs** soldes sont candidats et qu'aucun ne porte un `balance_type` de la liste `ITAV, CLAV, CLBD, ITBD`, ne pas en sélectionner un en silence — lever une erreur nommant les types reçus. Un **seul** solde, même de type inconnu, reste accepté : c'est le cas de Trade Republic (`OTHR`, 0,47 EUR).
- [ ] Tests : rejouer les **43 transactions réelles** de `.lamoms/lab/agy/tr_transactions_raw.json` et le solde de `tr_balances_raw.json`. Ces deux fichiers sont dans `.lamoms/lab/` (gitignoré) — copier le strict nécessaire en fixture anonymisée dans le dépôt, montants et dates conservés, aucun IBAN ni nom.
- [ ] Test de non-régression : un montant à sous-centime **non nul** (`0.435`) est toujours refusé.
- [ ] **Vérification** : `npm test && npm run build`, puis relancer la synchro Trade Republic sur la base réelle et constater que le compte #2 porte un solde et des transactions.

### Critères d'acceptation
1. Les 43 transactions de la capture réelle passent **toutes** par `parseBankTransaction` sans exception.
2. `parseBalance` sur la capture réelle rend `{ balanceCents: 47, currency: "EUR" }`.
3. Un montant `0.435` est refusé avec le message existant.
4. Aucun autre appelant de `decimalCents` n'existe hors de `enable-banking.ts` — vérifié : deux sites, l. 99 et l. 119.
5. Les tests existants de `enable-banking.test.ts` passent sans modification de leurs attentes.

---

## T14 — Un échec de synchro cesse d'être invisible

**Problèmes** : P38 (chaîne de trois défauts + trace absente). Referme **P28** au passage.
**Pourquoi ensuite** : Trade Republic charge désormais, donc le symptôme disparaît — mais la chaîne, elle, se redéclenchera à la prochaine banque. Et journaliser `error.message` rend toutes les pannes suivantes lisibles en une seconde au lieu d'une demi-journée.

### Périmètre
- `src/server.ts` — `recordBankError` (l. 964), route `GET /balance` (l. 450-459), `bankErrorLog` (l. 990) et ses **quatre** appelants (l. 64, 128, 134, 561).
- `src/ui-logic.ts` — `oldestUpdatedAt` (l. 50-56).
- `web/src/main.jsx` — l. 60-61 (`freshness`), l. 124-129 (rendu par compte).

### Rayon d'impact vérifié
`oldestUpdatedAt` n'a **qu'un** appelant : `web/src/main.jsx:60`. `groupAccountsByInstitution` : `main.jsx:124`. Aucun autre consommateur.

### Ne pas toucher
Le moteur de déduplication, les imports, `parseBankTransaction`. Ne **pas** changer la règle « solde = somme des transactions » pour un compte **manuel** : elle est juste, et c'est le critère 2 du PRD (1).

### Étapes
- [ ] `bankErrorLog` (l. 990-996) : ajouter `message: error instanceof Error ? error.message : String(error)`. Les quatre sites l'utilisent déjà, aucun n'a à changer.
- [ ] `recordBankError` (l. 964-972) : le `CASE WHEN status = 'PENDING'` laisse une connexion `AUTHORIZED` intacte après un échec **total**. Faire porter l'échec par la connexion — sans effacer un `last_sync_at` antérieur, qui reste la dernière donnée sûre.
- [ ] `GET /balance` (l. 459) : distinguer un compte **manuel** (solde = somme des transactions, juste) d'un compte **synchronisé jamais chargé** (`balance_cents IS NULL` **et** `external_hash IS NOT NULL`) dont le solde est **inconnu**, pas nul. Le second ne doit pas contribuer un zéro au total.
- [ ] `GET /balance` : exposer, à côté du total, le fait qu'il est **incomplet** — le nombre de comptes dont le solde est inconnu suffit.
- [ ] `src/ui-logic.ts:52` : `oldestUpdatedAt` ignore les comptes dont `updatedAt` est `null`. Un compte **jamais** synchronisé n'est pas « ne compte pas », il est le plus périmé de tous. Corriger, et adapter `src/ui-logic.test.ts`.
- [ ] `web/src/main.jsx` : afficher, sur un compte au solde inconnu, un libellé qui le dit — jamais `0,00 €`. Et faire porter au total sa mention d'incomplétude.
- [ ] **Vérification** : `npm test && npm run build`, puis sur la base réelle, mettre `balance_cents` à `NULL` sur un compte synchronisé et constater à l'écran que ni le compte ni le total n'affichent un chiffre affirmé.

### Critères d'acceptation
1. Un compte synchronisé sans solde connu **n'affiche pas** `0,00 €`.
2. Le total agrégé indique qu'il est incomplet dès qu'un compte de son périmètre a un solde inconnu.
3. `oldestUpdatedAt` sur un ensemble contenant un compte à `updatedAt: null` **ne renvoie pas** une date récente.
4. Une synchronisation en échec total ne laisse pas la connexion affichée comme autorisée.
5. Le journal des quatre sites porte `message`.
6. Un compte **manuel** sans `balance_cents` continue d'afficher la somme de ses transactions — aucune régression.

---

## T15 — L'import CSV refuse ce qu'il ne peut pas placer

**Problèmes** : P41, P42 (cause a).
**Arbitrage rendu par Lamoms le 2026-08-04** : **refuser** le fichier. Un import ne verse rien qu'il ne puisse justifier. Le CSV Revolut se ferme en conséquence — l'API le couvre déjà sur dix-sept mois (plancher mesuré 2025-03-02), et c'est précisément cet import qui a produit les 898 € de mouvements fantômes.

### Ce qui est mesuré et ne se discute pas
- `POST /imports/csv` (`src/server.ts:283-289`) ne vérifie **que** l'existence du compte cible. Le paramètre `bank` sert uniquement à choisir l'analyseur (l. 292). Un CSV Revolut est donc entré dans un compte La Banque Postale sans la moindre objection — 250 lignes, le 2026-08-04.
- Le CSV Revolut réel **mélange plusieurs comptes** et ne permet pas de les séparer. Mesuré le 2026-08-04 sur le fichier de 253 lignes : la seule colonne candidate, `Produit`, ne prend que trois valeurs (`Dépôt`, `Valeur actuelle`, `Épargne`) pour **quatre** comptes, et la colonne `Solde` ne se referme arithmétiquement sur aucune d'elles. **Il n'existe aucun identifiant de pocket dans ce fichier.**
- Conséquence : la solution du chemin PDF — une correspondance explicite compte par compte (`accountIds`, `src/server.ts:358-365`) — **n'est pas transposable** ici. Le PRD (2) §6.3 le supposait ; c'est corrigé par cette mesure.

### Périmètre
`src/server.ts` — route `POST /imports/csv` (l. 283-341) uniquement. Tests dans `src/server.test.ts`.

### Ne pas toucher
La **logique d'analyse** de `src/csv-import.ts` : les gabarits par banque sont justes, T5 et T12 les ont livrés et validés. Seul l'ajout d'une propriété descriptive au registre `bankCsvFormats` est autorisé. Ne pas toucher la route PDF ni le moteur de déduplication.

### Étapes
- [ ] Refuser un import dont la banque du fichier ne correspond pas à l'établissement du compte cible, avec un code d'erreur explicite au même titre que `csv_format_unrecognized` (l. 297).
- [ ] Établir la correspondance banque ↔ établissement **dans le code**, sans nouvelle colonne en base : les valeurs sont `LA_BANQUE_POSTALE` / `REVOLUT` côté fichier, et `La Banque Postale` / `Revolut` côté `institutions.name`.
- [ ] Marquer, **dans le registre `bankCsvFormats`**, qu'un format est multi-comptes et non attribuable — c'est une propriété du format, pas une exception dans la route. `REVOLUT` l'est ; `LA_BANQUE_POSTALE` ne l'est pas.
- [ ] Refuser un fichier ainsi marqué, avec un message qui **dit pourquoi** : le fichier mélange plusieurs comptes et rien ne permet de les séparer. Nommer le chemin qui reste ouvert — la synchronisation API.
- [ ] Test rejouant l'incident du 2026-08-04 : un CSV Revolut visant un compte La Banque Postale est refusé, aucune ligne écrite.
- [ ] Test du second refus : le même CSV visant le **bon** compte Revolut est refusé lui aussi, pour l'autre raison.
- [ ] **Vérification** : `npm test`, puis sur une copie de la base réelle, rejouer les deux imports fautifs du 2026-08-04 et constater les deux refus.

### Critères d'acceptation
1. Un CSV Revolut visant un compte La Banque Postale est **refusé**, avec un message nommant l'incohérence.
2. Le même CSV visant le compte Revolut #5 est **refusé** aussi, avec un message nommant le mélange de comptes.
3. Aucune transaction n'est écrite lors d'un refus — vérifié en comptant les lignes avant et après.
4. Un import La Banque Postale légitime continue de fonctionner : aucune régression sur les tests de T5 et T12.
5. La règle « multi-comptes » est portée par le **registre de formats**, pas par un `if` sur le nom d'une banque dans la route.

---

## T16 — Le rapprochement signale l'incertain

**Problèmes** : P42 (causes b et c).

### Ce qui est mesuré
- **Zéro drapeau `needs_review` posé** sur 43 paires bi-sources, ce qui contredit la conception de P25. **Cause exacte, trouvée en lisant le code** : la route CSV (`src/server.ts:316`) n'utilise que `.transactions` du résultat de `deduplicateTransactions` et **jette `.toReview`** ; son `INSERT` (l. 318-322) n'a même pas de colonne `needs_review`. La route PDF (l. 390-398), elle, l'utilise correctement. **Le défaut est dans le chemin CSV, pas dans le moteur.**
- L'arbitrage par mots du libellé échoue entre l'anglais de l'API Revolut et le français du CSV — deux vocabulaires pour la même opération.

### Périmètre
`src/server.ts` — route CSV (l. 306-341). `src/deduplication.ts` seulement si l'arbitrage inter-vocabulaire l'exige.

### Rayon d'impact vérifié
`deduplicateTransactions` a **trois** appelants : `server.ts:316` (CSV), `server.ts:390` (PDF), `server.ts:814` (synchro). Toute modification du moteur les touche tous les trois — les tests des trois chemins doivent passer.

### Ne pas toucher
La clé primaire `(date ISO, montant en centimes)` et la file FIFO par clé — validées en T2 sur données réelles, et P5 en dépend. Ne pas déduire le signe du libellé.

### Étapes
- [ ] Route CSV : exploiter `.toReview` comme le fait déjà le chemin PDF, et ajouter `needs_review` à l'`INSERT` (l. 318-322).
- [ ] Traiter le cas des vocabulaires différents : quand le libellé ne peut pas départager, le rapprochement est **incertain** et doit être signalé, jamais tranché en silence. C'est le même principe que P25 pour Trade Republic, où il n'y a aucun libellé du tout.
- [ ] Test sur données réelles : le CSV Revolut de 254 lignes, importé sur un compte déjà peuplé par l'API sur la même période, **n'ajoute aucune transaction** et ne modifie pas le solde.
- [ ] Tests de non-régression sur les **trois** appelants du moteur.
- [ ] **Vérification** : `npm test && npm run build`, puis rejeu de l'import réel sur une copie de la base.

### Critères d'acceptation
1. Un rapprochement incertain pose `needs_review` par le chemin **CSV** comme par le chemin PDF.
2. Le CSV Revolut réel réimporté sur le compte #5 déjà peuplé n'ajoute **rien** et laisse le solde à 2,25 €.
3. Deux transactions distinctes de même montant le même jour restent **deux** transactions (P5).
4. La synchro Enable Banking et l'import PDF ne régressent pas — 16 doublons PDF/API toujours reconnus.

---

## T17 — Chaque compte porte un nom qui le distingue

**Problèmes** : P39, P25 (conséquence à l'écran).

### Périmètre
`src/server.ts:782` (dérivation du nom pendant la synchro) et `web/src/main.jsx` (rendu d'une transaction sans libellé).

### Ne pas toucher
⚠️ **Ne pas inverser la priorité `name` → `product`.** Mesuré : `product` vaut `null` chez La Banque Postale **et** sur les quatre comptes Revolut, et `"CHECKING_ACCOUNT"` chez Trade Republic. L'inversion casserait deux banques pour en réparer une.
⚠️ **Aucun nommage manuel n'entre au périmètre.** L'upsert de synchro (`src/server.ts:786-790`) réécrit `name` à chaque passage : une saisie serait effacée silencieusement. C'est une **décision**, pas un oubli — ne pas ajouter de colonne ni de formulaire.

### Étapes
- [ ] `src/server.ts:782` : utiliser `details` quand la banque le renseigne — il porte le nom du pocket chez Revolut (« Assurance », « Auto entreprise déclaration paiement », « Abonnement feu vert »).
- [ ] Quand la banque ne rend que le titulaire, dériver du type de compte. Couverture mesurée : **9 comptes sur 9, zéro saisie**. Le compte principal Revolut (#5) est le seul `CACC` de son établissement ; il en va de même pour #1 et #2.
- [ ] Prévoir le repli lisible pour un pocket sans `details` — plafond nommé, à ne pas sur-construire.
- [ ] `web/src/main.jsx` : une transaction sans libellé ne doit pas rendre une ligne vide. Les 43 transactions Trade Republic arriveront **toutes** ainsi (mesuré, plus seulement inféré).
- [ ] **Vérification** : `npm test && npm run build`, puis constater à l'écran quatre noms distincts sous Revolut.

### Critères d'acceptation
1. Les quatre comptes Revolut portent **quatre noms distincts**, sans aucune saisie.
2. Les comptes La Banque Postale, Trade Republic et Nickel gardent un nom compréhensible.
3. Les comptes manuels (#7 Livret A, #8 Livret Jeune, #9 Nickel) ne changent pas de nom.
4. Une transaction sans libellé reste lisible et distincte de sa voisine (deux débits de 20,00 € le 2026-05-20).

---

## T18 — Les trois portes manquantes

**Problème** : P40.

### Ce qui est mesuré
`POST /accounts` (l. 183), `POST /institutions` (l. 193) et `POST /imports/pdf` (l. 344) existent et fonctionnent — ils ont servi pendant la mise en service, **par `curl`**. Aucun n'a de porte dans l'interface : `web/src/main.jsx:188` n'offre que la saisie manuelle d'une transaction et l'import CSV. Conséquence : sur une installation neuve, le seul chemin vers un premier compte est une banque API (`main.jsx:71-72`, l'accueil ne propose que « Connecter votre première banque »). Un utilisateur qui n'a que Nickel et un Livret A **ne peut pas franchir l'accueil**.

### Périmètre
`web/src/main.jsx` uniquement — les trois routes serveur existent et ne changent pas.

### Ne pas toucher
Les routes serveur. Le contrat d'entrée est déjà fixé : `readAccountInput` (`src/server.ts:569`) attend `{ name, type: BANK|LIVRET_A|OTHER, institutionId? }` ; `POST /imports/pdf` exige un `accountIds` couvrant **chaque** compte du relevé.

### Étapes
- [ ] Ajouter au bloc « Ajouter ou importer » (`main.jsx:188`) la création d'un **établissement** et d'un **compte**.
- [ ] Ajouter l'import d'un **relevé PDF**, avec la correspondance compte par compte que la route exige.
- [ ] L'accueil vide (`main.jsx:71-72`) doit proposer un second chemin que « Connecter votre première banque ».
- [ ] **Vérification** : sur une base vide, créer un établissement, un compte et importer un relevé PDF **entièrement depuis l'interface**, sans terminal.

### Critères d'acceptation
1. Sur une base vide, un établissement, un compte et un relevé PDF s'ajoutent depuis l'interface seule.
2. L'écran reste **identique sur mobile et sur desktop** — contrainte fondatrice du projet, vérifiée sur un vrai téléphone lors de la mise en service.
3. Un relevé PDF sans correspondance complète est refusé, message visible à l'écran.

---

## T19 — Le hors connexion tient sa promesse

**Problèmes** : P43, et la contrainte fondatrice **P16**.

### Ce qui est mesuré
`web/public/sw.js` (555 octets) déclare **uniquement** un écouteur `fetch` — aucun `install`, aucun `self.skipWaiting()`, aucun `clients.claim()`. Rien n'est préchargé, et un service worker fraîchement activé ne contrôle pas la page qui l'a enregistré. Cache vide, `caches.match()` rend `undefined`, `event.respondWith(undefined)` produit une erreur réseau — l'écran « site inaccessible » constaté sur le téléphone le 2026-08-04.

### Périmètre
`web/public/sw.js`, la configuration de construction Vite, `web/src/main.jsx:262` (enregistrement).

### Ne pas toucher
Le cache du dernier solde en `localStorage` (`main.jsx:30` et `259`) : il fonctionne et porte déjà la date de fraîcheur exigée par P16.

### Contrainte d'implémentation
Vite **hache le nom des fichiers produits** (`index-BtT_-pPc.js`). La liste des ressources à précharger n'existe donc qu'au moment de la construction. `clients.claim()` et `skipWaiting()` seuls ne feraient que ramener trois visites à deux — ce n'est pas la correction.

### Étapes
- [ ] Précharger la coque à l'installation du service worker, à partir de la liste réelle des fichiers produits par la construction.
- [ ] `skipWaiting()` + `clients.claim()` pour que la première visite soit couverte.
- [ ] Ne jamais répondre `undefined` à `respondWith` : hors ligne et sans cache, rendre une réponse qui **dit** que la coque n'est pas prête, plutôt qu'une erreur réseau.
- [ ] **Vérification** : première visite en ligne sur un vrai téléphone via Tailscale, puis réseau coupé — la page se charge et affiche le dernier solde connu **avec sa date**.

### Critères d'acceptation
1. Une **seule** visite en ligne suffit pour que la visite hors ligne suivante fonctionne.
2. Réseau coupé, l'écran affiche le dernier solde connu avec sa date de fraîcheur, jamais un chiffre présenté comme actuel.
3. Coque absente du cache : un message honnête, jamais « site inaccessible ».
4. En ligne, le comportement ne change pas — la page reste servie par le réseau.

---

## L'arbitrage de T15 — rendu

**Le fait, mesuré le 2026-08-04, pas supposé** : le CSV Revolut réel contient les mouvements de **plusieurs comptes** et **ne permet pas de les séparer**. Trois valeurs de `Produit` pour quatre comptes, aucun identifiant de pocket, et la colonne `Solde` ne se referme arithmétiquement sur aucune des trois. La correspondance compte par compte du chemin PDF n'est donc pas transposable.

**Décision de Lamoms : refuser le fichier.**

*Ce que ça coûte* : l'import CSV Revolut se ferme. *Pourquoi c'est acceptable* : l'API Revolut couvre dix-sept mois (plancher mesuré 2025-03-02, 314 transactions ingérées dont la somme tombe **au centime** sur le solde publié par la banque). Le CSV n'apporte rien que l'API n'ait déjà, et c'est lui qui a produit les 898 € de mouvements fantômes du 2026-08-04.

*Ce que ça préserve* : le principe « un import ne place rien qu'il ne puisse justifier », qui est la raison d'être de tout ce cycle.

**Conséquence à surveiller** : le jour où une banque **sans API** exportera un CSV multi-comptes, ce refus fermera le seul chemin disponible. Aucun cas aujourd'hui — Nickel passe par le PDF, dont le chemin gère déjà la correspondance compte par compte. Plafond nommé, à ne pas coder d'avance.
