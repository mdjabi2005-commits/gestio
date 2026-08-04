# Tâches du cycle 2 — remise en état

**Émis le** 2026-08-04 par le Planificateur, à partir de `.lamoms/prd.md`.
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

### Intercalaire — revue de T13, T14 et T15 (2026-08-04)

T13, T14 et T15 sont fusionnées. Leur revue par le Planificateur, faite sur le code réellement fusionné (`56a1690`, `ff2783e`, `31562d7`) et non sur les rapports, a levé **cinq** constats. **Deux tâches correctives s'intercalent avant T16.**

| Constat | Carnet | Ce que c'est | Traité par |
|---|---|---|---|
| **A** | P47 | `npm test` rend un vert **vide** quand `NODE_TEST_CONTEXT` fuit dans le shell — piège armé, pas déclenché : Copilot a bien exécuté les 30 tests | **T20** |
| **B** | P48 | Une erreur **passagère** (un 429) retire une banque de la synchro de fond **définitivement** — régression introduite par T14 | **T21** |
| **C** | P49 | Le corpus Trade Republic est lu par chemin **absolu** hors dépôt — la suite ne tourne que sur le PC de Lamoms | **T20** |
| **D** | P50 | La date de fraîcheur disparaît **entièrement** dès qu'un compte n'en a pas — arbitré par Lamoms le 2026-08-04 | **T21** |
| **E** | P51 | Le refus d'import CSV compare un nom d'établissement **saisi à la main** | **parké** |

| | Tâche | Problèmes | Fichiers principaux |
|---|---|---|---|
| **T20** | La preuve de test redevient une preuve | P47, P49 | `package.json`, `src/enable-banking.test.ts`, fixture versionnée |
| **T21** | Une panne passagère ne condamne plus une banque | P48, P50 | `src/server.ts`, `src/ui-logic.ts`, `web/src/main.jsx` |

**Ordre imposé** : T20 → T21 → T16. T20 d'abord et **seule**, parce qu'elle conditionne la crédibilité de toute vérification ultérieure : tant qu'elle n'est pas passée, aucun « `npm test` passe » n'est une preuve. T21 ensuite, sous un harnais désormais prouvé.

