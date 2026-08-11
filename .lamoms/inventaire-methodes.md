# Gestio — inventaire des méthodes, état au 2026-08-11

Relevé dans le code à `d5c054a`, jamais recopié d'un document.
**18 routes HTTP** (7 `GET`, 10 `POST`, 1 `DELETE`, aucun `PUT`, aucun `PATCH`), 7 endpoints Enable Banking appelés, 34 fonctions exportées, 15 points d'appel côté navigateur.

> Ce fichier **remplace** la table des endpoints de `.lamoms/ui-reference.md`, qui repérait par numéro de ligne et se trompait sur cinq entrées (`DELETE /transactions/:id`, les deux routes `enable-banking`, `GET /sw.js` qui n'est pas une route). Les repères ci-dessous sont des symboles ; les numéros de ligne ne valent qu'au 2026-08-11.

## 1. API HTTP — `src/server.ts`

### Publiques (traversent le hook d'authentification, `PUBLIC_PATHS`)

| Méthode | Chemin | Entrée | Sortie et codes |
|---|---|---|---|
| `GET` | `/` | rien, ou `?code=&state=` | sans query : sert `index.html`. Avec les deux : callback bancaire — échange le code (`POST /sessions`), lit `access.valid_until`, passe la connexion en `AUTHORIZED`, lance la 1re synchro. `400` retour incomplet ou connexion inconnue/déjà utilisée, `502` finalisation impossible |
| `GET` | `/auth/state` | rien | `{ configured: bool }` |
| `POST` | `/auth/setup` | `{ password }` 12–1024 car. | `204` + cookie de session ; `409 auth_already_configured`, vérifié deux fois (`SELECT` puis `INSERT OR IGNORE`) |
| `POST` | `/auth/login` | `{ password }` | `204` + cookie ; `401 invalid_credentials` (argon2id) |
| — | `/sw.js`, `/assets/*` | — | servis par `fastify-static` depuis `dist/web`, pas par une route déclarée |

### Protégées — cookie de session obligatoire, sinon `401 unauthorized`

| Méthode | Chemin | Entrée | Sortie et codes |
|---|---|---|---|
| `POST` | `/auth/logout` | rien | supprime la session, cookie `Max-Age=0` ; `204` |
| `POST` | `/institutions` | `{ name, country }` | `201` — upsert, unicité `(name, country)` |
| `GET` | `/institutions` | rien | liste complète |
| `POST` | `/accounts` | `{ name, type ∈ BANK\|LIVRET_A\|OTHER, institutionId?, iban? }` | `201` ; `404 institution_not_found` ; IBAN normalisé à l'entrée |
| `GET` | `/accounts` | rien | liste complète — **aucun appelant dans l'interface**, qui lit `balance.accounts` |
| `POST` | `/transactions` | mouvement manuel | `201` créé, `200` si déjà présent (`ON CONFLICT (fingerprint, occurrence) DO NOTHING`, idempotent) ; `404 account_not_found` ; requalifie après insertion |
| `GET` | `/transactions` | `?accountId`, `?needsReview`, `?limit` 1–500 (déf. 100), `?offset` | `{ transactions, limit, offset }`, tri `transaction_date DESC, id DESC` ; `400` hors bornes |
| `POST` | `/transactions/resolve` | `{ transactionId }` | marque tout le groupe (compte + date + montant) résolu → `{ resolved: n }` ; `404` ; `409 transaction_group_not_ambiguous` |
| `DELETE` | `/transactions/:id` | — | `204` ; `404` ; `409 transaction_group_not_ambiguous` ; `409 transaction_group_api` — un groupe 100 % API ne se supprime pas à la main |
| `POST` | `/imports/pdf` | `{ pdfBase64, accountIds: { clé → id } }` | `400 pdf_format_unrecognized` ; exige une correspondance pour chaque compte du relevé et des ids distincts ; transaction SQL atomique ; dédoublonne contre l'existant ; met à jour IBAN, `known_since` (ne recule jamais) et le solde (jamais sur un compte API, seulement si plus récent) ; requalifie → `{ institution, imported, duplicates, balancesImported, reviewNeeded, excludedProducts? }` |
| `GET` | `/balance` | rien | `{ totalCents, unknownBalanceCount, accounts[], institutions[] }` ; solde = `balance_cents` si compte API, sinon `COALESCE(balance_cents, SUM(mouvements), 0)` |
| `POST` | `/enable-banking/connect` | `{ name, country }` | lit `maximum_consent_validity` de la banque, demande `valid_until = plafond − 60 s`, `state` aléatoire 24 octets → `201 { authorizationId, url, status: "PENDING" }` ; `404 aspsp_not_found` |
| `GET` | `/enable-banking/status/:authorizationId` | — | `{ authorizationId, status, consentValidUntil, lastSyncedAt, lastSyncError }` ; `EXPIRED` calculé à la volée si le consentement est dépassé ; `404 bank_connection_not_found` |
| `POST` | `/enable-banking/sync/:authorizationId` | — | relance ; 1er passage `strategy: "longest"`, ensuite `"default"` ; en-têtes PSU repris de la requête ; erreur enregistrée **et** renvoyée avec la dernière synchro connue ; `404` |

## 2. API sortante — Enable Banking

| Méthode | Endpoint | Quand, et pourquoi |
|---|---|---|
| `GET` | `/aspsps?country=` | catalogue, pour lire `maximum_consent_validity` de la banque visée |
| `POST` | `/auth` | demande d'autorisation, `psu_type: personal`, `redirect_url` d'environnement |
| `POST` | `/sessions` | échange du `code` du callback |
| `GET` | `/sessions/{id}` | `access.valid_until` à la connexion, puis revalidation à chaque synchro |
| `GET` | `/accounts/{uid}/details` | nom lisible du compte (T17) |
| `GET` | `/accounts/{uid}/transactions` | mouvements paginés par `continuation_key`, garde-fou à 1000 pages, `strategy` selon 1re synchro ou non |
| `GET` | `/accounts/{uid}/balances` | solde, priorité `ITAV > CLAV > CLBD > ITBD`, erreur explicite si aucun type connu |

## 3. Fonctions exportées

| Module | Fonctions |
|---|---|
| `db.ts` | `openDatabase` (+ type `AppDatabase`) ; internes `migrate`, `addColumn` |
| `schema.ts` | `institutions`, `accounts`, `transactions`, `accountTypes`, `transactionSources`, `transactionNatures` |
| `qualification.ts` | `normalizeIban`, `extractIbans`, `qualifyTransactions`, `requalifyTransactions` |
| `deduplication.ts` | `deduplicateTransactions`, `signedAmountCents`, `normalizeTransactionLabel` |
| `pdf-import.ts` | `parsePdfStatement`, `verifyTradeRepublicTotals`, `tradeRepublicIsoDate`, `PdfStatementError` |
| `enable-banking.ts` | `EnableBankingClient`, `enableBankingFromEnvironment`, `parseBankTransaction`, `parseBalance`, `decimalCents`, `EnableBankingError` |
| `ui-logic.ts` | `groupAccountsByInstitution`, `oldestUpdatedAt`, `missingUpdatedAtCount`, `knownSinceLabel`, `reviewGroups`, `visibleTransactionLabel`, `transactionNatureLabel` |
| `tls.ts` | `localHttpsOptions` |
| `server.ts` | `buildApp`, `syncedAccountNames` |

Internes notables de `server.ts` : `syncBankConnection`, `recordBankError`, `bankConnection`, `bankConnectionByState`, `upsertInstitution`, `manualInstitutionId`, `transactionGroup`, `setSession`, `psuHeaders`, et les validateurs `readAccountInput`, `readInstitutionInput`, `readBankConnectionInput`, `readTransactionInput`, `readPassword`, `requiredInteger`, `requiredBase64`, `countryCode`, `oneOf`.

## 4. Côté navigateur — `web/src/main.jsx`

`GET /auth/state` · `GET /balance` · `POST /auth/setup` ou `/auth/login` selon le mode · `POST /auth/logout` · `GET /institutions` · `POST /institutions` · `POST /accounts` · `POST /transactions` · `GET /transactions` · `GET /transactions?needsReview=true&limit=100&offset=` · `POST /transactions/resolve` · `DELETE /transactions/{id}` · `POST /imports/pdf` · `POST /enable-banking/connect` · `GET /enable-banking/status/{id}` · `POST /enable-banking/sync/{id}`.

Les 7 clés de relevé de l'interface (`pdfAccountKeys`) correspondent exactement au type `PdfAccountKey` du backend : `CCP`, `LIVRET_A`, `LIVRET_JEUNE`, `NICKEL`, `TRADE_REPUBLIC`, `TRADE_REPUBLIC_PEA`, `TRADE_REPUBLIC_PEA_2`. La liste est dupliquée des deux côtés, sans source unique.

**Service worker** (`web/public/sw.js`), 3 écouteurs : `install` précharge la coque hachée puis `skipWaiting()` ; `activate` purge tout cache dont le nom diffère puis `clients.claim()` ; `fetch` ignore ce qui n'est pas un `GET` de même origine sans query et de destination `document`/`script`/`style`, applique réseau d'abord, replie sur le cache, puis sur `/`, puis sur un `503` en français.

**Tâches de fond** : `setInterval(runBackgroundSync, 6 h)` non réentrante et `unref()` — soit 4 passes par jour, la limite Enable Banking hors présence du titulaire ; hook `onClose` qui purge l'intervalle et ferme la base ; hook `onRequest` qui garde toutes les routes non publiques.

## 5. Ce que la surface rend visible

Aucun `PUT`, aucun `PATCH`, un seul `DELETE`. **L'API est en création et lecture seule.** On ne peut ni renommer ou corriger un compte, ni supprimer un compte ou un établissement, ni corriger la `nature` posée par la machine, ni lister ou révoquer une connexion bancaire, ni filtrer les transactions par période. Le seul geste correctif offert porte sur un doublon ambigu, et jamais sur un groupe entièrement issu de l'API.

Les 606 décisions de qualification n'ont **aucune méthode HTTP** qui permette d'en contester une seule. `GET /accounts` est la seule route sans consommateur.
