# Powens Sandbox - profondeur transactionnelle et relevés

- Référence des routes : `C:\Users\djabi\bibliotheque\docs\core\POWENS.md` uniquement
- Sandbox uniquement ; les noms de banque et libellés de comptes retournés sont conservés pour clarifier ce rapport local, mais aucun token, secret, identifiant technique, montant ou transaction brute n'est enregistré.
- Le POST éventuel est limité à `/auth/renew` pour obtenir un token en mémoire ; aucune donnée bancaire n'est modifiée.

## Résumé

- Routes PASS: 36
- Routes BLOCKED: 0
- Routes FAIL: 0

## Routes exécutées

| Domaine | Méthode | Route | Token | Paramètres | HTTP | JSON | Résultat | Note |
|---|---|---|---|---|---:|---|---|---|
| auth | POST | `POST /auth/renew` | client_id + client_secret | grant_type; id_user; revoke_previous=false | 200 | JSON object; keys=access_token, token_type | PASS | Émission d'un token en mémoire uniquement; aucune donnée bancaire modifiée. |
| connections | GET | `GET /users/{userId}/connections (page 1)` | Authorization: Bearer <user-access-token> | userId | 200 | JSON object; keys=connections, total; arrays=connections[3] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |
| connectors | GET | `GET /connectors/{connectorUuid}` | none | connectorUuid | 200 | JSON object; keys=account_types, account_usages, auth_mechanism, available_auth_mechanisms, available_transfer_mechanisms, beta, capabilities, categories, charged, code, color, hidden, id, months_to_fetch, name, payment_settings, products, restricted, siret, slug, stability, transfer_beneficiary_types, transfer_execution_date_types, uuid; arrays=capabilities[6], available_auth_mechanisms[1], categories[0], account_types[2], account_usages[2], available_transfer_mechanisms[1], transfer_beneficiary_types[2], transfer_execution_date_types[3], products[3] | PASS | Nom du connector inspecté; aucun identifiant technique conservé. |
| connection-details | GET | `GET /users/{userId}/connections/{connectionId}` | Authorization: Bearer <user-access-token> | userId; connectionId | 200 | JSON object; keys=active, connector_uuid, created, error, error_message, expire, id, id_bank, id_connector, id_user, last_push, last_update, next_try, state | PASS | État et métadonnées de synchronisation inspectés; identifiant technique non conservé. |
| connection-logs | GET | `GET /users/{userId}/connections/{connectionId}/logs?limit=100 (page 1)` | Authorization: Bearer <user-access-token> | userId; connectionId; limit facultatif | 200 | JSON object; keys=connectionlogs, first_date, last_date, total; arrays=connectionlogs[2] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |
| connectors | GET | `GET /connectors/{connectorUuid}` | none | connectorUuid | 200 | JSON object; keys=account_types, account_usages, auth_mechanism, available_auth_mechanisms, available_transfer_mechanisms, beta, capabilities, categories, charged, code, color, documents_type, hidden, id, months_to_fetch, name, payment_settings, products, restricted, siret, slug, stability, transfer_beneficiary_types, transfer_execution_date_types, uuid; arrays=capabilities[8], available_auth_mechanisms[2], categories[0], account_types[10], account_usages[2], available_transfer_mechanisms[1], transfer_beneficiary_types[1], transfer_execution_date_types[4], documents_type[2], products[3] | PASS | Nom du connector inspecté; aucun identifiant technique conservé. |
| connection-details | GET | `GET /users/{userId}/connections/{connectionId}` | Authorization: Bearer <user-access-token> | userId; connectionId | 200 | JSON object; keys=active, connector_uuid, created, error, error_message, expire, id, id_bank, id_connector, id_provider, id_user, last_push, last_update, next_try, state | PASS | État et métadonnées de synchronisation inspectés; identifiant technique non conservé. |
| connection-logs | GET | `GET /users/{userId}/connections/{connectionId}/logs?limit=100 (page 1)` | Authorization: Bearer <user-access-token> | userId; connectionId; limit facultatif | 200 | JSON object; keys=connectionlogs, first_date, last_date, total; arrays=connectionlogs[3] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |
| connectors | GET | `GET /connectors/{connectorUuid}` | none | connectorUuid | 200 | JSON object; keys=account_types, account_usages, auth_mechanism, available_auth_mechanisms, beta, capabilities, categories, charged, code, color, hidden, id, months_to_fetch, name, products, restricted, siret, slug, stability, uuid; arrays=capabilities[3], available_auth_mechanisms[1], categories[0], account_types[3], account_usages[0], products[2] | PASS | Nom du connector inspecté; aucun identifiant technique conservé. |
| connection-details | GET | `GET /users/{userId}/connections/{connectionId}` | Authorization: Bearer <user-access-token> | userId; connectionId | 200 | JSON object; keys=active, connector_uuid, created, error, error_message, expire, id, id_bank, id_connector, id_user, last_push, last_update, next_try, state | PASS | État et métadonnées de synchronisation inspectés; identifiant technique non conservé. |
| connection-logs | GET | `GET /users/{userId}/connections/{connectionId}/logs?limit=100 (page 1)` | Authorization: Bearer <user-access-token> | userId; connectionId; limit facultatif | 200 | JSON object; keys=connectionlogs, first_date, last_date, total; arrays=connectionlogs[3] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |
| accounts | GET | `GET /users/{userId}/accounts (page 1)` | Authorization: Bearer <user-access-token> | userId; all facultatif | 200 | JSON object; keys=accounts, balance, balances, coming_balances, total; arrays=accounts[10] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |
| account-details | GET | `GET /users/{userId}/accounts/{accountId}` | Authorization: Bearer <user-access-token> | userId; accountId | 200 | JSON object; keys=balance, bic, bookmarked, coming, coming_balance, company_name, currency, deleted, disabled, display, error, formatted_balance, iban, id, id_connection, id_parent, id_source, id_type, id_user, information, last_update, loan, name, number, opening_date, original_name, ownership, type, usage, webid | PASS | Métadonnées du compte inspectées; identifiant technique non conservé. |
| transactions | GET | `GET /users/{userId}/accounts/{accountId}/transactions?limit=1000&filter=date&min_date=1900-01-01&max_date=2100-01-01 (page 1)` | Authorization: Bearer <user-access-token> | userId; accountId; limit obligatoire; min_date/max_date facultatifs | 200 | JSON object; keys=_links, first_date, last_date, result_max_date, result_min_date, total, transactions; arrays=transactions[249] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |
| account-details | GET | `GET /users/{userId}/accounts/{accountId}` | Authorization: Bearer <user-access-token> | userId; accountId | 200 | JSON object; keys=balance, bic, bookmarked, coming, coming_balance, company_name, currency, deleted, disabled, display, error, formatted_balance, iban, id, id_connection, id_parent, id_source, id_type, id_user, information, last_update, loan, name, number, opening_date, original_name, ownership, type, usage, webid | PASS | Métadonnées du compte inspectées; identifiant technique non conservé. |
| transactions | GET | `GET /users/{userId}/accounts/{accountId}/transactions?limit=1000&filter=date&min_date=1900-01-01&max_date=2100-01-01 (page 1)` | Authorization: Bearer <user-access-token> | userId; accountId; limit obligatoire; min_date/max_date facultatifs | 200 | JSON object; keys=_links, first_date, last_date, result_max_date, result_min_date, total, transactions; arrays=transactions[49] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |
| account-details | GET | `GET /users/{userId}/accounts/{accountId}` | Authorization: Bearer <user-access-token> | userId; accountId | 200 | JSON object; keys=balance, bic, bookmarked, coming, coming_balance, company_name, currency, deleted, disabled, display, error, formatted_balance, iban, id, id_connection, id_parent, id_source, id_type, id_user, information, last_update, loan, name, number, opening_date, original_name, ownership, type, usage, webid | PASS | Métadonnées du compte inspectées; identifiant technique non conservé. |
| transactions | GET | `GET /users/{userId}/accounts/{accountId}/transactions?limit=1000&filter=date&min_date=1900-01-01&max_date=2100-01-01 (page 1)` | Authorization: Bearer <user-access-token> | userId; accountId; limit obligatoire; min_date/max_date facultatifs | 200 | JSON object; keys=_links, first_date, last_date, result_max_date, result_min_date, total, transactions; arrays=transactions[36] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |
| account-details | GET | `GET /users/{userId}/accounts/{accountId}` | Authorization: Bearer <user-access-token> | userId; accountId | 200 | JSON object; keys=balance, bic, bookmarked, coming, coming_balance, company_name, currency, deleted, disabled, display, error, formatted_balance, iban, id, id_connection, id_parent, id_source, id_type, id_user, information, last_update, loan, name, number, opening_date, original_name, ownership, type, usage, webid | PASS | Métadonnées du compte inspectées; identifiant technique non conservé. |
| transactions | GET | `GET /users/{userId}/accounts/{accountId}/transactions?limit=1000&filter=date&min_date=1900-01-01&max_date=2100-01-01 (page 1)` | Authorization: Bearer <user-access-token> | userId; accountId; limit obligatoire; min_date/max_date facultatifs | 200 | JSON object; keys=_links, first_date, last_date, result_max_date, result_min_date, total, transactions; arrays=transactions[17] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |
| account-details | GET | `GET /users/{userId}/accounts/{accountId}` | Authorization: Bearer <user-access-token> | userId; accountId | 200 | JSON object; keys=balance, bic, bookmarked, coming, coming_balance, company_name, currency, deleted, disabled, display, error, formatted_balance, iban, id, id_connection, id_parent, id_source, id_type, id_user, information, last_update, loan, name, number, opening_date, original_name, ownership, type, usage, webid | PASS | Métadonnées du compte inspectées; identifiant technique non conservé. |
| transactions | GET | `GET /users/{userId}/accounts/{accountId}/transactions?limit=1000&filter=date&min_date=1900-01-01&max_date=2100-01-01 (page 1)` | Authorization: Bearer <user-access-token> | userId; accountId; limit obligatoire; min_date/max_date facultatifs | 200 | JSON object; keys=_links, first_date, last_date, result_max_date, result_min_date, total, transactions; arrays=transactions[63] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |
| account-details | GET | `GET /users/{userId}/accounts/{accountId}` | Authorization: Bearer <user-access-token> | userId; accountId | 200 | JSON object; keys=balance, bic, bookmarked, coming, coming_balance, company_name, currency, deleted, disabled, display, error, formatted_balance, iban, id, id_connection, id_parent, id_source, id_type, id_user, information, last_update, loan, name, number, opening_date, original_name, ownership, type, usage, webid | PASS | Métadonnées du compte inspectées; identifiant technique non conservé. |
| transactions | GET | `GET /users/{userId}/accounts/{accountId}/transactions?limit=1000&filter=date&min_date=1900-01-01&max_date=2100-01-01 (page 1)` | Authorization: Bearer <user-access-token> | userId; accountId; limit obligatoire; min_date/max_date facultatifs | 200 | JSON object; keys=_links, first_date, last_date, result_max_date, result_min_date, total, transactions; arrays=transactions[52] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |
| account-details | GET | `GET /users/{userId}/accounts/{accountId}` | Authorization: Bearer <user-access-token> | userId; accountId | 200 | JSON object; keys=balance, bic, bookmarked, coming, coming_balance, company_name, currency, deleted, disabled, display, error, formatted_balance, iban, id, id_connection, id_parent, id_source, id_type, id_user, information, last_update, loan, name, number, opening_date, original_name, ownership, type, usage, webid | PASS | Métadonnées du compte inspectées; identifiant technique non conservé. |
| transactions | GET | `GET /users/{userId}/accounts/{accountId}/transactions?limit=1000&filter=date&min_date=1900-01-01&max_date=2100-01-01 (page 1)` | Authorization: Bearer <user-access-token> | userId; accountId; limit obligatoire; min_date/max_date facultatifs | 200 | JSON object; keys=_links, first_date, last_date, result_max_date, result_min_date, total, transactions; arrays=transactions[6] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |
| account-details | GET | `GET /users/{userId}/accounts/{accountId}` | Authorization: Bearer <user-access-token> | userId; accountId | 200 | JSON object; keys=balance, bic, bookmarked, calculated, coming, coming_balance, company_name, currency, deleted, diff, diff_percent, disabled, display, error, formatted_balance, iban, id, id_connection, id_parent, id_source, id_type, id_user, information, last_update, loan, name, number, opening_date, original_name, ownership, prev_diff, prev_diff_percent, type, usage, valuation, webid; arrays=calculated[5] | PASS | Métadonnées du compte inspectées; identifiant technique non conservé. |
| transactions | GET | `GET /users/{userId}/accounts/{accountId}/transactions?limit=1000&filter=date&min_date=1900-01-01&max_date=2100-01-01 (page 1)` | Authorization: Bearer <user-access-token> | userId; accountId; limit obligatoire; min_date/max_date facultatifs | 200 | JSON object; keys=_links, first_date, last_date, result_max_date, result_min_date, total, transactions; arrays=transactions[34] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |
| account-details | GET | `GET /users/{userId}/accounts/{accountId}` | Authorization: Bearer <user-access-token> | userId; accountId | 200 | JSON object; keys=balance, bic, bookmarked, calculated, coming, coming_balance, company_name, currency, deleted, diff, diff_percent, disabled, display, error, formatted_balance, iban, id, id_connection, id_parent, id_source, id_type, id_user, information, last_update, loan, name, number, opening_date, original_name, ownership, prev_diff, prev_diff_percent, type, usage, valuation, webid; arrays=calculated[5] | PASS | Métadonnées du compte inspectées; identifiant technique non conservé. |
| transactions | GET | `GET /users/{userId}/accounts/{accountId}/transactions?limit=1000&filter=date&min_date=1900-01-01&max_date=2100-01-01 (page 1)` | Authorization: Bearer <user-access-token> | userId; accountId; limit obligatoire; min_date/max_date facultatifs | 200 | JSON object; keys=_links, first_date, last_date, result_max_date, result_min_date, total, transactions; arrays=transactions[117] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |
| account-details | GET | `GET /users/{userId}/accounts/{accountId}` | Authorization: Bearer <user-access-token> | userId; accountId | 200 | JSON object; keys=balance, bic, bookmarked, coming, coming_balance, company_name, currency, deleted, disabled, display, error, formatted_balance, iban, id, id_connection, id_parent, id_source, id_type, id_user, information, last_update, loan, name, number, opening_date, original_name, ownership, type, usage, webid | PASS | Métadonnées du compte inspectées; identifiant technique non conservé. |
| transactions | GET | `GET /users/{userId}/accounts/{accountId}/transactions?limit=1000&filter=date&min_date=1900-01-01&max_date=2100-01-01 (page 1)` | Authorization: Bearer <user-access-token> | userId; accountId; limit obligatoire; min_date/max_date facultatifs | 200 | JSON object; keys=_links, first_date, last_date, result_max_date, result_min_date, total, transactions; arrays=transactions[516] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |
| transactions | GET | `GET /users/{userId}/transactions?limit=1000&filter=date&min_date=1900-01-01&max_date=2100-01-01 (page 1)` | Authorization: Bearer <user-access-token> | userId; limit obligatoire; min_date/max_date facultatifs | 200 | JSON object; keys=_links, first_date, last_date, result_max_date, result_min_date, total, transactions; arrays=transactions[1000] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |
| transactions | GET | `GET /users/{userId}/transactions?limit=1000&filter=date&min_date=1900-01-01&max_date=2100-01-01 (page 2)` | Authorization: Bearer <user-access-token> | userId; limit obligatoire; min_date/max_date facultatifs | 200 | JSON object; keys=_links, first_date, last_date, result_max_date, result_min_date, total, transactions; arrays=transactions[139] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |
| subscriptions | GET | `GET /users/{userId}/subscriptions?all (page 1)` | Authorization: Bearer <user-access-token> | userId; all facultatif | 200 | JSON object; keys=subscriptions, total; arrays=subscriptions[3] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |
| documents | GET | `GET /users/{userId}/documents?limit=1000 (page 1)` | Authorization: Bearer <user-access-token> | userId; limit obligatoire (maximum 1000) | 200 | JSON object; keys=documents, first_date, last_date, total; arrays=documents[0] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |

## Diagnostic des connexions

- Les dates sont réduites au mois ; les identifiants techniques et messages bancaires bruts ne sont pas conservés.
| Connexion / banque | months_to_fetch connector | État | Erreur | Créée | Dernière mise à jour | Dernier push | Logs lus |
|---|---:|---|---|---|---|---|---:|
| Revolut |  | UNKNOWN | NONE | 2026-09 | 2026-09 | UNKNOWN | 2 |
| La Banque Postale | 3 | UNKNOWN | NONE | 2026-09 | 2026-09 | UNKNOWN | 3 |
| Trade Republic |  | UNKNOWN | NONE | 2026-09 | 2026-09 | UNKNOWN | 3 |

## Synthèse par connexion

- La connexion/banque et le nom de compte sont affichés lorsqu'ils sont présents dans les réponses Powens ; sinon le probe conserve un libellé générique.
- `USER_AGGREGATE` est la vue de tous les comptes et ne constitue pas une quatrième connexion.
- `YES` dans la colonne « au moins un » ne signifie pas que tous les comptes de la connexion ont cette profondeur.
- `usage` est affiché lorsqu'il est renvoyé par Powens ; les catégories de produit comme compte courant ou Livret A ne sont pas inventées.
- Le détail de connexion, les logs de synchronisation et le détail de chaque compte sont lus sans modifier ni resynchroniser les données.