**P51 est parké** — mode de panne sûr (refus, jamais d'écriture fausse), déclenché seulement par un renommage d'établissement. Aucune tâche ouverte ; à rouvrir au premier import légitime refusé.

**Ce qui répond bien au besoin et n'est pas remis en cause** : Trade Republic entre effectivement en base (T13) ; `message` journalisé aux quatre sites, `0,00 €` remplacé par « Solde inconnu », total marqué incomplet, `last_sync_at` préservé (T14) ; les deux refus de l'incident du 2026-08-04 sont couverts et la règle multi-comptes est portée par le registre `bankCsvFormats`, pas par un `if` dans la route (T15).

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

---

## T20 — La preuve de test redevient une preuve

**Problèmes** : P47, P49.
**Pourquoi avant tout le reste** : il n'y a **aucune CI** dans ce dépôt — vérifié, `.github/workflows` n'existe pas. La commande locale est la seule barrière, et dans certains shells elle rend un vert **vide**. Piège armé, pas encore déclenché : les reviews Copilot de #22 et #23 rapportent un décompte réel (« 30 pass / 0 fail »), donc la suite s'est bien exécutée chez Copilot et **les verdicts de T13, T14 et T15 ne sont pas en cause**. Ce qu'on corrige, c'est le jour où un agent lancera la vérification depuis un shell contaminé sans que rien ne le signale.

### Périmètre
- `package.json` — le script `test` (l. 13) **uniquement**.
- `src/enable-banking.test.ts` — le test « replays the local Trade Republic capture ».
- Un fichier de fixture **nouveau**, versionné, sous `src/`.

### Rayon d'impact vérifié
Le script `test` n'a aucun consommateur automatisé : pas de `.github/workflows`, aucun script shell du dépôt ne l'appelle (`grep -rn "npm test" --include=*.yml --include=*.sh` ne rend que des lignes de `.lamoms/tasks.md`, qui sont de la documentation). Le changement n'a donc pas d'appelant à casser. `npm run lint`, `npm run typecheck` et `npm run build` ne sont pas touchés.

### Ne pas toucher
- **Aucun fichier de `src/` hors les tests et la nouvelle fixture.** T20 ne change pas une ligne de comportement — c'est ce qui la rend jugeable seule.
- Ne pas ajouter de framework de test, de runner, ni de dépendance. `node --test` + `tsx` sont en place et suffisent.
- Ne pas toucher `.lamoms/lab/` — c'est le laboratoire d'AGY, gitignoré, et il le reste. On **copie** ce qu'il faut, on ne le déplace pas.
- Ne pas modifier les attentes des 30 tests existants.

### Étapes
- [ ] `package.json` l. 13 : retirer `NODE_TEST_CONTEXT` de l'environnement avant d'appeler `node --test`. **Mesuré** : dans le shell des agents la variable vaut `child-v8`, node avertit « run() is being called recursively within a test file. skipping running files » et n'exécute **aucun** fichier, en sortant **0**. Un `unset` en tête de la commande suffit ; ne pas la remplacer par une chaîne vide, qui reste une variable définie.
- [ ] Vérifier qu'aucun autre script de `package.json` n'exécute de tests (`grep -n '"test' package.json`) — s'il y en a un, le traiter pareil.
- [ ] Créer `src/fixtures/trade-republic-capture.json`, versionné, à partir de `.lamoms/lab/agy/tr_transactions_raw.json` et `tr_balances_raw.json`. **Un seul fichier**, forme `{ "transactions": [...], "balances": {...} }`, reprenant la structure exacte que `parseBankTransaction` et `parseBalance` reçoivent de l'API. Conserver **à l'identique** `booking_date`, `transaction_amount`, `credit_debit_indicator`, `balance_type`. Retirer tout IBAN, nom de titulaire et identifiant de compte. `entry_reference` : le conserver seulement s'il ne porte rien d'identifiant, sinon le remplacer par un jeton stable (`tr-001`, `tr-002`, …).
- [ ] `src/enable-banking.test.ts`, test « replays the local Trade Republic capture » : lire la fixture par chemin **relatif au fichier de test** (`new URL("./fixtures/trade-republic-capture.json", import.meta.url)`). **Supprimer** `GESTIO_LAB_CORPUS`, `GESTIO_SKIP_CORPUS`, l'option `skip` et le chemin absolu `/mnt/c/Users/djabi/…`.
- [ ] Renforcer l'assertion du même test. `transactions.map(parseBankTransaction).length === 43` ne prouve que l'absence d'exception. Ajouter, avec les valeurs relevées sur la capture réelle : la **somme** des 43 `amountCents`, la date la plus ancienne et la plus récente. Ces trois nombres se lisent une fois sur le corpus et se figent dans le test.
- [ ] **Vérification**, dans cet ordre :
  1. `npm test` affiche un décompte non nul (`pass 30` ou plus) et non une sortie vide ;
  2. `NODE_TEST_CONTEXT=child-v8 npm test` donne **le même** résultat que sans la variable ;
  3. introduire temporairement un `assert.equal(1, 2)` dans un test existant : `npm test` sort en code **non nul** ; le retirer ensuite ;
  4. renommer temporairement `.lamoms/lab/agy` et relancer `npm test` : la suite passe **intégralement** ; remettre le nom ;
  5. `npm run build`.

### Critères d'acceptation
1. `npm test` lancé dans un shell portant `NODE_TEST_CONTEXT=child-v8` exécute la suite complète et rapporte un nombre de tests **non nul**.
2. Un test volontairement faux fait sortir `npm test` en code non nul — démontré dans le rapport, puis retiré du diff.
3. La suite passe intégralement avec `.lamoms/lab/` **absent ou renommé**.
4. La fixture versionnée ne contient ni IBAN, ni nom de titulaire, ni identifiant de compte : `grep -inE "FR[0-9]{2}|iban|holder|name" src/fixtures/trade-republic-capture.json` ne rend rien de nominatif.
5. Le test de la capture vérifie au moins une **valeur** (somme des montants et dates extrêmes), pas seulement un compte de lignes.
6. `git diff --name-only` ne montre **aucun** fichier de `src/` hors `*.test.ts` et la fixture, plus `package.json`.

---

## T21 — Une panne passagère ne condamne plus une banque, et la fraîcheur reste lisible

**Problèmes** : P48 (régression introduite par T14), P50 (arbitré par Lamoms le 2026-08-04).
**Pourquoi ensuite** : P48 annule en pratique ce que T14 était venue garantir. Rendre une panne visible ne sert à rien si la panne se transforme en arrêt définitif et silencieux de la synchronisation. Et P50 rend muet, en permanence, l'indicateur dont le mode hors connexion dépend.

### Périmètre
- `src/server.ts` — la boucle de synchronisation de fond (l. 45-70), sa requête de sélection (l. 56).
- `src/ui-logic.ts` — `oldestUpdatedAt` (l. 53-60).
- `web/src/main.jsx` — l. 60-61 (`freshness`, `offlineDate`) et l. 115 (rendu de la fraîcheur).
- Tests : `src/enable-banking.test.ts`, `src/ui-logic.test.ts`.

### Rayon d'impact vérifié
`oldestUpdatedAt` a **deux** consommateurs, tous deux dans `web/src/main.jsx` : l. 60 (`freshness`, affiché l. 115) et l. 61 (`offlineDate`, le repli hors connexion). Toute modification de sa valeur de retour touche **les deux** — le mode hors connexion inclus. Aucun autre appelant, vérifié par `grep -rn oldestUpdatedAt`.
La requête de sélection de la boucle de fond (l. 56) est le **seul** endroit qui filtre par `status` pour la synchronisation périodique. `recordBankError` a quatre appelants (l. 63, 127, 133, 582) ; aucun n'a à changer.

### Ne pas toucher
- ⚠️ **`recordBankError` (l. 986-992).** L'état `FAILED` posé après un échec est **juste** — c'est ce que T14 est venue apporter et c'est ce qui rend la panne visible. C'est son **effet d'exclusion** qui ne l'est pas. **Ne pas** revenir au `CASE WHEN status = 'PENDING'` d'avant T14 : ce serait rouvrir P38.
- ⚠️ **Le passage à `EXPIRED` (l. 786-787), posé par le contrôle de session, reste le seul état terminal.** Ne pas y toucher, et ne pas le contourner.
- **Ne pas** construire une taxonomie d'erreurs passagères contre terminales. Elle n'est pas nécessaire : le terminal a déjà son état, `EXPIRED`.
- **Le bouton Synchroniser et son identifiant unique en `localStorage`** (`main.jsx:208` et `224`) : **plafond connu, hors périmètre.** Une seule connexion sur trois y est joignable. La reprise automatique rétablie par cette tâche le rend non bloquant — au pire l'utilisateur attend un passage de la boucle. À traiter le jour où l'attente devient gênante, pas d'avance.
- `unknownBalanceCount`, l'affichage « Solde inconnu » et la mention de total incomplet livrés par T14 : **justes, ne pas y toucher.**
- Le moteur de déduplication, les imports, `parseBankTransaction`.

### Étapes
- [ ] `src/server.ts:56` : la boucle de fond sélectionne `WHERE status IN ('AUTHORIZED', 'FAILED')`. Une connexion en échec **reste affichée en échec** mais **redevient candidate** au passage suivant ; le premier succès la repasse à `AUTHORIZED` et efface `last_sync_error` (l. 908, déjà en place, rien à ajouter). `EXPIRED` et `PENDING` restent exclus.
- [ ] Extraire le **corps** de la boucle (le `for` sur les connexions, l. 58-65) dans une fonction nommée appelée à la fois par le `setInterval` et par les tests. C'est un point d'accroche, pas une couche : une seule fonction, aucun paramètre nouveau, aucune indirection. Sans elle, le critère 1 n'est démontrable qu'en simulant un intervalle de six heures.
- [ ] `src/ui-logic.ts:53` : `oldestUpdatedAt` ignore de nouveau les comptes sans `updatedAt` et rend la plus ancienne date **connue** ; `null` seulement si **aucun** compte n'en a.
- [ ] `src/ui-logic.ts` : exporter `missingUpdatedAtCount(accounts)` — le nombre de comptes dont `updatedAt` est absent. Fonction pure, deux lignes, à côté de `oldestUpdatedAt`.
- [ ] `web/src/main.jsx:115` : après « À jour au … », afficher « · n compte(s) sans date » **quand le compte est non nul**. Aucune mention quand il vaut zéro — le cas nominal ne change pas d'apparence.
- [ ] `web/src/main.jsx:61` : `offlineDate` dépend de `freshness`. Vérifier qu'en mode hors connexion une date s'affiche toujours, et que le repli `screen.savedAt` reste atteint quand aucun compte n'a de date.
- [ ] Test, dans `src/enable-banking.test.ts`, rejouant le scénario de T14 **jusqu'à la reprise** : après le 429, la connexion est `FAILED` ; puis, sans **aucun** `POST /enable-banking/sync`, un appel direct à la fonction extraite ci-dessus, l'API n'étant plus en limitation, repose la connexion à `AUTHORIZED` et fait avancer `last_sync_at`.
- [ ] Test, dans le même fichier : une connexion `EXPIRED` **n'est pas** reprise par cette fonction.
- [ ] Test, dans `src/ui-logic.test.ts` : sur l'ensemble comportant le compte « Jamais chargé », `oldestUpdatedAt` rend `"2026-08-01T09:00:00Z"` et `missingUpdatedAtCount` rend `1`. **L'assertion `oldestUpdatedAt(accounts) === null` posée par T14 devient fausse par décision de Lamoms** — la remplacer, ne pas la contourner.
- [ ] **Vérification** : `npm test && npm run build` — le décompte de tests doit être non nul, T20 l'ayant rendu fiable. Puis sur une copie de la base réelle : passer une connexion à `FAILED` à la main, déclencher un passage de la boucle, constater le retour à `AUTHORIZED` sans intervention dans l'interface.

### Critères d'acceptation
1. Une connexion `FAILED` est reprise par la synchronisation de fond **sans intervention**, et repasse `AUTHORIZED` au premier succès — démontré par un test qui rejoue le 429 de T14 puis observe la reprise.
2. Une connexion `EXPIRED` n'est **pas** reprise.
3. Une connexion `PENDING` n'est pas reprise non plus — le comportement d'avant est conservé sur ce point.
4. L'en-tête affiche la plus ancienne date **connue**, suivie du nombre de comptes sans date lorsqu'il est non nul.
5. Quand tous les comptes portent une date, l'affichage est **identique** à celui d'aujourd'hui — aucune mention parasite.
6. `unknownBalanceCount`, « Solde inconnu » et le total marqué incomplet, livrés par T14, sont inchangés : les assertions correspondantes de `src/server.test.ts` passent **sans être modifiées**.
7. `recordBankError` continue de poser `FAILED` et de préserver `last_sync_at` — l'échec reste visible.
