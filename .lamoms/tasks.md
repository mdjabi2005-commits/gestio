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

### Intercalaire — revue de T20 (2026-08-05, sur `main` 120ee92)

T20 est fusionnée et fait ce qu'elle annonce : le vert vide est neutralisé, la capture Trade Republic est versionnée et fidèle, aucune ligne de production n'a bougé. La revue lève **deux** constats, dont aucun n'est imputable à T20 — les deux préexistaient et T20 les a rendus visibles.

| Constat | Carnet | Ce que c'est | Traité par |
|---|---|---|---|
| **F** | P52 | `GESTIO_SKIP_CORPUS=1` désactive **quatre** preuves sur données réelles et rend un `exit 0` — même famille que P47, par une autre porte. Elle a **déjà servi** à démontrer le critère 3 de l'issue #29 | **T22** |
| **G** | P49 (reste) | T20 n'a versé que le corpus **Trade Republic**. Trois autres fichiers de test lisent encore des corpus par chemin absolu hors dépôt | **T23** (CSV) / **jamais** (PDF) |

**Le corpus PDF ne sera pas versé — décision, pas oubli.** Le dépôt `mdjabi2005-commits/gestio` est **PUBLIC** ; le corpus pèse **246 Mo** et porte IBAN, adresse et titulaire sur 21 relevés réels. Le verser, ce serait publier définitivement des relevés bancaires réels — ce que `.gitignore:17-22` refuse déjà, pour la même raison, au lab AGY. `src/pdf-import.test.ts` garde donc `GESTIO_PDF_CORPUS` en **dépendance locale assumée et documentée**. Conséquence acceptée : hors du poste de Lamoms, deux tests PDF sont **rouges** — rouge et visible, jamais vert et muet.

**Ordre imposé** : **T22 → T21 → T23 → T16.** T22 passe devant parce qu'elle coûte trois lignes et referme la dernière porte du faux vert ; sur le poste de Lamoms elle ne casse rien, les corpus y sont. T21 garde son rang : c'est la seule des trois qui corrige un comportement subi par l'utilisateur. T23 est lourde (anonymisation d'un corpus croisé) et ne bloque personne — elle attend son tour.

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

**Ordre imposé** : **T22 → T21 → T24.**

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
- `web/src/main.jsx` — le gestionnaire `csv` (l. 180-187) et le formulaire « Importer un CSV » (l. 189).
- `src/pdf-import.ts` — le message d'erreur « couche texte » qui oriente vers le CSV, et l'assertion qui le vérifie (`src/pdf-import.test.ts:20`).
- **Ajouté** : un rejeu du rapprochement sur le chemin PDF, plus la mesure de P42.

### Rayon d'impact vérifié
`parseBankCsv` et `bankCsvFormats` n'ont que **deux** points d'usage hors de leur module : `server.ts:11` (import) et `server.ts:297`/`:313`. Rien d'autre dans le dépôt.
`deduplicateTransactions` a **trois** appelants : `server.ts:335` (CSV, supprimé), `:409` (PDF), `:836` (synchro). **Les deux survivants ne changent pas d'une ligne.**
`/imports/csv` n'est appelé qu'à `web/src/main.jsx:185`. Rien dans `web/public/sw.js`, rien dans `scripts/`. Les erreurs `csv_institution_mismatch`, `csv_accounts_not_separable` et `csv_format_unrecognized` ne sont produites que par cette route, et l'UI affiche leur `message` sans les nommer.
⚠️ **Le message d'erreur du chemin PDF oriente vers le CSV** : quand la couche texte manque, `src/pdf-import.ts` propose « CSV ou saisie manuelle », et `src/pdf-import.test.ts:20` l'asserte par `/couche texte.*CSV.*saisie manuelle/i`. Message et assertion doivent être réécrits **ensemble** — c'est le seul endroit du produit où la suppression laisse une phrase fausse à l'utilisateur.

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
- [ ] `src/pdf-import.ts` : le message d'erreur ne propose plus le CSV — **la saisie manuelle devient le seul repli**, et c'est assumé. Mettre à jour l'assertion de `src/pdf-import.test.ts:20` dans le même commit.
- [ ] **Remplacer `src/lab-replay.test.ts`, ne pas le supprimer sèchement.** C'est aujourd'hui la seule preuve que le rapprochement fonctionne entre deux canaux **réels**, et elle doit changer de support, pas disparaître. Le corpus le permet : les relevés BP vont du 2025-07-08 au 2026-06-08 et le corpus API La Banque Postale couvre 2026-05-04 → 2026-07-27 — le recouvrement est franc sur mai-juin 2026. Le nouveau test rejoue `parsePdfStatement("releve_CCP…_20260608")` contre le corpus API sur la fenêtre commune et vérifie qu'aucune transaction déjà connue n'est réintroduite.
- [ ] **Mesure de P42** — c'est elle qui justifie que T16 ait été fermée sans être faite. Sur le chemin PDF, **réimporter un relevé déjà importé** sur un compte **manuel** (Livret A ou Livret Jeune : aucune API, le solde **est** la somme des mouvements, donc un doublon y fausse directement le chiffre principal). Vérifier trois choses : aucune transaction ajoutée, solde inchangé, et `needs_review` posé dès que `toReview` n'est pas vide. **Si la mesure échoue, T24 s'arrête au constat** — le résultat est rapporté tel quel et la correction fait l'objet d'une tâche distincte. Ne pas corriger le chemin PDF dans cette tâche.
- [ ] Écrire en tête de `src/pdf-import.test.ts` et du nouveau test de rejeu ce que leur corpus attend et **pourquoi il n'est pas versé** (relevés réels, dépôt public). C'est ce qui transforme P49 d'un problème en une contrainte assumée.
- [ ] **Vérification** : `npm test` (décompte **non nul** — il baissera, c'est attendu : les tests du chemin supprimé partent avec lui), puis `npm run lint && npm run typecheck && npm run build`.

### Critères d'acceptation
1. `POST /imports/csv` n'existe plus et rend 404. Aucune occurrence de `parseBankCsv`, `bankCsvFormats` ou `CsvFormatError` dans `src/` ni dans `web/`.
2. **Ce qui est préservé — les données.** `SELECT COUNT(*) FROM transactions WHERE source = 'CSV_IMPORT'` rend **la même valeur avant et après** la tâche. `CSV_IMPORT` figure toujours dans `src/schema.ts:5` et dans le `CHECK` de `src/db.ts:75`. Aucune migration n'a été écrite.
3. **Ce qui est préservé — les deux chemins qui restent.** Les tests de la synchronisation API et de l'import PDF passent **sans qu'une seule de leurs assertions soit modifiée**, à la seule exception du message « couche texte ». `src/deduplication.ts` est inchangé.
4. **La preuve du rapprochement sur données réelles existe toujours**, portée par le chemin PDF↔API. Elle a changé de support, elle n'a pas disparu — un diff qui supprime `lab-replay.test.ts` sans le remplacer ne satisfait pas ce critère.
5. La mesure de P42 sur un compte manuel a été **exécutée et son résultat rapporté**, bon ou mauvais. Un rapport qui ne la mentionne pas ne vaut pas livraison.
6. Le message d'erreur du PDF sans couche texte ne propose plus le CSV, et son assertion a suivi dans le même commit.
7. `git diff --stat` montre une **suppression nette** — au moins 400 lignes de moins qu'ajoutées.
