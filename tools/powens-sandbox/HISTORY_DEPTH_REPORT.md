# Powens Sandbox - profondeur transactionnelle et relevés

- Référence des routes : `C:\Users\djabi\bibliotheque\docs\core\POWENS.md` uniquement
- Sandbox uniquement ; aucune donnée bancaire brute, aucun secret, aucun identifiant n'est enregistré.
- Le POST éventuel est limité à `/auth/renew` pour obtenir un token en mémoire ; aucune donnée bancaire n'est modifiée.

## Résumé

- Routes PASS: 17
- Routes BLOCKED: 0
- Routes FAIL: 0

## Routes exécutées

| Domaine | Méthode | Route | Token | Paramètres | HTTP | JSON | Résultat | Note |
|---|---|---|---|---|---:|---|---|---|
| auth | POST | `POST /auth/renew` | client_id + client_secret | grant_type; id_user; revoke_previous=false | 200 | JSON object; keys=access_token, token_type | PASS | Émission d'un token en mémoire uniquement; aucune donnée bancaire modifiée. |
| connections | GET | `GET /users/{userId}/connections (page 1)` | Authorization: Bearer <user-access-token> | userId | 200 | JSON object; keys=connections, total; arrays=connections[3] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |
| accounts | GET | `GET /users/{userId}/accounts (page 1)` | Authorization: Bearer <user-access-token> | userId; all facultatif | 200 | JSON object; keys=accounts, balance, balances, coming_balances, total; arrays=accounts[10] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |
| transactions | GET | `GET /users/{userId}/accounts/{accountId}/transactions?limit=1000&filter=date&min_date=1900-01-01&max_date=2100-01-01 (page 1)` | Authorization: Bearer <user-access-token> | userId; accountId; limit obligatoire; min_date/max_date facultatifs | 200 | JSON object; keys=_links, first_date, last_date, result_max_date, result_min_date, total, transactions; arrays=transactions[249] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |
| transactions | GET | `GET /users/{userId}/accounts/{accountId}/transactions?limit=1000&filter=date&min_date=1900-01-01&max_date=2100-01-01 (page 1)` | Authorization: Bearer <user-access-token> | userId; accountId; limit obligatoire; min_date/max_date facultatifs | 200 | JSON object; keys=_links, first_date, last_date, result_max_date, result_min_date, total, transactions; arrays=transactions[49] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |
| transactions | GET | `GET /users/{userId}/accounts/{accountId}/transactions?limit=1000&filter=date&min_date=1900-01-01&max_date=2100-01-01 (page 1)` | Authorization: Bearer <user-access-token> | userId; accountId; limit obligatoire; min_date/max_date facultatifs | 200 | JSON object; keys=_links, first_date, last_date, result_max_date, result_min_date, total, transactions; arrays=transactions[36] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |
| transactions | GET | `GET /users/{userId}/accounts/{accountId}/transactions?limit=1000&filter=date&min_date=1900-01-01&max_date=2100-01-01 (page 1)` | Authorization: Bearer <user-access-token> | userId; accountId; limit obligatoire; min_date/max_date facultatifs | 200 | JSON object; keys=_links, first_date, last_date, result_max_date, result_min_date, total, transactions; arrays=transactions[17] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |
| transactions | GET | `GET /users/{userId}/accounts/{accountId}/transactions?limit=1000&filter=date&min_date=1900-01-01&max_date=2100-01-01 (page 1)` | Authorization: Bearer <user-access-token> | userId; accountId; limit obligatoire; min_date/max_date facultatifs | 200 | JSON object; keys=_links, first_date, last_date, result_max_date, result_min_date, total, transactions; arrays=transactions[63] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |
| transactions | GET | `GET /users/{userId}/accounts/{accountId}/transactions?limit=1000&filter=date&min_date=1900-01-01&max_date=2100-01-01 (page 1)` | Authorization: Bearer <user-access-token> | userId; accountId; limit obligatoire; min_date/max_date facultatifs | 200 | JSON object; keys=_links, first_date, last_date, result_max_date, result_min_date, total, transactions; arrays=transactions[52] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |
| transactions | GET | `GET /users/{userId}/accounts/{accountId}/transactions?limit=1000&filter=date&min_date=1900-01-01&max_date=2100-01-01 (page 1)` | Authorization: Bearer <user-access-token> | userId; accountId; limit obligatoire; min_date/max_date facultatifs | 200 | JSON object; keys=_links, first_date, last_date, result_max_date, result_min_date, total, transactions; arrays=transactions[6] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |
| transactions | GET | `GET /users/{userId}/accounts/{accountId}/transactions?limit=1000&filter=date&min_date=1900-01-01&max_date=2100-01-01 (page 1)` | Authorization: Bearer <user-access-token> | userId; accountId; limit obligatoire; min_date/max_date facultatifs | 200 | JSON object; keys=_links, first_date, last_date, result_max_date, result_min_date, total, transactions; arrays=transactions[34] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |
| transactions | GET | `GET /users/{userId}/accounts/{accountId}/transactions?limit=1000&filter=date&min_date=1900-01-01&max_date=2100-01-01 (page 1)` | Authorization: Bearer <user-access-token> | userId; accountId; limit obligatoire; min_date/max_date facultatifs | 200 | JSON object; keys=_links, first_date, last_date, result_max_date, result_min_date, total, transactions; arrays=transactions[117] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |
| transactions | GET | `GET /users/{userId}/accounts/{accountId}/transactions?limit=1000&filter=date&min_date=1900-01-01&max_date=2100-01-01 (page 1)` | Authorization: Bearer <user-access-token> | userId; accountId; limit obligatoire; min_date/max_date facultatifs | 200 | JSON object; keys=_links, first_date, last_date, result_max_date, result_min_date, total, transactions; arrays=transactions[516] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |
| transactions | GET | `GET /users/{userId}/transactions?limit=1000&filter=date&min_date=1900-01-01&max_date=2100-01-01 (page 1)` | Authorization: Bearer <user-access-token> | userId; limit obligatoire; min_date/max_date facultatifs | 200 | JSON object; keys=_links, first_date, last_date, result_max_date, result_min_date, total, transactions; arrays=transactions[1000] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |
| transactions | GET | `GET /users/{userId}/transactions?limit=1000&filter=date&min_date=1900-01-01&max_date=2100-01-01 (page 2)` | Authorization: Bearer <user-access-token> | userId; limit obligatoire; min_date/max_date facultatifs | 200 | JSON object; keys=_links, first_date, last_date, result_max_date, result_min_date, total, transactions; arrays=transactions[139] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |
| subscriptions | GET | `GET /users/{userId}/subscriptions?all (page 1)` | Authorization: Bearer <user-access-token> | userId; all facultatif | 200 | JSON object; keys=subscriptions, total; arrays=subscriptions[3] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |
| documents | GET | `GET /users/{userId}/documents?limit=1000 (page 1)` | Authorization: Bearer <user-access-token> | userId; limit obligatoire (maximum 1000) | 200 | JSON object; keys=documents, first_date, last_date, total; arrays=documents[0] | PASS | HTTP succès; structure JSON inspectée, valeurs non enregistrées. |

