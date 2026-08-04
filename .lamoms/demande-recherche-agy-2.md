# Demande de recherche AGY (2) — pourquoi Trade Republic a planté, et comment nommer un compte

**Émise le** 2026-08-04 par le Planificateur, après la mise en service réelle (`.lamoms/mise-en-service.md`).
**Nature** : spike de lecture sur sessions bancaires existantes. **Aucun développement.**
**Ne remplace pas** `.lamoms/demande-recherche-agy.md` (round 1, clos) — sujet différent.

---

## Pourquoi cette demande

Deux problèmes mesurés sur la base réelle bloquent leur propre plan. Dans les deux cas je peux
nommer la ligne de code fautive, et dans les deux cas **je ne peux pas décider du correctif sans
voir la donnée que la banque envoie vraiment.** Planifier sans cette réponse serait une supposition.

| Problème | Ce qui est établi | Ce qui manque |
|---|---|---|
| **P38** | La synchro Trade Republic a levé une erreur **qui n'est pas une `EnableBankingError`** (`last_sync_error = 'SYNC_FAILED'`, `server.ts:965`) : l'API n'a **rien refusé**, c'est notre parseur qui a rejeté une réponse reçue. Le compte a été créé (`accounts.id = 2`, nom rendu par `/details`), puis `balance_cents` est resté `NULL` et **zéro** transaction écrite. | **Lequel** des `throw` maison a sauté, et **sur quelle valeur**. Le message n'existe nulle part : les quatre sites de log (`server.ts:64,128,134,561`) passent tous par `bankErrorLog`, qui ne journalise que `authorizationId`, `status`, `code` — jamais `error.message`. |
| **P39** | Les quatre comptes Revolut portent le même nom, celui du titulaire (`server.ts:782` : `account.name ?? account.product ?? "Compte bancaire"`). La colonne `type` sépare déjà le compte principal (#5, `BANK`) de ses trois pockets (`OTHER`) — **cette moitié est résolue localement, ne pas la rechercher.** | **Quel champ distingue deux pockets l'un de l'autre.** La table `accounts` (`db.ts:54`) ne stocke ni `product`, ni IBAN, ni `usage` : rien en base ne permet de trancher. |

---

## Cadre — lecture seule, sur les sessions déjà autorisées

Les trois connexions sont vivantes en base, `status = 'AUTHORIZED'`. **Aucune nouvelle
authentification forte n'est à déclencher.**

### Où lire les identifiants (ne jamais les recopier dans le dépôt)

Ce fichier est **versionné** : il ne contient aucun `uid`, aucun `session_id`, aucun IBAN.
Ils se lisent dans la base chiffrée, sur la machine :

```
base   : data/gestio.db   (SQLCipher — cipher='sqlcipher', legacy=4, puis key=…)
clé    : $GESTIO_DB_KEY   (dans .env, jamais affichée, jamais recopiée)
session: SELECT authorization_id, institution_id, session_id, status FROM bank_connections;
comptes: SELECT id, institution_id, name, type, external_uid FROM accounts WHERE external_uid IS NOT NULL;
```

Trade Republic = `institution_id 2` (compte `id 2`). Revolut = `institution_id 3` (comptes `id 3` à `6`,
dont `#5` est le principal). La Banque Postale = `institution_id 1` (compte `id 1`).

### Contraintes dures, non négociables

- **Quota, P33** : beaucoup d'ASPSP plafonnent à **4 récupérations par jour** hors présence du PSU.
  Faire **une seule passe**, capturer tout, ne jamais réessayer en boucle. Sur `HTTP 429`, s'arrêter
  et le dire — la doc est formelle, « there is no way to avoid the limit ».
- **Jamais de SCA, P12/P18** : l'URL de redirection enregistrée est `https://localhost:3443/`.
  Ne pas ouvrir de nouvelle autorisation, ne pas tenter depuis le téléphone.
- **En-têtes PSU** : l'app envoie `psu-ip-address` et `psu-user-agent` (`server.ts:958-962`).
  Les envoyer aussi, sinon l'appel n'est pas comparable à celui qui a planté.
- **Rien de réel dans le dépôt** : scripts et sorties brutes dans `.lamoms/lab/agy/` (gitignoré).
  Dans le rapport, les montants et les IBAN sont **masqués** ; les noms de champs et leur
  présence/absence, eux, sont l'objet même de la demande et se citent en clair.
- **Le consentement Trade Republic est plafonné à 90 jours** (`maximum_consent_validity = 7776000 s`,
  mesuré au round 1). Vérifier `access.valid_until` **avant** d'appeler ; s'il est expiré, s'arrêter
  et le signaler — la réponse deviendrait une autre question.

---

## Q1 — Trade Republic : lequel de nos `throw` a sauté

### Q1.0 — Le discriminant gratuit, à faire en premier

Relancer la synchro Trade Republic (`POST /enable-banking/sync/{authorizationId}`) et regarder les
logs du serveur. La ligne cherchée est `"Enable Banking synchronization page"` (`server.ts:557`).

| Observation | Conclusion |
|---|---|
| **aucune** ligne | l'erreur est dans le traitement des **transactions** → Q1.1 |
| **une** ligne, même `received: 0` | les transactions sont passées, l'erreur est sur le **solde** → Q1.2 |

Cette relance consomme **une** des quatre récupérations quotidiennes. La faire une fois, pas deux.
Faire Q1.1 et Q1.2 dans la même passe de toute façon — le discriminant sert à orienter la lecture,
pas à économiser un appel.

### Q1.1 — La page 1 des transactions, brute

`GET /accounts/{uid}/transactions?strategy=longest` sur le compte Trade Republic.
**Capturer le JSON verbatim avant tout parsage** — c'est l'objet de la demande.

Puis confronter la donnée reçue à nos validateurs, un par un. Voici **la liste exhaustive** des
rejets possibles sur ce chemin ; pour chacun, dire s'il se déclenche et sur quelle valeur :

| Ligne | Rejette quand |
|---|---|
| `server.ts:811` | `transactions` n'est pas un tableau |
| `enable-banking.ts:88` | `credit_debit_indicator` ≠ `CRDT` et ≠ `DBIT` (absent, ou autre valeur) |
| `enable-banking.ts:91` | `transaction_amount.amount` absent ou non-chaîne |
| `enable-banking.ts:98` → `isoDate` (`:151`) | `booking_date` absent, ou pas au format `AAAA-MM-JJ` |
| `enable-banking.ts:99` → `decimalCents(raw)` **non signé** (`:124`) | le montant porte un **signe** (`-22.00`) ou **plus de 2 décimales** |
| `enable-banking.ts:94` | `remittance_information` présent mais pas un tableau de chaînes |

**Piste à vérifier explicitement, pas à supposer** : `decimalCents` est appelé ici **sans** l'option
`signed`, donc un montant négatif est rejeté. Enable Banking est censé normaliser en montant positif
+ indicateur de sens, mais Trade Republic est marqué `beta = true`. Dire si le montant reçu est signé.

**Rappel — l'absence de libellé n'est PAS la cause.** `enable-banking.ts:100` retombe sur la chaîne
vide, c'est toléré. Ne pas rouvrir P25 ici.

### Q1.2 — Le solde, brut

`GET /accounts/{uid}/balances` sur le même compte. JSON verbatim, puis confronter à `parseBalance`
(`enable-banking.ts:105-122`) :

| Ligne | Rejette quand |
|---|---|
| `:108` | `balances` absent, pas un tableau, ou **tableau vide** |
| `:117` | l'entrée retenue n'a pas d'objet `balance_amount` |
| `:119` → `decimalCents(…, true)` | montant à plus de 2 décimales |
| `:120` | `balance_amount.currency` absent |

Et répondre : **quels `balance_type` Trade Republic renvoie-t-il ?** Notre priorité est
`ITAV, CLAV, CLBD, ITBD`, et tout type inconnu se retrouve **quand même sélectionné** s'il est le
seul présent (`rank` renvoie `priority.length`, il n'y a pas de rejet). Donc un type exotique n'est
pas fatal — mais il faut savoir lequel c'est pour dire si le solde retenu est le bon.

### Q1.3 — Le verdict qui décide du correctif

Une phrase, et c'est la question la plus importante du document :

> **Notre refus est-il juste, ou notre validation est-elle trop stricte ?**

- **Juste** (la donnée est réellement absente/malformée) → le correctif est de **rendre l'échec
  visible** à l'écran, pas de forcer l'ingestion.
- **Trop stricte** (la donnée est exploitable, notre validateur est trop étroit) → le correctif est
  d'**assouplir ce validateur précis**, en disant lequel et jusqu'où.

Ne pas proposer de code. Nommer la donnée et trancher entre ces deux lectures.

---

## Q2 — Nommer un compte (P39)

### Q2.1 — Les champs de `/details`, sur les quatre banques

`GET /accounts/{uid}/details` pour : le compte La Banque Postale (#1), **les quatre** comptes Revolut
(#3, #4, #5, #6), et le compte Trade Republic (#2). Pour chacun, remplir :

| Compte | `name` | `product` | `usage` | `cash_account_type` | `account_id.iban` | autres champs présents |
|---|---|---|---|---|---|---|

Valeurs en clair **sauf l'IBAN** (dire seulement s'il est présent, et s'il diffère d'un compte à
l'autre). Lister aussi tout champ non prévu ci-dessus — c'est peut-être lui, la réponse.

### Q2.2 — La question qui tranche

> **Quel champ, et lui seul, distingue le pocket #3 du pocket #4 et du pocket #6 ?**

Trois issues possibles, toutes acceptables — dire laquelle :
1. un champ les discrimine → le nommer, donner les trois valeurs
2. plusieurs les discriminent → dire lequel est le plus **lisible par un humain**
3. **aucun ne les discrimine** → le dire franchement. C'est une réponse, pas un échec : elle
   fermerait la piste API et renverrait le nommage vers la saisie manuelle.

### Q2.3 — Le garde-fou contre l'effet papillon

Avant d'envisager d'inverser la priorité `name` → `product` dans `server.ts:782` :

> **Chez La Banque Postale et Trade Republic, `product` est-il renseigné, et vaut-il mieux que `name` ?**

Si `product` y est vide ou absurde, l'inversion casse deux banques pour en réparer une. Cette
question conditionne le périmètre du plan — elle n'est pas optionnelle.

---

## Ce qu'il ne faut pas faire

- **Ne pas fabriquer de donnée** pour combler une réponse manquante (P11). Une absence de mesure se
  dit, elle ne se comble pas.
- **Ne pas conclure d'un champ absent qu'il n'existe jamais.** Trade Republic est `beta = true`,
  donc à faible trafic — c'est la réserve déjà posée en P25. Dire « absent sur CET appel », pas
  « la banque ne le fournit pas ».
- **Ne pas généraliser d'une banque à l'autre.** Revolut rend 12 champs, Trade Republic 4.
- **Ne pas corriger le code.** Ce spike lit ; le plan et le correctif viennent après, et pas d'AGY.
- **Ne pas répondre à une question voisine.** Une question sans réponse se déclare telle quelle.

## Forme du rapport attendu

Une réponse par question, dans l'ordre, avec pour chacune :

| | |
|---|---|
| **Statut** | mesuré · non trouvé · non atteignable |
| **Réponse** | courte et directe |
| **Preuve** | le script et sa sortie, dans `.lamoms/lab/agy/` |
| **Limite** | ce que cette réponse ne dit pas |

Une donnée dont la production n'est pas rejouable n'est pas une preuve — le script accompagne
chaque mesure.

## Ce que ce rapport débloque

| Réponse | Effet |
|---|---|
| **Q1.3** | décide du correctif P38 côté Trade Republic — rendre visible, ou assouplir. **La plus attendue.** |
| Q1.1 / Q1.2 | donnent la valeur exacte à citer dans les critères d'acceptation du plan |
| Q2.2 | débloque le nommage des pockets, ou le ferme franchement |
| Q2.3 | **fixe le périmètre** du plan P39 — une banque ou trois |

Indépendamment de ce rapport, P38 garde une correction qui ne dépend d'aucune réponse : les quatre
sites de log doivent porter `error.message`. C'est ce qui évitera de rejouer cette archéologie à
chaque banque ajoutée.