| Connexion / banque | months_to_fetch connector | Comptes | Mois minimum | Mois maximum | Comptes >=12 mois | Au moins un >=12 | Tous >=12 | Comptes >=24 mois |
|---|---:|---:|---:|---:|---:|---|---|---:|
| La Banque Postale | 3 | 3 | 1 | 16 | 1 | YES | NO | 0 |
| Revolut |  | 4 | 7 | 19 | 2 | YES | NO | 0 |
| Trade Republic |  | 3 | 10 | 37 | 2 | YES | NO | 1 |

## Profondeur transactionnelle observée

- Les mois sont calculés localement à partir des dates reçues ; les dates exactes, libellés, montants et identifiants ne sont pas conservés.
- `YES` signifie une amplitude calendaire inclusive d'au moins 24 mois, pas une garantie d'exhaustivité bancaire.

| Compte | Connexion / banque | Nom du compte | Type API | Usage Powens | Ouverture API | Dernière mise à jour | Transactions | Dates interprétées | Premier mois | Dernier mois | Mois couverts | >=24 mois |
|---|---|---|---|---|---|---|---:|---:|---|---|---:|---|
| ACCOUNT_01 | Revolut | Revolut Current EUR | checking | PRIV | UNKNOWN | 2026-09 | 249 | 249 | 2025-03 | 2026-09 | 19 | NO |
| ACCOUNT_02 | Revolut | Revolut Current EUR | checking | PRIV | UNKNOWN | 2026-09 | 49 | 49 | 2025-09 | 2026-09 | 13 | NO |
| ACCOUNT_03 | Revolut | Revolut Current EUR | checking | PRIV | UNKNOWN | 2026-09 | 36 | 36 | 2025-07 | 2026-03 | 9 | NO |
| ACCOUNT_04 | Revolut | Revolut Current EUR | checking | PRIV | UNKNOWN | 2026-09 | 17 | 17 | 2026-02 | 2026-08 | 7 | NO |
| ACCOUNT_05 | La Banque Postale | MR DJABI MOHAMED | checking | PRIV | UNKNOWN | 2026-09 | 63 | 63 | 2026-06 | 2026-09 | 4 | NO |
| ACCOUNT_06 | La Banque Postale | Livret A | savings | PRIV | UNKNOWN | 2026-09 | 52 | 52 | 2025-06 | 2026-09 | 16 | NO |
| ACCOUNT_07 | La Banque Postale | Livret Jeune | savings | PRIV | UNKNOWN | 2026-09 | 6 | 6 | 2025-12 | 2025-12 | 1 | NO |
| ACCOUNT_08 | Trade Republic | Trade Republic PEA | pea | UNKNOWN | UNKNOWN | 2026-09 | 34 | 34 | 2025-07 | 2026-04 | 10 | NO |
| ACCOUNT_09 | Trade Republic | Trade Republic Portfolio | market | UNKNOWN | UNKNOWN | 2026-09 | 117 | 117 | 2025-02 | 2026-08 | 19 | NO |
| ACCOUNT_10 | Trade Republic | Trade Republic Cash | checking | UNKNOWN | UNKNOWN | 2026-09 | 516 | 516 | 2023-08 | 2026-08 | 37 | YES |
| USER_AGGREGATE | ALL_CONNECTIONS | ALL_ACCOUNTS | N/A | N/A | N/A | N/A | 1139 | 1139 | 2023-08 | 2026-09 | 38 | YES |