## Profondeur transactionnelle observée

- Les mois sont calculés localement à partir des dates reçues ; les dates exactes, libellés, montants et identifiants ne sont pas conservés.
- `YES` signifie une amplitude calendaire inclusive d'au moins 24 mois, pas une garantie d'exhaustivité bancaire.

| Compte | Connexion | Transactions | Dates interprétées | Premier mois | Dernier mois | Mois couverts | >=24 mois |
|---|---|---:|---:|---|---|---:|---|
| ACCOUNT_01 | CONNECTION_01 | 249 | 249 | 2025-03 | 2026-09 | 19 | NO |
| ACCOUNT_02 | CONNECTION_01 | 49 | 49 | 2025-09 | 2026-09 | 13 | NO |
| ACCOUNT_03 | CONNECTION_01 | 36 | 36 | 2025-07 | 2026-03 | 9 | NO |
| ACCOUNT_04 | CONNECTION_01 | 17 | 17 | 2026-02 | 2026-08 | 7 | NO |
| ACCOUNT_05 | CONNECTION_02 | 63 | 63 | 2026-06 | 2026-09 | 4 | NO |
| ACCOUNT_06 | CONNECTION_02 | 52 | 52 | 2025-06 | 2026-09 | 16 | NO |
| ACCOUNT_07 | CONNECTION_02 | 6 | 6 | 2025-12 | 2025-12 | 1 | NO |
| ACCOUNT_08 | CONNECTION_03 | 34 | 34 | 2025-07 | 2026-04 | 10 | NO |
| ACCOUNT_09 | CONNECTION_03 | 117 | 117 | 2025-02 | 2026-08 | 19 | NO |
| ACCOUNT_10 | CONNECTION_03 | 516 | 516 | 2023-08 | 2026-08 | 37 | YES |
| USER_AGGREGATE | ALL_CONNECTIONS | 1139 | 1139 | 2023-08 | 2026-09 | 38 | YES |

## Relevés et documents fournisseur

- Cette section ne télécharge aucun fichier. Elle vérifie seulement les documents retournés et les indicateurs de fichier/lien présents dans les réponses.

| Route | Documents | Type statement détecté | Indicateur fichier site | ID fichier | URL/lien | Premier mois | Dernier mois |
|---|---:|---:|---:|---:|---:|---|---|
| GET /users/{userId}/documents | 0 | 0 | 0 | 0 | 0 |  |  |

## Limites

- Une collection vide ne prouve pas que la banque ne possède aucun historique ; elle prouve seulement que Powens n'a rien retourné dans ce contexte Sandbox.
- L'absence d'un indicateur fichier ne prouve pas l'absence d'un PDF si le fournisseur expose uniquement un espace bancaire en ligne.
- Aucun téléchargement de relevé n'est effectué automatiquement.

## Commande de relance

```powershell
& .\tools\powens-sandbox\powens-history-depth.ps1
```
