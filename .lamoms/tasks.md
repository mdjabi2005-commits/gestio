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

**Ordre imposé** : T20 → T21 → T16. **⚠️ PÉRIMÉ le 2026-08-06** — remplacé par « T22 → T21 → T24 → T18 », le dernier ordre imposé de cet en-tête. T16 est fermée (#25) et T23 abandonnée. T20 d'abord et **seule**, parce qu'elle conditionne la crédibilité de toute vérification ultérieure : tant qu'elle n'est pas passée, aucun « `npm test` passe » n'est une preuve. T21 ensuite, sous un harnais désormais prouvé.

### Intercalaire — revue de T20 (2026-08-05, sur `main` 120ee92)

T20 est fusionnée et fait ce qu'elle annonce : le vert vide est neutralisé, la capture Trade Republic est versionnée et fidèle, aucune ligne de production n'a bougé. La revue lève **deux** constats, dont aucun n'est imputable à T20 — les deux préexistaient et T20 les a rendus visibles.

| Constat | Carnet | Ce que c'est | Traité par |
|---|---|---|---|
| **F** | P52 | `GESTIO_SKIP_CORPUS=1` désactive **quatre** preuves sur données réelles et rend un `exit 0` — même famille que P47, par une autre porte. Elle a **déjà servi** à démontrer le critère 3 de l'issue #29 | **T22** |
| **G** | P49 (reste) | T20 n'a versé que le corpus **Trade Republic**. Trois autres fichiers de test lisent encore des corpus par chemin absolu hors dépôt | **T23** (CSV) / **jamais** (PDF) |

**Le corpus PDF ne sera pas versé — décision, pas oubli.** Le dépôt `mdjabi2005-commits/gestio` est **PUBLIC** ; le corpus pèse **246 Mo** et porte IBAN, adresse et titulaire sur 21 relevés réels. Le verser, ce serait publier définitivement des relevés bancaires réels — ce que `.gitignore:17-22` refuse déjà, pour la même raison, au lab AGY. `src/pdf-import.test.ts` garde donc `GESTIO_PDF_CORPUS` en **dépendance locale assumée et documentée**. Conséquence acceptée : hors du poste de Lamoms, deux tests PDF sont **rouges** — rouge et visible, jamais vert et muet.

**Ordre imposé** : **T22 → T21 → T23 → T16.** **⚠️ PÉRIMÉ le 2026-08-06** — remplacé par « T22 → T21 → T24 → T18 », le dernier ordre imposé de cet en-tête. T16 est fermée (#25) et T23 abandonnée. T22 passe devant parce qu'elle coûte trois lignes et referme la dernière porte du faux vert ; sur le poste de Lamoms elle ne casse rien, les corpus y sont. T21 garde son rang : c'est la seule des trois qui corrige un comportement subi par l'utilisateur. T23 est lourde (anonymisation d'un corpus croisé) et ne bloque personne — elle attend son tour.

> **Périmé le 2026-08-05, quelques heures plus tard.** L'ordre ci-dessus vaut jusqu'à l'intercalaire suivant : T23 et T16 y disparaissent toutes les deux. Le plan de T23 reste écrit plus bas — il n'est pas exécutable, il est conservé comme trace.

### Intercalaire — l'import CSV sort du produit (2026-08-05)

Parti d'une question de Lamoms — *« qu'est-ce qu'on gagnerait à maintenir le parseur CSV ? »* — et vérifié dans le code.

**Trois faits.** Le parseur Revolut est **inatteignable en production** depuis T15 : `multiAccount: true` (`src/csv-import.ts:27`) fait refuser le fichier par la route avant tout parsing. Il ne reste donc **qu'un** usage réel, La Banque Postale. Et LBP a déjà deux chemins plus riches : l'API sur 90 jours, et 12 relevés PDF mensuels avec contrôle d'équilibre — quand le CSV LBP porte 27 lignes sur une fenêtre courte, sans solde vérifié.

**L'architecture d'ingestion, clarifiée par Lamoms** : API Enable Banking sur 90 jours glissants ; au-delà, relevés PDF mensuels pour chaque banque **sauf Revolut**, importés à la fin de chaque mois — bilan de vérification et prolongation de l'historique long terme ; Revolut en **API seule**, sa couverture dépassant 90 jours. Le PDF n'est pas un repli mais un **accès exclusif** : le Livret A et le Livret Jeune n'apparaissent que dans les relevés. Le CSV n'a aucune place dans ce modèle.

| Tâche | Devient | Pourquoi |
|---|---|---|
| **T16** — Le rapprochement signale l'incertain | **fermée** (#25, `NOT_PLANNED`) | Ses deux causes sont des défauts **exclusifs de la route CSV**. `needs_review` est posé par le PDF (`server.ts:416`) et par la synchro (`:847`, `:865`) ; seul l'`INSERT` CSV l'omet. Et son test central était **déjà impossible** depuis T15 |
| **T23** — Les corpus CSV entrent dans le dépôt | **abandonnée** | Plus de parseur, plus de corpus à anonymiser. Le plan reste écrit comme trace |
| **T24** — L'import CSV sort du produit | **nouvelle** | P53 |

**⚠️ P42 ne se ferme pas avec T16 — et son enjeu monte.** Le signalement des rapprochements incertains n'a jamais été **mesuré** sur le chemin qui survit : ce que le plan de T16 affirmait de la route PDF venait d'une lecture de code, pas d'un rejeu. Surtout, la protection qui rendait la panne CSV supportable disparaît — sur le CCP le solde vient de l'API et restait juste, mais **le Livret A, le Livret Jeune et Nickel n'ont aucune API**. Leur solde **est** la somme de leurs mouvements, et un doublon non détecté y fausse directement le chiffre principal. La mesure part donc avec T24, en tant que mesure et non de correction.

**P51 devient caduc** : le code qu'il visait disparaît avec la route. Il ne se résout pas, il cesse d'exister.

**Ordre imposé** : **T22 → T21 → T24 → T18.**

**⚠️ T18 passe APRÈS T24 — collision certaine, pas probable.** `web/src/main.jsx:189` est **une seule ligne** qui porte le `<details>` « Ajouter ou importer », le formulaire de saisie manuelle, le `<hr />` et le formulaire CSV. T24 en retire deux morceaux (plus le gestionnaire `csv`, l. 180-188) ; T18 en ajoute trois. Les deux issues étant ouvertes en même temps, le conflit git est garanti sur cette ligne. T18 planifiée le 2026-08-04, T24 le 2026-08-05 : aucune des deux ne citait l'autre. T18 part donc d'un `main.jsx` déjà nettoyé, et son constat de départ a été corrigé en conséquence.

**⚠️ CONVENTION DE REPÉRAGE, posée le 2026-08-06 après audit — on cite un SYMBOLE, pas un numéro de ligne.** Huit repères des tâches restantes pointaient à côté. La cause est mesurée : `31562d7` (T15) ajoute **+32/−9 lignes à `src/server.ts`**, net +23, dans la route `/imports/csv` — et il a été fusionné le 2026-08-04 à 20:39, alors que T17 et T18 avaient été planifiées **le même jour à 16:36**. Tout ce qu'elles citaient sous cette route s'est décalé d'une vingtaine de lignes.

Le cas le plus dangereux, corrigé : T17 disait « ne pas toucher l'upsert de synchro, `l. 786-790` ». À cette adresse se trouve aujourd'hui le passage à `EXPIRED` — que **T21 déclare de son côté intouchable comme seul état terminal**. Un Codex obéissant à la lettre serait allé modifier exactement la ligne que l'autre tâche protège.

Les repères de ligne qui subsistent portent leur date de relevé (« l. 363 au 2026-08-06 ») et ne sont qu'une **indication de proximité** : c'est toujours le symbole qui fait foi. Toute tâche écrite ensuite suit cette convention.

**⚠️ CINQ REPÈRES Y ONT ÉCHAPPÉ, relevés le 2026-08-08 — la convention a été posée dans ce fichier, pas dans les corps d'issues déjà ouverts.** Or **c'est l'issue que Codex lit**. #26, #27, #28 et #30 ont été ouvertes le 2026-08-04, avant la convention ; la resynchronisation a été demandée le 2026-08-07 et n'a été faite que sur #33. Le même mécanisme qu'en 2026-08-06 va donc se rejouer, et cette fois il est **mesuré à l'avance** : T24 retire `app.post("/imports/csv")` de `src/server.ts` — de la ligne 283 à ~362 au 2026-08-08, soit **~80 lignes** — plus `src/csv-import.ts` (221 l.) et, dans `web/src/main.jsx`, le gestionnaire `const csv = async event =>` (l. 180-188, **9 lignes**) et sa moitié de la ligne 189.

| Issue | Repère dans le corps | Après la fusion de T24 |
|---|---|---|
| #30 (T21) | ancre `strategy: firstSync ? "longest" : "default"`, l. 824 au 2026-08-08 | remonte d'~80 lignes |
| #30 (T21) | effacement de `last_sync_error` au premier succès, l. 908 au 2026-08-08 | remonte d'~80 lignes |
| #30 (T21) | bouton *Synchroniser* et son identifiant `localStorage`, l. 208 et 224 au 2026-08-08 | remontent d'~9 lignes |
| #28 (T19) | cache du dernier solde en lecture — ancre `localStorage.getItem(cacheKey)`, l. **260** au 2026-08-08 (l'écriture `localStorage.setItem(cacheKey, …)`, l. 30, est sous la coupe et ne bouge pas) | remonte d'~9 lignes |

**⚠️ Ce repère était faux d'une ligne, et il l'était déjà dans le corps de #28 — mesuré par Copilot le 2026-08-08, vérifié par mes soins.** `web/src/main.jsx:259` est `function formatDateTime(date)`, sans rapport avec le cache ; `readCachedBalance()` et son `localStorage.getItem(cacheKey)` sont à la **260**. J'avais recopié l'adresse depuis l'issue au lieu de la relever dans le code — c'est la faute même que la convention interdit, commise en écrivant la convention. **Le symbole fait foi, le numéro n'est qu'une indication datée** : c'est la seule raison pour laquelle l'erreur est sans conséquence ici.

**La collision est certaine, pas probable** : dans l'ordre en vigueur, T21 (#30) et T19 (#28) passent toutes deux **après** T24. Sous le point de coupe, rien ne bouge — `src/server.ts:56` et `:60`, `web/src/main.jsx:30`, `:61`, `:71-72`, `:115`, `:163` restent justes. #26 et #27 sont indemnes : leurs repères sont au-dessus de la coupe ou déjà ancrés par symbole (`app.post("/imports/pdf"`, `ON CONFLICT(external_hash) DO UPDATE`).

**Action, pour Copilot, APRÈS la fusion de T24 et AVANT que #30 et #28 partent chez Codex** : ré-ancrer ces cinq repères **par symbole** dans le corps des deux issues, en citant le texte du code plutôt que son adresse. **Aucun périmètre fonctionnel ne change** — c'est un ancrage, pas une réécriture de tâche ; si une étape paraît fausse au passage, elle me revient. Le remède ne consiste pas à recalculer les numéros après chaque fusion : un numéro recalculé pourrit à la fusion suivante, un symbole non.

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

## ~~T16 — Le rapprochement signale l'incertain~~

> **FERMÉE le 2026-08-05** — issue #25, `NOT_PLANNED`. Ses deux causes sont des défauts **exclusifs de la route CSV**, qui sort du produit (T24). Le plan reste ci-dessous comme trace : c'est lui qui a localisé la cause, et c'est cette localisation qui permet aujourd'hui de fermer la tâche sans la faire. **P42 reste actif** et part avec T24, en mesure — voir l'intercalaire.

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
la dérivation du nom pendant la synchro — ancre `const name = optionalApiString(account.name)` dans `src/server.ts` (l. 804 au 2026-08-06) et `web/src/main.jsx` (rendu d'une transaction sans libellé).

### Ne pas toucher
⚠️ **Ne pas inverser la priorité `name` → `product`.** Mesuré : `product` vaut `null` chez La Banque Postale **et** sur les quatre comptes Revolut, et `"CHECKING_ACCOUNT"` chez Trade Republic. L'inversion casserait deux banques pour en réparer une.
⚠️ **Aucun nommage manuel n'entre au périmètre.** L'upsert de synchro — ancre `INSERT INTO accounts (institution_id, name, type` (l. 807 au 2026-08-06) — réécrit `name` à chaque passage : une saisie serait effacée silencieusement. C'est une **décision**, pas un oubli — ne pas ajouter de colonne ni de formulaire.

### Étapes
- [ ] Ancre `const name = optionalApiString(account.name)` : utiliser `details` quand la banque le renseigne — il porte le nom du pocket chez Revolut (« Assurance », « Auto entreprise déclaration paiement », « Abonnement feu vert »).
- [ ] Quand la banque ne rend que le titulaire, dériver du type de compte. Couverture mesurée : **9 comptes sur 9, zéro saisie**. Le compte principal Revolut (#5) est le seul `CACC` de son établissement ; il en va de même pour #1 et #2.
- [ ] Prévoir le repli lisible pour un pocket sans `details` — plafond nommé, à ne pas sur-construire.
- [ ] **Deux comptes de même type dans un même établissement : lever la collision dans la boucle qui existe déjà.** Le postulat de l'étape précédente — « #5 est le seul `CACC` de son établissement » — est vrai aujourd'hui et rien ne le garantit demain. Or il n'existe **aucun** index unique sur `(institution_id, name)` (`src/schema.ts:19-33` : seul `accounts_external_hash_unique_idx`), donc la collision est silencieuse par construction, et l'upsert réécrivant `name` à chaque passage (ancre `ON CONFLICT(external_hash) DO UPDATE`), elle se **réinstalle seule** quatre fois par jour. La boucle `for (const value of accountValues)` voit **tous** les comptes de la session : la détection ne demande ni requête, ni colonne, ni index. Un nom dérivé apparaissant plus d'une fois dans la session reçoit son discriminant — les 4 derniers caractères d'`external_uid`, stable d'une synchro à l'autre. ⚠️ **Suffixer TOUS les homonymes, jamais le seul second** : sinon le résultat dépend de l'ordre dans lequel la banque renvoie ses comptes, et il changerait à chaque synchro.
- [ ] ~~`web/src/main.jsx` : une transaction sans libellé ne doit pas rendre une ligne vide.~~ **ÉTAPE CADUQUE, vérifiée le 2026-08-06.** `web/src/main.jsx:163` porte déjà `{transaction.label || "Sans libellé"}`, livré par `a1ff9be` (issue-13, 2026-08-04 01:37) et présent dans `master`. T17 a été planifiée le même jour avec une étape déjà satisfaite. **Le critère 4 reste dû et devient plus dur** : avec « Sans libellé » des deux côtés, les deux débits de 20,00 € du 2026-05-20 rendent aujourd'hui une ligne **strictement identique** — même libellé, même montant, même date. C'est ce qui reste à traiter.
- [ ] **Vérification** : `npm test && npm run build`, puis constater à l'écran quatre noms distincts sous Revolut.

### Critères d'acceptation
1. Les quatre comptes Revolut portent **quatre noms distincts**, sans aucune saisie.
2. Les comptes La Banque Postale, Trade Republic et Nickel gardent un nom compréhensible.
3. Les comptes manuels (#7 Livret A, #8 Livret Jeune, #9 Nickel) ne changent pas de nom.
4. Une transaction sans libellé reste lisible et **distincte de sa voisine** — les deux débits de 20,00 € du 2026-05-20 ne rendent pas deux lignes identiques. Le repli « Sans libellé » à lui seul ne satisfait pas ce critère : il est déjà en place et produit précisément deux lignes identiques.
5. **Ce qui est préservé** : les **neuf** comptes réels portent **exactement** le nom qu'ils auraient sans la règle de collision. Elle ne s'active qu'en cas d'homonymie et ne touche aucun nom unique — démontré en comparant les neuf noms avant et après.
6. Deux comptes de même type dans un même établissement portent deux noms distincts, et **les mêmes noms après une seconde synchronisation**. C'est la stabilité qui est en jeu, l'upsert repassant dessus quatre fois par jour.

---

## T18 — Les trois portes manquantes

**Problème** : P40.

### Ce qui est mesuré
`POST /accounts` (l. 183), `POST /institutions` (l. 193) et `POST /imports/pdf` (ancre `app.post("/imports/pdf"`, l. 363 au 2026-08-06) existent et fonctionnent — ils ont servi pendant la mise en service, **par `curl`**. Aucun n'a de porte dans l'interface : le bloc `<details className="card"><summary>Ajouter ou importer</summary>` (l. 189 au 2026-08-06) n'offre que la saisie manuelle d'une transaction. Conséquence : sur une installation neuve, le seul chemin vers un premier compte est une banque API (`main.jsx:71-72`, l'accueil ne propose que « Connecter votre première banque »). Un utilisateur qui n'a que Nickel et un Livret A **ne peut pas franchir l'accueil**.

> **Constat corrigé le 2026-08-06.** La formulation d'origine disait « n'offre que la saisie manuelle **et l'import CSV** ». C'était vrai le 2026-08-04 ; T24 retire le formulaire CSV et T18 passe après elle. Codex partirait sinon d'un repère périmé pour se placer dans la ligne 189.

### Périmètre
`web/src/main.jsx` uniquement — les trois routes serveur existent et ne changent pas.

### Ne pas toucher
Les routes serveur. Le contrat d'entrée est déjà fixé : `readAccountInput` (ancre `function readAccountInput(body: unknown)`, l. 591 au 2026-08-06) attend `{ name, type: BANK|LIVRET_A|OTHER, institutionId? }` ; `POST /imports/pdf` exige un `accountIds` couvrant **chaque** compte du relevé.

### ⚠️ ARBITRAGE À RENDRE AVANT DE LANCER L'ISSUE — destinataire : Copilot, PAS Codex
**Posé le 2026-08-06, corrigé le même jour.** Les trois portes n'ont pas le même risque. Deux **n'écrivent aucune transaction** ; la troisième ouvre au grand public le chemin d'écriture dont on ne sait pas encore s'il est sain.

- **Inconditionnel** — création d'**établissement** et création de **compte**. Elles suffisent à lever le cas nommé par P40 : « un utilisateur qui n'a que Nickel et un Livret A ne peut pas franchir l'accueil ».
- **Conditionnel** — l'import **PDF**, subordonné au **résultat de la mesure de P42** rapportée par T24. Mesure bonne → la porte entre. Mesure mauvaise → **elle attend la tâche de correction**, et T18 se livre sans elle, les deux autres portes acquises.

Pourquoi : T24 **mesure** le chemin PDF, elle ne le corrige pas — si la mesure échoue, elle s'arrête au constat (c'est son plan). Ouvrir la porte grand public entre-temps exposerait le seul chemin d'alimentation du **Livret A, du Livret Jeune et de Nickel**, dont le solde **est** la somme des mouvements : un doublon non détecté y fausse directement le chiffre principal.

**Comment l'arbitrage se rend, et par qui.** T24 est fusionnée **avant** que cette issue parte : son rapport dit si la mesure de P42 est bonne ou mauvaise. **Copilot tranche à ce moment-là** et raye du plan ci-dessous soit rien, soit l'étape et le critère marqués *(conditionnel)*. Codex reçoit alors **une liste fermée** — deux portes ou trois — et n'a aucun arbitrage à rendre.

> **Ce que Codex ne doit PAS faire** : lire le rapport d'une autre tâche, ni décider lui-même si la porte PDF entre. Il travaille dans un worktree isolé, sur une issue ; il n'a pas ce rapport et ce n'est pas son rôle. Si les marques *(conditionnel)* sont encore présentes quand l'issue lui arrive, **c'est l'arbitrage qui manque** — il le signale et n'écrit pas la porte PDF.

### Étapes
- [ ] Ajouter au bloc « Ajouter ou importer » (ancre `<summary>Ajouter ou importer</summary>`) la création d'un **établissement** et d'un **compte**.
- [ ] L'accueil vide (`main.jsx:71-72`) doit proposer un second chemin que « Connecter votre première banque ».
- [ ] *(conditionnel — à conserver ou rayer par Copilot avant lancement)* Ajouter l'import d'un **relevé PDF**, avec la correspondance compte par compte que la route exige.
- [ ] **Vérification** : sur une base vide, créer un établissement et un compte **entièrement depuis l'interface**, sans terminal ; puis le relevé PDF si l'étape conditionnelle a été conservée.

### Critères d'acceptation
1. Sur une base vide, un **établissement** et un **compte** s'ajoutent depuis l'interface seule, sans terminal.
2. L'écran reste **identique sur mobile et sur desktop** — contrainte fondatrice du projet, vérifiée sur un vrai téléphone lors de la mise en service.
3. *(conditionnel — même sort que l'étape)* Un relevé PDF s'ajoute depuis l'interface, et un relevé **sans correspondance complète est refusé**, message visible à l'écran.
4. **Ce qui est préservé** : la saisie manuelle d'une transaction, seul contenu actuel du bloc « Ajouter ou importer », reste atteignable et fonctionne à l'identique.

---

## T19 — Le hors connexion tient sa promesse

**Problèmes** : P43, et la contrainte fondatrice **P16**.

### Ce qui est mesuré
`web/public/sw.js` (555 octets) déclare **uniquement** un écouteur `fetch` — aucun `install`, aucun `self.skipWaiting()`, aucun `clients.claim()`. Rien n'est préchargé, et un service worker fraîchement activé ne contrôle pas la page qui l'a enregistré. Cache vide, `caches.match()` rend `undefined`, `event.respondWith(undefined)` produit une erreur réseau — l'écran « site inaccessible » constaté sur le téléphone le 2026-08-04.

### Périmètre
`web/public/sw.js`, la configuration de construction Vite, l'enregistrement du service worker dans `web/src/main.jsx` (ancre `navigator.serviceWorker.register("/sw.js")`, l. 263 au 2026-08-06).

### Ne pas toucher
Le cache du dernier solde en `localStorage` (`main.jsx:30` et `259`) : il fonctionne et porte déjà la date de fraîcheur exigée par P16.

### Contrainte d'implémentation
Vite **hache le nom des fichiers produits** (`index-BtT_-pPc.js`). La liste des ressources à précharger n'existe donc qu'au moment de la construction. `clients.claim()` et `skipWaiting()` seuls ne feraient que ramener trois visites à deux — ce n'est pas la correction.

**`web/public/` est copié verbatim** — `vite.config.ts` n'a aucun plugin, donc rien n'est substitué dans `sw.js` à la construction. La liste préchargée **et** l'identifiant de version du cache doivent être injectés par le **même** point d'accroche : un `writeBundle` d'une dizaine de lignes dans `vite.config.ts`, qui écrit `dist/web/sw.js`. Un seul mécanisme pour les deux besoins. ⚠️ **Aucune dépendance nouvelle** — ni Workbox ni `vite-plugin-pwa` : ajouter un paquet pour ça serait exactement ce que ce cycle reproche à l'import CSV.

### ⚠️ Le nom de cache est FIXE aujourd'hui — c'est le second défaut, non signalé par P43
`web/public/sw.js:1` : `const cacheName = "gestio-shell"`, jamais versionné, et le cache est alimenté **à l'exécution** (`cache.put` sur chaque réponse `ok`), pas au préchargement. Comme les noms de fichiers sont hachés, chaque construction y **ajoute** ses fichiers sans jamais retirer les précédents. `index.html` étant lui aussi mis en cache (`destination: "document"`), il référence des fichiers hachés eux-mêmes encore présents : hors ligne, on sert une coque **cohérente mais périmée**, indéfiniment. Le défaut existe **déjà** — le préchargement de cette tâche le rendrait seulement plus visible.

### Étapes
- [ ] Précharger la coque à l'installation du service worker, à partir de la liste réelle des fichiers produits par la construction.
- [ ] **Versionner le nom du cache** avec l'identifiant de build injecté par le même hook, et **purger les autres à l'`activate`** :
  ```js
  self.addEventListener("activate", event => event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => clients.claim())
  ));
  ```
  La purge se fait **après** `skipWaiting()`, donc aucune page n'est servie depuis un cache en cours de suppression.
- [ ] `skipWaiting()` + `clients.claim()` pour que la première visite soit couverte.
- [ ] Ne jamais répondre `undefined` à `respondWith` : hors ligne et sans cache, rendre une réponse qui **dit** que la coque n'est pas prête, plutôt qu'une erreur réseau.
- [ ] **Vérification** : première visite en ligne sur un vrai téléphone via Tailscale, puis réseau coupé — la page se charge et affiche le dernier solde connu **avec sa date**. Puis **deux constructions successives** et `caches.keys()` relevé dans la console.

### Critères d'acceptation
1. Une **seule** visite en ligne suffit pour que la visite hors ligne suivante fonctionne.
2. Réseau coupé, l'écran affiche le dernier solde connu avec sa date de fraîcheur, jamais un chiffre présenté comme actuel.
3. Coque absente du cache : un message honnête, jamais « site inaccessible ».
4. **Ce qui est préservé** : en ligne, le comportement ne change pas — la page reste servie par le réseau, la stratégie reste réseau d'abord. La purge ne doit pas transformer le service worker en cache d'abord.
5. Après **deux constructions successives**, `caches.keys()` rend **exactement une** entrée, et la coque servie hors ligne est celle de la **dernière** construction — pas la précédente restée cohérente.

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
- ⚠️ **PLAFOND NOMMÉ ET ASSUMÉ, arbitré par Lamoms le 2026-08-06 — ce n'est PAS à T21 de le corriger.** Une connexion `FAILED` **jamais synchronisée** redemandera l'aspiration **profonde** à chaque passage, indéfiniment. La chaîne, lue dans le code : `src/server.ts:60` passe `connection.lastSyncAt === null` comme `firstSync`, et `src/server.ts:824` fait `strategy: firstSync ? "longest" : "default"`. C'est le profil **exact** de Trade Republic aujourd'hui (`last_sync_at=null`, `SYNC_FAILED`) — donc le cas se produira dès la première boucle après cette tâche. **Pourquoi on l'assume** : le quota tient — boucle à 6 h, soit 4 passages/jour, la limite exacte de P33 ; il n'y a aucun dépassement. Et le corriger imposerait précisément la taxonomie d'erreurs que la ligne du dessus interdit. **Ne rien coder pour ça.** L'observation est portée par la recette de mise en service, pas par un critère de T21 ; si le volume devient gênant, c'est une tâche à part, avec une mesure derrière.
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

---

## T22 — Aucune variable d'environnement ne peut plus vider la suite

**Problème** : P52.
**Pourquoi maintenant** : T20 a fermé la porte `NODE_TEST_CONTEXT`. Celle-ci est restée ouverte, et elle a **déjà servi** : la démonstration du critère 3 de l'issue #29 ne tient qu'avec `GESTIO_SKIP_CORPUS=1` posé, c'est-à-dire avec quatre preuves sur données réelles désactivées. Tant qu'un vert peut être obtenu sans exécuter, le harnais rendu crédible par T20 ne l'est qu'à moitié. Trois lignes à retirer.

### Périmètre
- `src/csv-import.test.ts` — l. 14 (`corpusTest`) et son usage l. 16.
- `src/lab-replay.test.ts` — l. 25-27, l'objet d'options du test « replays the real T2 corpus in both channel orders ».
- `src/pdf-import.test.ts` — l. 13 (`corpusTest`) et ses deux usages, l. 25 et l. 49.

Rien d'autre. Aucune fixture, aucun fichier nouveau.

### Rayon d'impact vérifié
`grep -rn "GESTIO_SKIP_CORPUS"` sur tout le dépôt hors `node_modules` rend **cinq** occurrences : les trois ci-dessus, plus deux **documentaires** (`.lamoms/tasks.md:295`, `.lamoms/problems.json`) qui ne sont pas du code. Aucun script de `package.json`, aucun fichier de `scripts/`, aucun workflow — il n'y a pas de `.github/`. **Aucun appelant à casser.**
Sur le poste de Lamoms les deux corpus existent (`.lamoms/lab/agy`, `/mnt/c/Users/djabi/Documents/relevé pdf`) : après suppression, `npm test` reste vert avec le même décompte. La tâche ne change donc rien à ce qui est observé ici — elle supprime seulement la possibilité d'observer autre chose ailleurs.

### Ne pas toucher
- ⚠️ **Les `assert.ok(existsSync(...))` qui nomment le corpus absent** (`csv-import.test.ts:19` et `:27`, `lab-replay.test.ts:31`, `pdf-import.test.ts:26` et `:50`). Ils deviennent le **seul** mécanisme de signalement, et c'est ce qui rend l'échec lisible. Les retirer transformerait un message clair en `ENOENT` brut.
- ⚠️ **Ne pas remplacer le `skip` par un autre saut conditionnel** — ni `existsSync`, ni variable renommée, ni `t.skip()`. Ce serait rouvrir P52 sous un autre nom. Un corpus absent doit rendre la suite **rouge**.
- `GESTIO_LAB_CORPUS`, `GESTIO_PDF_CORPUS`, `GESTIO_REVOLUT_CSV` : **hors périmètre**, T23 les traite. Un chemin surchargeable par variable ne produit pas de faux vert ; c'est la seule chose qui compte ici.
- **Aucune valeur d'assertion** : 19, 8, 250, 3, 77, 27, 299, 45, 6, 54 restent telles quelles.
- Aucun fichier de `src/` hors les trois tests nommés. Aucun fichier de production.

### Étapes
- [ ] `src/csv-import.test.ts` : supprimer `const corpusTest = { skip: ... }` (l. 14) et retirer l'argument `corpusTest` du test « parses the real La Banque Postale and Revolut CSV corpus » (l. 16).
- [ ] `src/lab-replay.test.ts` : retirer l'objet d'options `{ skip: ... }` (l. 25-27) du test « replays the real T2 corpus in both channel orders ». Le test ne prend plus que son nom et sa fonction.
- [ ] `src/pdf-import.test.ts` : supprimer `const corpusTest` (l. 13) et retirer son argument des deux tests (l. 25, l. 49).
- [ ] `grep -rn "GESTIO_SKIP_CORPUS" src/` ne doit plus rien rendre.
- [ ] **Vérification**, dans cet ordre :
  1. `npm test` → décompte **non nul**, `pass 30`, **`skipped 0`** ;
  2. `GESTIO_SKIP_CORPUS=1 npm test` → **exactement le même résultat** que sans la variable ;
  3. renommer temporairement `.lamoms/lab/agy`, relancer `npm test` : sortie en code **non nul**, et le message nomme le fichier absent ; remettre le nom ;
  4. `npm run lint && npm run typecheck && npm run build`.

**Hors plan, à faire porter par Copilot** : le critère 3 de l'issue #29 (« la suite passe intégralement avec `.lamoms/lab/` absent ou renommé ») est faux tel qu'écrit et ne le deviendra qu'après T23, et seulement pour les corpus CSV. Le reformuler sur ce que T20 a réellement démontré : « la suite ne dépend plus de `.lamoms/lab/` pour le corpus Trade Republic ». Ce n'est pas du code, Codex n'y touche pas.

### Critères d'acceptation
1. `GESTIO_SKIP_CORPUS=1 npm test` rend **le même décompte** que `npm test` : même nombre de `pass`, et `skipped 0` dans les deux cas. **Aucune variable d'environnement ne peut plus réduire le nombre de tests exécutés.**
2. `grep -rn "GESTIO_SKIP_CORPUS" src/` ne rend rien.
3. Corpus renommé → `npm test` sort en code **non nul** et le message d'échec **nomme le chemin absent** — l'échec est diagnostiquable sans lire le code.
4. **Ce qui est préservé** : sur le poste de Lamoms, corpus en place, `npm test` reste vert avec le décompte **inchangé** (`pass 30`). Aucune preuve perdue, aucune ajoutée, aucune valeur figée modifiée.
5. `git diff --name-only` ne montre que `src/csv-import.test.ts`, `src/lab-replay.test.ts`, `src/pdf-import.test.ts`.

---

## ~~T23 — Les corpus CSV entrent dans le dépôt, anonymisés~~

> **ABANDONNÉE le 2026-08-05, jamais ouverte.** Plus de parseur CSV, plus de corpus à anonymiser. Le plan reste ci-dessous comme trace — la contrainte du dépôt public et l'analyse du jaccard inter-canaux resserviront le jour où l'on versera un corpus.

**Problème** : P49 (ce que T20 n'a pas couvert).
**Pourquoi ensuite** : après T22, un corpus absent rend la suite rouge. Trois fichiers de test lisent encore des corpus hors dépôt, donc la suite n'est intégralement verte que sur le poste de Lamoms. Les corpus CSV sont petits (2,6 Ko + 32 Ko) et anonymisables ; on les verse. Le corpus PDF ne le sera **jamais** — voir la contrainte ci-dessous.

### ⚠️ Contrainte dure : le dépôt est PUBLIC
`github.com/mdjabi2005-commits/gestio`, visibilité **PUBLIC**. Tout ce que cette tâche verse est **publié définitivement** — un retrait ultérieur impose de réécrire l'historique et n'annule pas la divulgation. L'anonymisation n'est donc pas une précaution de confort : c'est la condition d'existence de la tâche. Les corpus portent des IBAN, un numéro de compte, le nom du titulaire et **des noms de tiers** dans les libellés de virement. **En cas de doute sur un libellé, on le remplace ; on ne le garde pas.**

### Périmètre
- **Nouveaux**, sous `src/fixtures/` : `lbp-ccp-a.csv`, `lbp-ccp-b.csv`, `revolut-statement.csv`, `t2-enable-banking.json`.
- `src/csv-import.test.ts` — l. 10-13 (`lab`, `statementCorpus`, `revolutCsv`) et le test « parses the real La Banque Postale and Revolut CSV corpus » (l. 16-37).
- `src/lab-replay.test.ts` — l. 23 (`lab`) et les chemins l. 28-30.
- `src/pdf-import.test.ts` — **un commentaire d'en-tête seulement**, aucun code.

### Rayon d'impact vérifié
Les deux CSV La Banque Postale sont lus par **deux** tests, pas un : `csv-import.test.ts:17` (comptes 19 et 8) **et** `lab-replay.test.ts:26-28` (appariement des deux canaux). Une seule paire de fixtures sert les deux — toute modification d'un montant ou d'une date casse le second.
`deduplicateTransactions` apparie par `matchKey` = `date\0montant` (`src/deduplication.ts:68`) puis départage par **jaccard sur les tokens de libellés** (l. 29-34), après `normalizeTransactionLabel` (l. 57-66 : NFD, diacritiques retirés, minuscules, non-alphanumériques en séparateurs). **Le libellé n'est donc pas décoratif : il est le critère d'appariement.**
`parseLaBanquePostale` décode en **ISO-8859-1 en dur** (`src/csv-import.ts:42`) et vérifie un préambule littéral accentué (l. 44-47) ; `parseRevolut` décode en **UTF-8 `fatal`** (l. 71) et vérifie un en-tête de 10 colonnes (l. 76-79). Une fixture mal encodée fait lever `CsvFormatError` — le test le dira, mais autant le savoir avant.
`GESTIO_PDF_CORPUS` est lu à **deux** endroits : `csv-import.test.ts:11` (seulement pour construire le chemin Revolut) et `pdf-import.test.ts:10`. Après cette tâche il ne reste **qu'un** chemin absolu dans tout le dépôt, celui du PDF.

### Ne pas toucher
- ⚠️ **Le corpus PDF ne se verse pas.** 246 Mo, 21 relevés réels avec IBAN, adresse et titulaire, dépôt public. `src/pdf-import.test.ts` garde `GESTIO_PDF_CORPUS` et ses deux tests restent rouges hors du poste de Lamoms — c'est l'état honnête et il est assumé. **Ne pas** fabriquer de PDF synthétiques dans cette tâche : ce serait une tâche à part entière (extraction de la couche texte, réécriture, dépendance d'écriture PDF), et elle n'est pas ouverte.
- ⚠️ **Dates et montants : intacts, partout.** Ce sont eux qui portent les valeurs figées et l'appariement des deux canaux. On n'anonymise que ce qui **nomme** : numéro de compte, libellés, soldes.
- ⚠️ **Ne pas déplacer ni copier `.lamoms/lab/`**, et ne pas modifier `.gitignore`. Le lab reste gitignoré ; on en tire une projection anonymisée, comme T20.
- **Ne pas affaiblir ni supprimer une assertion existante** pour faire passer la fixture. Si une valeur ne tombe plus juste, c'est l'anonymisation qui est fautive, pas l'assertion.
- Aucun fichier de production. `src/csv-import.ts` et `src/deduplication.ts` ne bougent pas d'une ligne : cette tâche ne change aucun comportement.

### Étapes
- [ ] **Construire une table d'anonymisation unique, token à token.** Recenser les tokens nominatifs des libellés (noms, prénoms, raisons sociales, numéros de compte, IBAN), sur leur forme **normalisée** au sens de `normalizeTransactionLabel` — sans accents, en minuscules. Associer à chaque token réel distinct **un** token de substitution distinct et stable. Relation **un pour un** : ne jamais fusionner deux tokens réels en un seul (l'intersection du jaccard grandirait et créerait de faux appariements), ne jamais scinder un token en deux (elle se réduirait). La table est **la même** pour les CSV La Banque Postale et pour le corpus T2 — c'est la condition pour que les 27 appariements survivent.
- [ ] `src/fixtures/lbp-ccp-a.csv` et `lbp-ccp-b.csv`, depuis `0984209Z0241785448406468.csv` (19 lignes) et `0984209Z0241785448417573.csv` (8 lignes). **Écrire en ISO-8859-1**, pas en UTF-8 : `parseLaBanquePostale` décode en dur et compare le préambule à `["Numéro Compte", "Type", "Compte tenu en", "Date", "Solde (EUROS)"]`. **Anonymiser** : la valeur de « Numéro Compte » (`0984209Z024`), les libellés selon la table, la valeur de « Solde (EUROS) » du préambule. **Conserver** : toutes les dates et tous les montants, le nombre de lignes (19 et 8), la structure exacte du préambule et l'en-tête `Date;Libellé;Montant(EUROS)`, et **au moins un libellé portant un accent** — sans quoi l'assertion « aucun `�` » ne prouve plus rien. Le nom d'origine des fichiers **est** un numéro de compte : ne pas le reprendre.
- [ ] `src/fixtures/revolut-statement.csv`, depuis `account-statement_2025-09-01_2026-06-14_fr-fr_646623.csv` (254 lignes). **UTF-8** (`parseRevolut` décode en `fatal`). Anonymiser la colonne **Description** (col. 5) selon la table et la colonne **Solde** (col. 10) — jamais assertée, mais c'est le solde réel du compte ; toute valeur numériquement valide convient. **Conserver** : les 254 lignes, l'en-tête à 10 colonnes au caractère près, les 3 lignes `RENVOYÉ`, `EUR`, les frais nuls, tous les montants, toutes les dates dont l'horodatage `2025-09-27T13:05:08`.
- [ ] **Les 77 libellés non-ASCII de Revolut** : soit chaque substitution conserve un caractère non-ASCII là où l'original en portait un et la valeur reste 77, soit le compte est **relevé sur la fixture** et figé à sa nouvelle valeur. Relevé, jamais deviné.
- [ ] `src/fixtures/t2-enable-banking.json`, depuis `enable_banking_transactions_reelles.json` : projeter `{ "transactions": [ { "booking_date", "credit_debit_indicator", "transaction_amount": { "amount" }, "remittance_information" } ] }` — les seuls champs lus (`lab-replay.test.ts:34-39`). Anonymiser `remittance_information` avec la **même** table. **Ne pas** restreindre le fichier à la fenêtre `>= 2026-06-01` : le filtre du test fait partie de ce qu'il démontre.
- [ ] `src/csv-import.test.ts` : lire les trois fixtures par `new URL("./fixtures/…", import.meta.url)`, comme T20. Supprimer `lab` (l. 10), `statementCorpus` (l. 11), `revolutCsv` et `GESTIO_REVOLUT_CSV` (l. 12-13).
- [ ] `src/lab-replay.test.ts` : même chemin relatif pour les trois fichiers ; supprimer `lab` et `GESTIO_LAB_CORPUS` (l. 23).
- [ ] `src/pdf-import.test.ts` : ajouter en tête un commentaire disant ce que `GESTIO_PDF_CORPUS` attend (arborescence `bp/` et `nickel/`) et **pourquoi** ce corpus n'est pas versé — 246 Mo, IBAN, adresse et titulaire, dépôt public. Aucune ligne de code modifiée.
- [ ] **Vérification** :
  1. `npm test` → vert, décompte non nul, `skipped 0` ;
  2. renommer `.lamoms/lab/agy` **et** `/mnt/c/Users/djabi/Documents/relevé pdf`, relancer : **seuls** les deux tests PDF échouent ; les tests CSV et T2 passent ; remettre les noms ;
  3. relire **intégralement** les quatre fixtures, à l'œil, avant de committer ;
  4. `npm run lint && npm run typecheck && npm run build`.

### Critères d'acceptation
1. **Les 27 appariements et `toReview` vide tiennent, dans les deux ordres de canaux, sur les fixtures** — c'est la preuve que la table d'anonymisation a préservé le jaccard entre les deux canaux, et la seule qui vaille.
2. **Ce qui est préservé** : les valeurs figées 19, 8, 250, 3, 27 et 0 sont **inchangées** ; aucune assertion existante n'est retirée, affaiblie ou réécrite. Seul le compte de libellés non-ASCII Revolut peut changer, et seulement s'il a été relevé sur la fixture.
3. `.lamoms/lab/agy` et `/mnt/c/Users/djabi/Documents/relevé pdf` renommés : `src/csv-import.test.ts` et `src/lab-replay.test.ts` passent **intégralement**. Les deux tests de `src/pdf-import.test.ts` échouent en nommant le chemin absent — attendu et documenté.
4. Les fixtures La Banque Postale sont bien en ISO-8859-1 : le préambule accentué est reconnu (le test lève `CsvFormatError` sinon) et l'octet `0xE9` est présent dans le fichier.
5. **Aucune donnée nominative dans `src/fixtures/`** : `grep -rinE "iban|FR[0-9]{2}|djabi|0984209"` ne rend rien, et les quatre fixtures ont été relues intégralement — pas seulement grepées.
6. Il ne reste **qu'un seul** chemin absolu dans tout `src/` : `GESTIO_PDF_CORPUS` dans `src/pdf-import.test.ts`, accompagné du commentaire qui l'assume.
7. `git diff --name-only` ne montre que les quatre fixtures, `src/csv-import.test.ts`, `src/lab-replay.test.ts` et `src/pdf-import.test.ts`. **Aucun fichier de production** — cette tâche ne peut, par construction, causer aucune régression applicative.

---

## T24 — L'import CSV sort du produit

**Problème** : P53. **Emporte** P51 (devient caduc) et referme P49 pour les corpus CSV.
**Pourquoi** : le parseur Revolut est inatteignable depuis T15, La Banque Postale a deux chemins plus riches, et l'architecture d'ingestion clarifiée par Lamoms ne laisse aucune place au CSV. Environ 400 lignes qu'il faut faire vivre, qui ont produit l'incident du 2026-08-04, et qui ont fait planifier deux tâches. La plus petite modification qui règle le problème est une **suppression**.

### Périmètre
- **Supprimés** : `src/csv-import.ts` (221 l.), `src/csv-import.test.ts`, `src/lab-replay.test.ts`.
- `src/server.ts` — l'import l. 11, la route `POST /imports/csv` (l. 283 jusqu'à la fin de son handler, ~l. 341).
- `web/src/main.jsx` — le gestionnaire `csv` (ancre `const csv = async event =>` jusqu'à son `};`, l. 180-188 au 2026-08-06) et le formulaire « Importer un CSV » (l. 189).
- `src/pdf-import.ts` — le message d'erreur « couche texte » qui oriente vers le CSV, et l'assertion qui le vérifie (ancre `/couche texte.*CSV.*saisie manuelle/i` dans `src/pdf-import.test.ts`, l. 21 au 2026-08-06).
- **Ajouté** : un rejeu du rapprochement sur le chemin PDF, plus la mesure de P42.

### Rayon d'impact vérifié
`parseBankCsv` et `bankCsvFormats` n'ont que **deux** points d'usage hors de leur module : `server.ts:11` (import) et `server.ts:297`/`:313`. Rien d'autre dans le dépôt.
⚠️ **Se repérer par symbole, pas par numéro de ligne.** T21 passe avant et **extrait le corps de la boucle de fond dans une fonction nommée** : toutes les lignes de `src/server.ts` sous la l. 70 se décalent. Les repères ci-dessus (`l. 11`, `l. 283`, `l. 297`, `l. 313`, `~l. 341`) datent d'avant T21 et **auront glissé**. Les régions restent disjointes — T21 ne touche ni la route `/imports/csv` ni l'import de tête — mais on cherche `app.post("/imports/csv"` et l'`import … from "./csv-import.js"`, pas une ligne.
`deduplicateTransactions` a **trois** appelants : `server.ts:335` (CSV, supprimé), `:409` (PDF), `:836` (synchro). **Les deux survivants ne changent pas d'une ligne.**
`/imports/csv` n'est appelé qu'à `web/src/main.jsx:185`. Rien dans `web/public/sw.js`, rien dans `scripts/`. Les erreurs `csv_institution_mismatch`, `csv_accounts_not_separable` et `csv_format_unrecognized` ne sont produites que par cette route, et l'UI affiche leur `message` sans les nommer.
⚠️ **Le message d'erreur du chemin PDF oriente vers le CSV** : quand la couche texte manque, `src/pdf-import.ts` propose « CSV ou saisie manuelle », et `src/pdf-import.test.ts` l'asserte par `/couche texte.*CSV.*saisie manuelle/i` (l. 21 au 2026-08-06). Message et assertion doivent être réécrits **ensemble** — c'est le seul endroit du produit où la suppression laisse une phrase fausse à l'utilisateur.

### Ne pas toucher
- ⚠️ **`CSV_IMPORT` reste dans `src/schema.ts:5` et dans le `CHECK` de `src/db.ts:75`.** Des transactions réelles portent cette valeur. La retirer de l'énumération ou de la contrainte rendrait des lignes existantes non réinsérables et casserait le typage à la lecture. **On supprime le chemin d'écriture, pas la trace de ce qui a été écrit.** Aucune migration, aucun `UPDATE` sur `transactions`, aucune suppression de données.
- ⚠️ **`src/deduplication.ts` : pas une ligne.** Deux de ses trois appelants survivent, et le moteur n'a jamais été en cause — P42 l'a établi.
- ⚠️ **Le nouveau test de rejeu ne réintroduit aucun saut conditionnel.** T22 vient de supprimer `GESTIO_SKIP_CORPUS` (P52) ; écrire `skip: !existsSync(…)`, une variable d'environnement équivalente ou un `t.skip()` dans le test qui **remplace** `lab-replay.test.ts` rouvrirait le problème sous un autre nom, dans le fichier même qui en hérite. Corpus absent = suite **rouge**, avec un `assert.ok` qui nomme le chemin manquant. Même règle pour la mesure de P42.
- **Le chemin PDF entier** : route, `accountIds`, contrôle d'équilibre, pose de `needs_review`. T24 le **mesure**, elle ne le corrige pas. Si la mesure échoue, la correction est une autre tâche.
- La saisie manuelle, la synchronisation API, l'interface hors du formulaire CSV.

### Étapes
- [ ] Supprimer `src/csv-import.ts` et `src/csv-import.test.ts`.
- [ ] `src/server.ts` : supprimer l'import l. 11 et la route `POST /imports/csv` en entier. Vérifier qu'aucun symbole importé ne reste inutilisé (`npm run lint` le dira).
- [ ] `web/src/main.jsx` : supprimer le gestionnaire `csv` et le bloc `<form>` « Importer un CSV ». Le `<details>` « Ajouter ou importer » conserve la saisie manuelle ; le `<hr />` qui séparait les deux formulaires part avec.
- [ ] `src/pdf-import.ts` : le message d'erreur ne propose plus le CSV — **la saisie manuelle devient le seul repli**, et c'est assumé. Mettre à jour l'assertion `/couche texte.*CSV.*saisie manuelle/i` de `src/pdf-import.test.ts` dans le même commit.
- [ ] **Remplacer `src/lab-replay.test.ts`, ne pas le supprimer sèchement.** C'est aujourd'hui la seule preuve que le rapprochement fonctionne entre deux canaux **réels**, et elle doit changer de support, pas disparaître. Le corpus le permet : les relevés BP vont du 2025-07-08 au 2026-06-08 et le corpus API La Banque Postale couvre 2026-05-04 → 2026-07-27 — le recouvrement est franc sur mai-juin 2026. Le nouveau test rejoue `parsePdfStatement("releve_CCP…_20260608")` contre le corpus API sur la fenêtre commune. ⚠️ **Porter les assertions de l'ancien test, ne pas en inventer de plus faibles.** `lab-replay.test.ts` prouve aujourd'hui **27 appariements et `toReview` vide, dans les DEUX ordres de canaux**. Une remplaçante qui ne vérifierait que « aucune transaction déjà connue n'est réintroduite », dans un seul sens, serait une perte de preuve silencieuse — le critère 4 dirait qu'elle existe, et il aurait raison. Le test de remplacement porte donc les trois mêmes choses sur le couple PDF↔API : un **décompte d'appariements figé**, `toReview` **vide**, et **les deux ordres**. Le décompte est **relevé sur la fenêtre commune, jamais deviné** — même règle que pour les 77 libellés non-ASCII. Et si `toReview` n'est **pas** vide sur ce couple : **on ne touche pas au test pour le faire passer**, c'est un constat, il est rapporté tel quel et T24 s'arrête là.
- [ ] **Mesure de P42** — c'est elle qui justifie que T16 ait été fermée sans être faite. Sur le chemin PDF, **réimporter un relevé déjà importé** sur un compte **manuel** (Livret A ou Livret Jeune : aucune API, le solde **est** la somme des mouvements, donc un doublon y fausse directement le chiffre principal). Vérifier trois choses : aucune transaction ajoutée, solde inchangé, et `needs_review` posé dès que `toReview` n'est pas vide. **Si la mesure échoue, T24 s'arrête au constat** — le résultat est rapporté tel quel et la correction fait l'objet d'une tâche distincte. Ne pas corriger le chemin PDF dans cette tâche.
- [ ] Écrire en tête de `src/pdf-import.test.ts` et du nouveau test de rejeu ce que leur corpus attend et **pourquoi il n'est pas versé** (relevés réels, dépôt public). C'est ce qui transforme P49 d'un problème en une contrainte assumée.
- [ ] **Vérification** : `npm test` (décompte **non nul** — il baissera, c'est attendu : les tests du chemin supprimé partent avec lui), puis `npm run lint && npm run typecheck && npm run build`.

### Critères d'acceptation
1. `POST /imports/csv` n'existe plus et rend 404. Aucune occurrence de `parseBankCsv`, `bankCsvFormats` ou `CsvFormatError` dans `src/` ni dans `web/`.
2. **Ce qui est préservé — les données.** `SELECT COUNT(*) FROM transactions WHERE source = 'CSV_IMPORT'` rend **la même valeur avant et après** la tâche. `CSV_IMPORT` figure toujours dans `src/schema.ts:5` et dans le `CHECK` de `src/db.ts:75`. Aucune migration n'a été écrite.
3. **Ce qui est préservé — les deux chemins qui restent.** Les tests de la synchronisation API et de l'import PDF passent **sans qu'une seule de leurs assertions soit modifiée**, à la seule exception du message « couche texte ». `src/deduplication.ts` est inchangé.
4. **La preuve du rapprochement sur données réelles existe toujours ET reste aussi forte**, portée par le chemin PDF↔API. Elle a changé de support, elle n'a pas disparu — un diff qui supprime `lab-replay.test.ts` sans le remplacer ne satisfait pas ce critère. **Ni un remplaçant plus faible** : la preuve porte un **décompte d'appariements non nul et figé**, `toReview` **vide**, et **les deux ordres de canaux**. Un test qui n'asserte qu'une non-réintroduction unidirectionnelle ne satisfait pas ce critère.
5. La mesure de P42 sur un compte manuel a été **exécutée et son résultat rapporté**, bon ou mauvais. Un rapport qui ne la mentionne pas ne vaut pas livraison.
6. Le message d'erreur du PDF sans couche texte ne propose plus le CSV, et son assertion a suivi dans le même commit.
7. `git diff --stat` montre une **suppression nette** — au moins 400 lignes de moins qu'ajoutées.

---

### Intercalaire — l'architecture d'ingestion se referme (2026-08-07)

Partie de deux questions de Lamoms — *« qu'est-ce qu'on résout concrètement pour l'utilisateur ? »* puis *« il n'y a pas déjà des scripts Python qui détectent les virements internes ? »*. Trois faits en sont sortis, tous mesurés.

**1. Le PDF n'est pas le canal du bilan mensuel de toutes les banques.** Vérifié par Lamoms le 2026-08-07 : **l'API Revolut rend environ dix ans d'historique**. Revolut est en **API seule**, son rattrapage se fait par pagination. Le PDF est le rattrapage des banques à **fenêtre API courte** (La Banque Postale, Trade Republic) ou **sans API** (Nickel). Ma formulation précédente rangeait Revolut parmi les banques à relevé — elle était fausse, elle est corrigée au carnet (P55).

**2. Trade Republic entre dans la même mécanique que les deux autres.** Son relevé se génère **sur une période choisie** ; l'unique PDF du corpus est un échantillon de format, pas un manque de couverture. Aucun recollement de périodes n'est nécessaire. Ce qui manque est le **parseur** — P55.

**3. Le portage du moteur Python n'est pas une traduction.** Comparaison faite module par module contre `Documents/releves-pdf/src/gestio_releves/` : le TypeScript couvre déjà l'extraction PDF, la normalisation des libellés et le rapprochement inter-canaux. Il ne couvre **rien** de la qualification — et surtout, **`grep -niE "iban" src/pdf-import.ts src/schema.ts src/enable-banking.ts` ne rend rien**. L'IBAN, meilleure preuve du moteur Python, n'existe nulle part. P56.

| | Tâche | Problèmes | Fichiers principaux |
|---|---|---|---|
| **T25** | Les relevés s'importent en une fois | P54 | `web/src/main.jsx` |
| **T26** | Trade Republic entre par le relevé | P55 | `src/pdf-import.ts` — **plan non écrit, recherche manquante** |
| **T27** | Un virement entre tes comptes cesse d'être une dépense | P56, P30 | `src/pdf-import.ts`, `src/schema.ts`, `src/db.ts`, nouveau module, `src/server.ts` |

**Ordre imposé — il ne remplace pas le précédent, il le prolonge** : **T22 → T24 → T18 → T21 → T17 → T19 → T25 → T26 → T27.** Confirmé par Lamoms le 2026-08-07 : l'ordre déjà en cours ne bouge pas.

**⚠️ AMENDEMENT DU 2026-08-08 — T28 s'insère en tête, avant T24.** Ordre en vigueur : **T22 (faite) → T28 → T24 → T18 → T21 → T17 → T19 → T25 → T26 → T27.** Ce n'est pas une préférence et ce n'est pas un rangement. `npm test` est **rouge sur `master` `838e731`** (30 tests, 29 pass, 1 fail) à cause de P57, et le critère de vérification de **chacune** des huit tâches restantes est « `npm test` passe ». Tant que l'échec préexistant est là, aucune de ces vérifications ne distingue ce qu'une tâche vient de casser de ce qui l'était déjà — c'est mot pour mot le raisonnement qui avait mis T20 en tête. T28 coûte un fichier de test ; la laisser en file coûte la lisibilité de huit recettes.

---

## T28 — Le décompte de relevés cesse de casser à chaque téléchargement

**Problème** : P57.
**Pourquoi en tête** : voir l'amendement ci-dessus. Elle rend la file de nouveau lisible.

### Ce qui est mesuré
`npm test` sur `master` `838e731` : **30 tests, 29 pass, 1 fail**, `src/pdf-import.test.ts:31`, `assert.equal(bpStatements.length, 12)` → `13 !== 12`. Le relevé `releve_CCP0984209Z024_20260708` est arrivé dans `bp/` le 2026-08-08 à 13:09 ; T22 avait été fusionnée à 12:51. **T22 n'est pas en cause** — son diff est de −8/+4 sur trois fichiers de test, aucun fichier de production. Elle a rendu la dérive visible en moins de deux heures, ce qui était son objet.

Un **second échec est caché derrière le premier** : `nickel/` porte 11 fichiers `RM*.pdf` quand la ligne 44 en attend 9 ; l'assertion de la ligne 31 échoue avant, la 44 n'a jamais tourné. **Vérifier les deux**, ne pas s'arrêter au premier vert obtenu.

### Périmètre
`src/pdf-import.test.ts` **uniquement**.

### Ne pas toucher
- ⚠️ **Aucun fichier de production.** Le parseur est juste : c'est le test qui est écrit contre un dossier mouvant. `git diff --name-only` ne montre **que** `src/pdf-import.test.ts`.
- ⚠️ **Aucune variable d'environnement, aucun `skip`, aucun `existsSync` conditionnel qui rendrait le test vert quand le corpus manque.** T22 vient de fermer cette porte (P52) ; la rouvrir ici, dans le fichier même qui hérite du problème, serait la troisième récidive de la famille. Corpus absent = **rouge**, avec un `assert.ok` qui nomme le chemin.
- ⚠️ **Aucune valeur d'assertion recalculée ni devinée.** `299`, `45`, `6`, `54` ont été relevées sur des fichiers précis ; elles restent telles quelles, sur ces fichiers-là.

### Étapes
- [ ] **Nommer les fichiers du décompte figé.** Deux listes en dur, par nom de fichier : les **12** relevés BP de `releve_CCP0984209Z024_20250708` à `…_20260608`, et les **9** Nickel de `2025-9-251005RM…` à `2026-5-260607RM…`. Les décomptes existants (`299` CCP, `45` LIVRET_A, `6` LIVRET_JEUNE, `54` NICKEL, et `12`/`9` relevés) portent désormais sur **ces listes**, pas sur le contenu du dossier. Corpus complet mais un fichier nommé manquant → **rouge**, avec son nom.
- [ ] **Invariants sur TOUS les fichiers trouvés**, listes nommées comprises : chaque relevé BP porte exactement `CCP,LIVRET_A,LIVRET_JEUNE` (l'assertion de la l. 36 existe déjà, elle s'applique à l'ensemble) et chaque relevé s'équilibre. Ces assertions **gagnent** en force quand le corpus grossit ; c'est là que le treizième relevé entre.
- [ ] **Plancher** : `assert.ok(bpFiles.length >= 12)` et l'équivalent Nickel, pour qu'un dossier vidé ou tronqué reste rouge — le plancher ne remplace pas le décompte figé, il le double.
- [ ] **Vérification** : `npm test` **vert**, avec un décompte de tests **non nul** et **au moins égal à 30**. Puis, preuve que la tâche a bien fait son travail : **déplacer temporairement** `releve_CCP0984209Z024_20260708` hors de `bp/`, relancer — la suite reste **verte** ; le remettre, relancer — elle reste **verte**. Enfin `npm run lint && npm run typecheck && npm run build`.

### Critères d'acceptation
1. `npm test` est **vert** sur les 30 tests, corpus complet au 2026-08-08 (`bp/` = 13, `nickel/` = 11).
2. **L'ajout d'un relevé ne rend plus la suite rouge**, démontré par le retrait/remise du relevé de juillet — c'est la raison d'être de la tâche.
3. **Ce qui est préservé, et c'est le critère qui compte** : la preuve ne faiblit pas. Les décomptes `299`, `45`, `6`, `54` sont **toujours vérifiés**, sur les relevés nommés ; un dossier vide ou amputé d'un fichier nommé rend la suite **rouge** avec ce nom. Un diff qui obtiendrait le vert en supprimant ou en assouplissant ces assertions **ne satisfait pas ce critère**.
4. **Aucune porte de sortie réintroduite** : `grep -rnE "SKIP|t\.skip\(|skip:" src/pdf-import.test.ts` ne rend rien.
5. `git diff --name-only` ne montre que `src/pdf-import.test.ts`.

### Contexte
P57 (cause), P52 (la porte que T22 vient de fermer et qu'on ne rouvre pas), P35 (c'est parce que Lamoms **doit** télécharger d'autres relevés que le décompte figé est intenable), P47 (la famille du vert qui ne vérifie rien).

**Pourquoi T27 en dernier, et ce n'est pas une préférence** : P30 apparie une écriture **avec sa contre-écriture**. Tant que les quatre comptes ne sont pas dans l'outil, chaque virement interne n'a qu'une moitié visible et serait classé `virement_externe` — l'inverse exact du but. T18 (portes de création) et T25 (rattrapage des relevés) sont donc des **conditions**, pas un rangement.

---

## T25 — Les relevés s'importent en une fois

**Problème** : P54.
**Pourquoi ensuite** : la route existe et déduplique déjà correctement ; T18 vient de lui donner sa porte. Il ne manque que le nombre. Le rattrapage de plus de vingt relevés se fait une fois, mais le **bilan mensuel** se répète pour trois banques — un geste pénible chaque mois ne se fait pas.

### ⚠️ Dépendance à l'arbitrage de T18 — à vérifier AVANT d'ouvrir l'issue
Cette tâche **étend la porte d'import PDF de T18**. Si l'arbitrage de T18 a rayé l'étape conditionnelle — mesure de P42 mauvaise —, **il n'y a pas de porte à étendre et T25 n'a pas d'objet**. Copilot le vérifie au lancement : porte PDF absente de `main.jsx` → T25 attend la tâche de correction de P42. Codex n'a pas cet arbitrage à rendre.

### Ce qui est mesuré
`POST /imports/pdf` prend **un** `pdfBase64` et **un** objet `accountIds` par appel. La correspondance, elle, est **stable** : `parseBanquePostale` exige les trois mêmes comptes dans chaque relevé (ancre `"Les trois comptes attendus sont absents"`), donc **une** correspondance vaut pour les douze relevés LBP ; Nickel n'a qu'un compte. Le lot, c'est **N fichiers pour une correspondance par banque**.
Le réimport est déjà sans danger : déduplication puis `INSERT OR IGNORE`, dans une transaction SQLite unique.
**Corpus — un chiffre relevé, jamais un chiffre gravé.** Au 2026-08-08 : `bp/` = **13** relevés (`20250708` → `20260708`), `nickel/` = **11** relevés (`2025-09` → `2026-07`). ⚠️ **Ces nombres bougent tous les mois** — ils ont grossi de 12 et 9 le jour même, et P35 impose d'en télécharger encore avant le 2026-09-06. Aucune étape ni aucun critère de cette tâche ne doit être écrit sur un décompte figé : on dit « tous les relevés du dossier », jamais « les douze ». Voir P57.

### Périmètre
`web/src/main.jsx` uniquement.

### Ne pas toucher
- ⚠️ **La route `POST /imports/pdf` ne change pas d'une ligne** — ni sa signature, ni sa déduplication, ni son refus d'une correspondance incomplète (`accountIds must map every statement account`). Cette tâche est **entièrement côté interface** : elle appelle N fois une route qui marche.
- ⚠️ **Ne pas paralléliser les appels.** La route ouvre une transaction SQLite ; les envois sont **séquentiels**, un fichier à la fois.
- ⚠️ **Ne pas deviner la banque d'un fichier depuis son nom.** Le nom est un numéro de compte chez LBP et une date chez Nickel ; c'est `parsePdfStatement` qui reconnaît l'en-tête, et lui seul. Si un fichier n'est pas reconnu, il est **signalé et sauté**, jamais deviné — le dossier `nickel/` de Lamoms contient six fichiers étrangers, dont un installeur.
- Aucun fichier de `src/`.

### Étapes
- [ ] Le champ de fichier de la porte PDF accepte **plusieurs fichiers** (`multiple`).
- [ ] Les fichiers sont envoyés **un par un, séquentiellement**, à `POST /imports/pdf`, avec la **même** correspondance pour tous ceux d'une même banque.
- [ ] **Compte rendu par fichier, à l'écran** : nom du fichier, importées, soldes, `needs_review`, ou le message d'erreur de la route. Un échec **n'interrompt pas** le lot — les suivants passent.
- [ ] **Vérification** : importer **tous les relevés LBP du dossier** en une fois sur une base vide ; relancer le **même** lot ; le second passage n'ajoute **aucune** transaction et ne change **aucun** solde.

### Critères d'acceptation
1. **Tous les relevés LBP du dossier** s'importent en **un** geste, avec **une** correspondance saisie, sans terminal — le nombre est celui du dossier au moment de la recette, jamais un nombre écrit d'avance.
2. **Idempotence démontrée** : second passage du même lot → 0 transaction ajoutée, soldes identiques. C'est ce qui rend le geste mensuel sans risque.
3. Un fichier non reconnu (prendre un des fichiers étrangers de `nickel/`) est **signalé nommément** et **les autres fichiers du lot s'importent quand même**.
4. **Ce qui est préservé** : l'import d'un **seul** relevé fonctionne à l'identique, et `POST /imports/pdf` est inchangée — `git diff --name-only` ne montre **aucun** fichier de `src/`.
5. L'écran reste identique sur mobile et sur desktop.

---

## T26 — Trade Republic entre par le relevé

**Problème** : P55.
**Recherche** : `.lamoms/lab/agy/rapport_agy_recherche_3.md`, reçu le 2026-08-07 — **retenu avec quatre corrections**, consignées ci-dessous. Les mesures sont bonnes ; quatre conclusions du rapport ne le sont pas, et deux d'entre elles auraient cassé le parseur.

> ⚠️ **Le rapport et les dumps `.lamoms/lab/agy/analyse_tr_pdf*` contiennent le nom et l'adresse postale du titulaire en clair** — le masquage n'a couvert que les montants et les IBAN. `.lamoms/lab/` est gitignoré, donc rien n'est publié. **Aucune chaîne de ce rapport ne se recopie dans un fichier versionné.** Les ancres ci-dessous ont été relues à cette fin.

### Ce qui est mesuré, et confirmé sur le dump brut
Couche texte **présente et dense** (18 pages, 2 061 items, aucune page vide) — `pdfjs` suffit, pas d'OCR.
Le document est **composite** : plusieurs sous-relevés dans un même PDF, chacun ouvert par `SYNTHÈSE DU RELEVÉ DE COMPTE` puis une ligne `PRODUIT` et sa ligne de valeurs.
**Le sens des colonnes est établi par la donnée, pas déduit** : `Incoming transfer…` porte son montant à `x=417.1`, `Outgoing transfer…` à `x=452.4`, et `Interest payment` à `x=417.1`. **`x≈417` = ENTRÉE = crédit ; `x≈452` = SORTIE = débit.** C'est le mécanisme de LBP (signe déduit de la position), pas celui de Nickel.
La **date d'un mouvement est coupée en deux lignes PDF** : `JJ mois.` à `x≈74.4`, puis l'**année seule** deux lignes plus bas, au même `x`. Le montant est sur la ligne intermédiaire. C'est la particularité de ce format.

### ⚠️ Les quatre corrections au rapport — elles font partie du plan
1. **Le motif de période proposé par le rapport est faux et je l'ai vérifié en l'exécutant.** `/(\d{1,2}\s+\w+\.?\s+\d{4})…/` échoue sur `01 déc. 2025 - 31 mai 2026`, `01 févr. 2026`, `01 août 2025` : en JavaScript `\w` ne couvre pas les lettres accentuées. **Trois mois sur douze — février, août, décembre — casseraient le parseur.** La preuve est dans le lab : l'analyse du second relevé rend `periodRaw: null` alors que la période est visible dans le document. **La table des mois s'écrit en clair, elle ne se devine pas par `\w`.**
2. **La segmentation par numéro de page ne tient pas.** Le rapport situe les sous-relevés « pages 13 et 14 » et les sections parasites « page 10 », « page 11 ». Sur le **second** relevé, les mêmes sections sont aux pages **1, 8 et 9**. **On segmente par l'ancre `SYNTHÈSE DU RELEVÉ DE COMPTE`, jamais par un numéro de page**, et on lit le nom du produit sur la ligne qui suit `PRODUIT` — le rapport nomme mal les produits des deux derniers sous-relevés, et cette lecture rend l'erreur inoffensive.
3. **L'« Exemple 1 » du rapport est intitulé « crédit » et conclut « débit ».** C'est le titre qui est faux, la conclusion est juste. Un Codex qui recopierait l'intitulé inverserait le signe.
4. **La colonne SOLDE n'a pas de `x` fixe.** Le rapport la donne à `502.1` — c'est la position de l'**en-tête**. Sur les lignes de mouvement les valeurs tombent entre `487` et `499` selon la largeur du montant. **Le solde est l'item le plus à droite de la ligne, pas un `x` codé en dur.**

### Périmètre
`src/pdf-import.ts` uniquement. Un type d'institution et une clé de compte nouveaux, un `parseTradeRepublic`, ses fonctions de lignes.

### ✅ ARBITRAGE RENDU PAR LAMOMS le 2026-08-07 — le compte-titres n'entre pas
Le relevé contient **plusieurs produits** : le compte courant, et au moins un compte-titres. **Lamoms a tranché : le compte-titres n'est pas compté pour l'instant.** La liste est donc **fermée** et Codex n'a aucun arbitrage à rendre : **on importe le compte courant, et lui seul**.

Cohérent avec la Core Feature : le « solde » d'un compte-titres est une valorisation de portefeuille, pas de la **trésorerie disponible**.

⚠️ **Mais non importé ne veut pas dire invisible.** Les autres sous-relevés sont **détectés, comptés et nommés** dans le résultat de l'import — jamais ignorés en silence. Un relevé partiel présenté comme complet est exactement le mode de panne que ce projet existe pour empêcher (P28). C'est ce que porte le critère 4, et il ne se raye pas avec l'arbitrage.

Faire entrer le compte-titres plus tard sera une tâche distincte, pas un élargissement de celle-ci.

### Ne pas toucher
- ⚠️ **`parseBanquePostale` et `parseNickel` ne changent pas d'une ligne.** Ce plan **ajoute** une branche ; les deux formats existants et leurs tests sont intouchables.
- ⚠️ **Ne pas élargir l'ancre de reconnaissance.** `"SYNTHÈSE DU RELEVÉ DE COMPTE"` seul est trop générique — il faut la **conjonction** avec `"TRADE REPUBLIC BANK GMBH"`, comparée après `comparable()` (accents retirés, majuscules), comme les deux autres formats.
- ⚠️ **Ne pas lire l'IBAN dans cette tâche.** Il est à `x≈404` sur la ligne d'en-tête, et il y en a d'autres **dans les libellés de virement** — ce sont des IBAN tiers. La distinction est le sujet de **T27**, pas d'ici. Y toucher ici ferait deux tâches se marcher dessus sur le même fichier.
- **Aucune fixture versionnée.** C'est un relevé bancaire réel et le dépôt est **public** — même décision que pour le corpus PDF existant (T20, T24). Le test dépend de `GESTIO_PDF_CORPUS`, dépendance locale **assumée et commentée**.
- Aucun fichier hors `src/pdf-import.ts` et son test.

### Étapes
- [ ] Ajouter `"TRADE_REPUBLIC"` à `PdfStatement["institution"]` et une clé de compte pour le compte courant à `PdfAccountKey`.
- [ ] Brancher la reconnaissance dans `parsePdfStatement` (ancre `"Format PDF non reconnu"`), **après** les tests LBP et Nickel : conjonction `TRADE REPUBLIC BANK GMBH` + `SYNTHESE DU RELEVE DE COMPTE` sur le texte `comparable()`.
- [ ] **Table des mois français explicite** — `janv. févr. mars avr. mai juin juil. août sept. oct. nov. déc.` → 01…12. ⚠️ `mars`, `mai`, `juin`, `août` **n'ont pas de point** ; les autres en ont un. Lire la période sur la ligne `DATE` de l'en-tête.
- [ ] **Segmenter le document par l'ancre `SYNTHÈSE DU RELEVÉ DE COMPTE`**, et pour chaque segment lire le nom du produit sous `PRODUIT`. Retenir le segment du compte courant ; **compter et nommer les autres**.
- [ ] Lire la ligne de synthèse du compte courant : solde de début (`x≈161`), total entrées (`x≈271`), total sorties (`x≈349`), solde de fin (**item le plus à droite**).
- [ ] `tradeRepublicTransactions` : ancrer sur `JJ mois.` à `x≈74`, **recoller l'année** lue deux lignes plus bas au même `x`, prendre le montant entre `x≈410` et `x≈460`, le **solde comme item le plus à droite**, et concaténer comme libellé tous les items à `x ≥ 147` du groupe de lignes de la transaction.
- [ ] **Signe du montant** : `montant.x < 434.5` → crédit (positif) ; sinon débit (négatif). Le seuil est le milieu des deux colonnes, comme LBP.
- [ ] Exclure les lignes parasites **par leur contenu, pas par leur position** : en-tête de colonnes (`DATE TYPE DESCRIPTION SOLDE`), ligne de synthèse, pied de page (`Page N de M`), et la section de fonds monétaires dont les colonnes sont différentes.
- [ ] **Contrôle d'équilibre, dans les deux sens** : `solde début + total entrées − total sorties = solde fin`, **et** la somme des mouvements lus égale les totaux annoncés — c'est ce second contrôle, celui de Nickel, qui attrape un mouvement manqué. Une divergence **lève une `PdfStatementError`**, elle ne s'arrondit pas.
- [ ] **Vérification, sur les DEUX relevés du corpus** (`Relevé de compte.pdf` et `statement.pdf`) : les deux se parsent, les deux passent le contrôle d'équilibre, et **les périodes lues sont exactes** — c'est `statement.pdf`, avec son `déc.`, qui prouve la correction n° 1.
- [ ] `npm test` (décompte non nul, `skipped 0`), puis `npm run lint && npm run typecheck && npm run build`.

### Critères d'acceptation
1. Les **deux** relevés Trade Republic du corpus se parsent, avec leur période exacte. ⚠️ **Un parseur qui ne lirait que le premier ne satisfait pas ce critère** : le second porte `01 déc. 2025 - 31 mai 2026`, et c'est lui qui démontre que la table des mois couvre les mois accentués.
2. **Le contrôle d'équilibre est réel et il échoue quand il doit** : retirer artificiellement un mouvement lu fait lever une `PdfStatementError`. Un contrôle qui ne peut pas échouer n'est pas un contrôle.
3. Le sens est juste sur des cas nommés : un `Incoming transfer` est **positif**, un `Outgoing transfer` est **négatif**. Ce sont les deux cas que le dump établit sans ambiguïté.
4. Les sous-relevés non importés sont **comptés et nommés** dans le résultat. Aucun produit n'est ignoré en silence.
5. **Ce qui est préservé** : les relevés La Banque Postale et Nickel se parsent à l'identique et **aucune assertion de leurs tests n'est modifiée**. `git diff --name-only` ne montre que `src/pdf-import.ts` et son test.
6. Un PDF d'une autre banque est toujours refusé avec le message de format non reconnu, mis à jour pour nommer les trois formats.
7. Aucun relevé, aucun extrait, aucun nom et aucune adresse n'entrent dans le dépôt. Le test dépend de `GESTIO_PDF_CORPUS` et le dit en commentaire.

---

## T27 — Un virement entre tes comptes cesse d'être une dépense

**Problèmes** : P56 (l'obstacle mesuré), **P30** (le défaut subi : 44 % des débits).
**Pourquoi en dernier** : voir l'ordre imposé ci-dessus — un appariement sur des comptes incomplets produit de faux `virement_externe`.

### Ce qui est mesuré
Sur les 43 transactions réelles de La Banque Postale, **15 sur 43** sont des virements du titulaire vers lui-même : **1 286,60 € sur 2 912,34 €** de débits, soit **44 %**. L'agrégat reste juste — l'argent change de poche — mais « combien j'ai dépensé » est presque doublé, et « combien je peux dépenser » qui en découle est faux.
Le moteur qui résout ça existe et tourne sur le corpus réel : **214 virements inter-comptes sur 478 mouvements**. Il est en Python, hors dépôt, **sous aucun git**.
Et `grep -niE "iban" src/pdf-import.ts src/schema.ts src/enable-banking.ts` **ne rend rien**.

### Périmètre — plus large que le fichier évident, et c'est nécessaire
- `src/pdf-import.ts` — extraction de l'IBAN de chaque compte du relevé.
- `src/schema.ts` et `src/db.ts` — colonne IBAN sur `accounts`, migration.
- **Nouveau module** `src/qualification.ts` — le portage proprement dit.
- `src/server.ts` — là où les mouvements entrent, pour poser la nature.
- `web/src/main.jsx` — pour que la nature soit **visible** ; un classement invisible ne règle pas P30.

### Ne pas toucher
- ⚠️ **`src/deduplication.ts` ne bouge pas.** La qualification est une **seconde passe** sur des transactions déjà en base, pas une modification du rapprochement. Le jaccard et `matchKey` sont éprouvés sur données réelles — les toucher casserait les preuves de T24.
- ⚠️ **Ne rien porter de l'outillage Python** : `cli.py`, `export_*.py`, `releve_lisible.py`, `miroirs_mensuels.py`, `ambiguites.py`. Environ 1 350 lignes sur 1 610 ne servent pas ce produit.
- ⚠️ **Ne pas réécrire l'extraction PDF, la normalisation ni le rapprochement** — le TypeScript les couvre déjà (`parsePdfStatement`, `normalizeTransactionLabel`, `deduplicateTransactions`).
- ⚠️ **`NOMS_PERSONNELS` ne se code pas en dur.** `rapprochement.py:20` contient les noms de Lamoms en clair. **Le dépôt gestio est PUBLIC.** Ces noms viennent de la base ou de la configuration, jamais du code.
- ⚠️ **Ne jamais supprimer une transaction ni modifier son montant.** Qualifier, c'est **annoter**. Un virement interne reste une transaction ; il cesse seulement de compter comme dépense.
- ⚠️ **Ne pas fusionner les deux moitiés d'un virement interne en une seule écriture.** Chaque compte garde la sienne ; c'est ce qui préserve le solde par compte.
- La migration suit l'idiome déjà en place : `pragma("table_info(...)")` puis `ALTER TABLE ... ADD COLUMN` conditionnel (`src/db.ts`, ancre `if (!columns.some(column => column.name === "transaction_at"))`). **Aucun outil de migration nouveau.**

### Étapes
- [ ] **Committer l'oracle avant de commencer.** `Documents/releves-pdf/` n'est sous aucun git et ses 214 appariements sont la seule référence du portage. Geste de Lamoms, hors dépôt, **local et jamais poussé** — le dépôt gestio est public et ce code contient ses noms.
- [ ] Colonne `iban` sur `accounts` (schéma + migration conditionnelle).
- [ ] `parsePdfStatement` remonte l'IBAN de chaque compte du relevé. Le relevé LBP le porte pour chaque compte, Livret A compris — mesuré, P32.
- [ ] ⚠️ **Le pays de l'IBAN Trade Republic n'est PAS établi — ne pas le coder en dur.** Le rapport AGY-3 conclut « IBAN DE, 22 caractères », mais ses trois occurrences mesurées sont des IBAN **tiers trouvés dans des libellés de virement**, pas celui du compte. La seule donnée d'en-tête établie est le **BIC `TRBKFRPPXXX`**, qui est **français** — l'entité est « Trade Republic Bank GmbH, **Branch France** ». Garder les deux tailles de la table Python (`FR` 27, `DE` 22) et **relever le pays réel à l'exécution**, jamais le supposer.
- [ ] ⚠️ **Récolte gratuite, mesurée dans le lab et à exploiter** : les libellés de virement Trade Republic portent la **contrepartie et son IBAN entre parenthèses** (forme `Incoming transfer from <nom> (<IBAN>)`), et nomment la banque de destination pour les sorties. C'est exactement ce que `_score_interne` attend au niveau 100 (IBAN) et au niveau 60 (banque nommée). L'appariement La Banque Postale ↔ Trade Republic est donc atteignable au **niveau certain**, à condition de distinguer l'IBAN **du compte** (ligne d'en-tête du relevé) de ceux **des libellés** (contreparties).
- [ ] `src/qualification.ts` — porter, dans cet ordre : `extraire_ibans` et `normaliser_iban` (IBAN `FR` 27, `DE` 22) ; les prédicats `est_virement`, `est_retrait_especes`, `est_frais_retrait`, `est_depot_especes` ; `_apparier` — appariement **mutuel** (chacun est le meilleur candidat de l'autre), montants **opposés**, comptes **différents**, tolérance **±3 jours** ; `_score_interne` — les trois niveaux `iban` (100) > `même institution` (80) > `banque nommée` (60), moins l'écart en jours ; `_qualifier_seul` — dont la catégorie **`virement_a_verifier`**.
- [ ] ⚠️ **Porter aussi la règle du candidat unique** : `_apparier` ne retient un candidat que s'il est **seul** ou **strictement meilleur** que le suivant. En cas d'égalité, **aucun appariement**. C'est ce qui empêche d'apparier au hasard deux virements identiques du même jour — cas réel du 17/06/2025, deux virements de 22,00 €.
- [ ] Poser la nature à l'entrée des mouvements dans `src/server.ts`, et **rejouer la qualification sur l'existant** — le libellé brut est en base, l'IBAN devient disponible, rien n'est perdu.
- [ ] Rendre la nature **visible** dans l'interface, et `virement_a_verifier` **distinguable** des deux autres.
- [ ] **Vérification** : rejouer le corpus réel et **retrouver les 214**, avec la même répartition des niveaux de confiance.
- [ ] `npm test` (décompte non nul, `skipped 0`), puis `npm run lint && npm run typecheck && npm run build`.

### Critères d'acceptation
1. **Les 214 virements inter-comptes sont retrouvés sur le corpus réel**, avec la **même répartition** des trois niveaux de confiance. C'est la seule preuve qui dise que le portage n'a rien perdu. Un décompte différent est un **constat à rapporter**, jamais une assertion à ajuster.
2. Les deux virements de 22,00 € du 17/06/2025 ne sont **pas** appariés l'un à l'autre au hasard : soit chacun trouve sa vraie contre-écriture, soit aucun n'est apparié.
3. **Ce qui est préservé — le total.** La somme des soldes par compte et l'agrégat sont **identiques au centime** avant et après. Qualifier n'est pas déplacer : un virement interne reste une transaction sur chacun des deux comptes.
4. **Ce qui est préservé — le rapprochement.** `src/deduplication.ts` est **inchangé**, et les tests de T24 (appariements PDF↔API, `toReview` vide, les deux ordres) passent **sans qu'une assertion soit modifiée**.
5. **Ce qui est préservé — les données.** Aucune transaction supprimée, aucun montant modifié : `SELECT COUNT(*), SUM(amount_cents) FROM transactions` rend les mêmes valeurs avant et après.
6. Un virement dont le libellé suggère un compte personnel sans contre-écriture unique est classé **`virement_a_verifier`** et **visible comme tel** — il n'est ni compté comme dépense, ni silencieusement traité comme interne.
7. **Aucun nom de personne dans `src/`** : `grep -rinE "djabi|mohamed" src/ web/` ne rend rien.
8. `Documents/releves-pdf/` a été **commité avant** le début de la tâche. Il ne se supprime qu'**après** que ce plan soit vert — c'est l'oracle du critère 1.

---

## Recette de mise en service — après clôture du PRD, pas avant

**Posée par Lamoms le 2026-08-06.** Une seule recette sur l'état final, plutôt qu'une par tâche. Ce n'est **pas une tâche de code** : aucun fichier n'est modifié, Codex n'y intervient pas. C'est un rejeu de l'étape 4 de `.lamoms/mise-en-service.md` sur la base réelle, une fois **T22, T21, T24 et T18** fusionnées.

**Pourquoi elle est indispensable et non facultative** : trois problèmes du carnet ont leur code livré et fusionné mais **ne peuvent pas être clos par un diff** — leur clôture demande une observation. Sans cette recette, ils resteront `actif` indéfiniment, non parce que le code manque mais parce que la mesure manque. Et un critère dont la preuve n'est pas citable n'est pas VERT (règle 6, verdict relisible).

### Ce qu'elle doit observer, et ce que chaque observation clôt

| # | Observation | Ce qu'elle referme |
|---|---|---|
| 1 | **Trade Republic synchronise** — `last_sync_at` non nul, `balance_cents` renseigné, transactions en base | **P38**, et **P28** avec lui |
| 2 | Les **`balance_type`** renvoyés par La Banque Postale et Revolut, relevés en observant les synchros | **P44** — récolte gratuite, ne pas commander de spike |
| 3 | Une connexion `FAILED` repasse `AUTHORIZED` **sans intervention**, sur la base réelle et pas seulement en test | confirme **P48** sur le terrain |
| 4 | `SELECT COUNT(*) FROM transactions WHERE source='CSV_IMPORT'` **identique** avant et après le cycle | confirme le critère 2 de **T24** |
| 5 | Un relevé PDF **réimporté** sur le Livret A : aucune transaction ajoutée, solde inchangé | **P42** — la seule chose qui dise si l'incident du 2026-08-04 est refermé |
| 6 | Hors ligne sur le **vrai téléphone**, stockage vidé, une seule visite en ligne préalable | confirme **P43** et la contrainte fondatrice **P16** |
| 7 | Le volume d'aspiration de la boucle de fond sur une connexion `FAILED` jamais synchronisée | le **plafond assumé de T21** — constat seul, aucune correction attendue |

**Les points 1, 2 et 5 sont les seuls qui peuvent encore rouvrir une tâche.** Les autres sont des constats.

### Ce qu'elle n'est pas
Ni une tâche de code, ni un mécanisme de rappel. C'est une action datée de Lamoms — même nature que le rendez-vous du 2026-08-08 pour les quatre relevés manquants (P35, P38), avec lequel elle partage l'horloge.