## Relevés et documents fournisseur

- Cette section ne télécharge aucun fichier. Elle vérifie seulement les documents retournés et les indicateurs de fichier/lien présents dans les réponses.

| Route | Documents | Type statement détecté | Indicateur fichier site | ID fichier | URL/lien | Premier mois | Dernier mois |
|---|---:|---:|---:|---:|---:|---|---|
| GET /users/{userId}/documents | 0 | 0 | 0 | 0 | 0 |  |  |

## Limites

- Une collection vide ne prouve pas que la banque ne possède aucun historique ; elle prouve seulement que Powens n'a rien retourné dans ce contexte Sandbox.
- L'absence d'un indicateur fichier ne prouve pas l'absence d'un PDF si le fournisseur expose uniquement un espace bancaire en ligne.
- Aucun téléchargement de relevé n'est effectué automatiquement.

## Blocages précis

- Aucun blocage HTTP ni échec client sur les routes exécutées.
- Les détails de connexion ont répondu, mais certaines métadonnées d'état ou de date sont absentes (`UNKNOWN`) ; elles ne permettent pas de conclure sur la santé de la connexion ni sur l'âge du compte.
- La date d'ouverture API est absente pour au moins un compte ; une profondeur observée de quelques mois ne peut donc pas être attribuée automatiquement à une création récente du compte.
- `months_to_fetch` est reporté comme indice de configuration du connector uniquement ; il n'est pas interprété comme une borne, car la preuve retenue est l'amplitude des transactions réellement retournées.
- La route Documents a répondu sans document ; cela bloque seulement la preuve d'un relevé statement ou d'un fichier/lien dans ce contexte Sandbox, pas l'existence de tels éléments chez la banque.

## Commande de relance

```powershell
& .\tools\powens-sandbox\powens-history-depth.ps1
```
