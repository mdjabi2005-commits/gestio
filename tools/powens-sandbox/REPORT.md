# Powens Sandbox REST - rapport

- Domaine: `gestio-sandbox.biapi.pro`
- Reference API: `C:\Users\djabi\bibliotheque\docs\core\POWENS.md` uniquement
- Mode: le banc relancable reste GET-only; un parcours Sandbox explicite a ensuite execute `POST /auth/init`, puis la WebView et les GET utilisateur.
- Ecritures: aucun PUT, PATCH ou DELETE; un seul POST de creation utilisateur a ete autorise et execute.
- Secrets: valeurs jamais imprimees ou enregistrees.

## Variables verifiees (noms uniquement)

- `POWENS_BASE_URL`: present
- `POWENS_CLIENT_ID`: present
- `POWENS_CLIENT_SECRET`: present
- `POWENS_USERS_TOKEN`: present
- `POWENS_USER_ID`: missing
- Le parcours utilisateur a utilise l alias documente `me`; aucune valeur d identifiant n a ete ajoutee a l environnement ou au rapport.

## Resume de la passe relancable initiale: PASS=5 BLOCKED=1 FAIL=0 NOT_RUN=10

| Domaine | Test | Route | Token requis | Parametres | HTTP | Structure JSON | Resultat | Note |
|---|---|---|---|---|---:|---|---|---|
| connectors | Lister les connectors (page 1) | `GET /connectors` | aucun | aucun | 200 | JSON object; keys=connectors, total; arrays=connectors[37] | PASS | HTTP success; JSON object parsed. |
| connectors | Lire le connecteur de test | `GET /connectors/{connectorUuid}?expand=fields,sources,payment_fields,countries,urls` | aucun | connectorUuid; expand facultatif | 200 | JSON object; keys=account_types, account_usages, auth_mechanism, available_auth_mechanisms, available_transfer_mechanisms, beta, capabilities, categories, charged, code, color, countries, documents_type, fields, hidden, id, months_to_fetch, name, payment_fields, payment_settings, products, restricted, siret, slug, sources, stability, transfer_beneficiary_types, transfer_execution_date_types, urls, uuid; arrays=fields[4], sources[2], countries[1], capabilities[10], urls[0], available_auth_mechanisms[2], categories[0], account_types[10], account_usages[2], available_transfer_mechanisms[2], transfer_beneficiary_types[1], transfer_execution_date_types[3], payment_fields[1], documents_type[0], products[3] | PASS | HTTP success; JSON object parsed. |
| connectors | Lister les sources du connecteur de test (page 1) | `GET /connectors/{connectorUuid}/sources` | aucun | connectorUuid | 200 | JSON object; keys=sources, total; arrays=sources[2] | PASS | HTTP success; JSON object parsed. |
| connectors | Lire une source du connecteur de test | `GET /connectors/{connectorUuid}/sources/{sourceId}` | aucun | connectorUuid; sourceId | 200 | JSON object; keys=account_types, account_usages, auth_mechanism, available_auth_mechanisms, available_transfer_mechanisms, capabilities, categories, disabled, disabled_capabilities, documents_type, fallback, first_opening, id, id_connector, name, priority, stability, sync_periodicity, transfer_beneficiary_types, transfer_execution_date_types, transfer_execution_frequencies, transfer_max_nb_instructions, transfer_validate_mechanism, transfer_with_payer_account, uuid; arrays=disabled_capabilities[0], capabilities[7], available_auth_mechanisms[1], account_types[10], account_usages[2], available_transfer_mechanisms[1], transfer_beneficiary_types[0], transfer_execution_date_types[2], transfer_execution_frequencies[9], documents_type[0], categories[0] | PASS | HTTP success; JSON object parsed. |
| users | Lister les utilisateurs (page 1) | `GET /users` | Authorization: Bearer POWENS_USERS_TOKEN | aucun | 200 | JSON object; keys=total, users; users=null dans la reponse initiale | PASS | HTTP success; JSON object parsed; la liste etait vide avant la creation explicite. |
| documents | Lister les types de documents | `GET /documenttypes` | aucun | aucun | 401 | JSON object; keys=code, description, request_id | BLOCKED | HTTP 401; route, scope, capability or resource unavailable: code=unauthorized |
| utilisateur | Lire l utilisateur | `GET /users/{userId}` | Authorization: Bearer <user-access-token> | userId | not called | not checked | NOT RUN | POWENS_USER_ID absent; aucun utilisateur n'a ete selectionne automatiquement. |
| utilisateur | Lister les comptes | `GET /users/{userId}/accounts` | Authorization: Bearer <user-access-token> | userId; all facultatif | not called | not checked | NOT RUN | POWENS_USER_ID absent; aucun utilisateur n'a ete selectionne automatiquement. |
| utilisateur | Lister les transactions | `GET /users/{userId}/transactions?limit=50` | Authorization: Bearer <user-access-token> | userId; limit obligatoire (50) | not called | not checked | NOT RUN | POWENS_USER_ID absent; aucun utilisateur n'a ete selectionne automatiquement. |
| utilisateur | Lister les connexions | `GET /users/{userId}/connections` | Authorization: Bearer <user-access-token> | userId | not called | not checked | NOT RUN | POWENS_USER_ID absent; aucun utilisateur n'a ete selectionne automatiquement. |
| utilisateur | Lister les subscriptions | `GET /users/{userId}/subscriptions` | Authorization: Bearer <user-access-token> | userId; all facultatif | not called | not checked | NOT RUN | POWENS_USER_ID absent; aucun utilisateur n'a ete selectionne automatiquement. |
| utilisateur | Lister les documents | `GET /users/{userId}/documents?limit=50` | Authorization: Bearer <user-access-token> | userId; limit obligatoire (50) | not called | not checked | NOT RUN | POWENS_USER_ID absent; aucun utilisateur n'a ete selectionne automatiquement. |
| utilisateur | Lister les investissements | `GET /users/{userId}/investments` | Authorization: Bearer <user-access-token> | userId | not called | not checked | NOT RUN | POWENS_USER_ID absent; aucun utilisateur n'a ete selectionne automatiquement. |
| utilisateur | Lister les market orders | `GET /users/{userId}/marketorders` | Authorization: Bearer <user-access-token> | userId | not called | not checked | NOT RUN | POWENS_USER_ID absent; aucun utilisateur n'a ete selectionne automatiquement. |
| utilisateur | Lister les pockets | `GET /users/{userId}/pockets` | Authorization: Bearer <user-access-token> | userId | not called | not checked | NOT RUN | POWENS_USER_ID absent; aucun utilisateur n'a ete selectionne automatiquement. |
| utilisateur | Lister les amortizations | `GET /users/{userId}/amortizations` | Authorization: Bearer <user-access-token> | userId | not called | not checked | NOT RUN | POWENS_USER_ID absent; aucun utilisateur n'a ete selectionne automatiquement. |

## Parcours utilisateur Sandbox execute ensuite

| Domaine | Methode et route | Token / parametres | HTTP | Structure JSON observee | Resultat |
|---|---|---|---:|---|---|
| auth | `POST /auth/init` | JSON `client_id`, `client_secret` depuis l environnement | 200 | object; keys=`auth_token`, `type`, `id_user` | PASS; utilisateur cree, valeurs non conservees |
| auth | `GET /auth/token/code?type=singleAccess` | user access token | 200 | object; keys=`code`, `type`, `access`, `expires_in` | PASS; code non affiche |
| users | `GET /users` | Server key `Users` | 200 | object; keys=`users`, `total`; `users[1]` | PASS; total=1 apres creation |
| users | `GET /users/me` | user access token | 200 | object; keys=`id`, `signin`, `platform` | PASS |
| connections | `GET /users/me/connections` | user access token | 200 | object; keys=`connections`, `total`; `connections[1]` | PASS; `active=true`, aucune erreur |
| accounts | `GET /users/me/accounts` | user access token | 200 | object; keys=`balance`, `balances`, `coming_balances`, `accounts`, `total`; `accounts[4]` | PASS; valeurs financieres non conservees |
| transactions | `GET /users/me/transactions?limit=50` | user access token; `limit=50` | 200 | object; keys=`first_date`, `last_date`, `_links`, `transactions`, `total` | PASS; 8 pages, 351 elements parcourus |
| subscriptions | `GET /users/me/subscriptions` | user access token | 200 | object; keys=`subscriptions`, `total`; collection vide | PASS; capacite sans donnee |
| documents | `GET /users/me/documents?limit=50` | user access token; `limit=50` | 200 | object; keys=`first_date`, `last_date`, `documents`, `total`; collection vide | PASS; aucun document synchronise |
| documents | `GET /documenttypes` | user access token | 200 | object; keys=`documenttypes`, `total`; `documenttypes[18]`; item keys=`id`, `name`, `attacheable` | PASS; sans token, la meme route avait repondu 401 |
| wealth | `GET /users/me/investments` | user access token | 200 | object; keys=`diff`, `diff_percent`, `prev_diff`, `prev_diff_percent`, `valuation`, `calculated`, `investments`, `total`; collection vide | PASS; aucune position |
| wealth | `GET /users/me/marketorders` | user access token | 200 | object; keys=`marketorders`, `total`; collection vide | PASS |
| wealth | `GET /users/me/pockets` | user access token | 200 | object; keys=`pockets`, `total`; collection vide | PASS |
| wealth | `GET /users/me/amortizations` | user access token | 401 | object; keys=`code`, `description`, `request_id`; `code=unauthorized` | BLOCKED; capacite non accessible dans ce domaine Sandbox |

Cette extension represente `PASS=13`, `BLOCKED=1`, `FAIL=0`. Le navigateur a ete utilise pour le parcours WebView; aucun identifiant bancaire, token ou code temporaire n a ete imprime ou enregistre.

## Deuxieme passage apres ajout des connexions Trade Republic et Banque Postale

| Test | HTTP | Structure / resultat anonymise |
|---|---:|---|
| `POST /auth/renew` | 200 | object; keys=`access_token`, `token_type`; token conserve en memoire uniquement |
| `GET /users/me/connections` | 200 | 3 connexions, toutes `active=true` |
| `GET /users/me/accounts` | 200 | 10 comptes; champs `id`, `id_connection`, `name`, `original_name`, `type` presents |
| `GET /users/me/transactions?limit=50` | 200 | 23 pages, 1 139 transactions parcourues; pagination suivie |
| `GET /users/me/investments` | 200 | collection vide |
| `GET /users/me/marketorders` | 200 | collection vide |
| `GET /users/me/pockets` | 200 | collection vide |
| `GET /users/me/subscriptions` | 200 | collection vide |
| `GET /users/me/documents?limit=50` | 200 | collection vide |
| `GET /documenttypes` | 200 | 18 types; item keys=`id`, `name`, `attacheable` |
| `GET /users/me/amortizations` | 401 | object d erreur; `code=unauthorized` |

Les libelles recus permettent une classification candidate, sans enregistrer les noms : un compte candidat `Livret A`, un `Livret Jeune`, un `PEA`, un `portfolio/compte-titres` et six comptes non determines. Cette classification est indicative; les valeurs brutes et les identifiants restent masques.

Les routes filtrees par compte ont aussi ete testees :

| Compte candidat | Route | HTTP | Resultat |
|---|---|---:|---|
| PEA | `GET /users/me/accounts/{accountId}/investments` | 200 | collection vide |
| PEA | `GET /users/me/accounts/{accountId}/marketorders` | 200 | collection vide |
| portfolio/compte-titres | `GET /users/me/accounts/{accountId}/investments` | 200 | collection vide |
| portfolio/compte-titres | `GET /users/me/accounts/{accountId}/marketorders` | 200 | collection vide |

Ce deuxieme passage represente `PASS=15`, `BLOCKED=1`, `FAIL=0`. Les comptes sont bien exposes, mais aucune position ou ordre de marche n est encore renvoye par Powens pour ces deux comptes au moment du test.

## Exemples JSON anonymises du parcours utilisateur

```json
{
  "POST /auth/init": {
    "auth_token": "<redacted>",
    "type": "<redacted>",
    "id_user": "<id>"
  },
  "GET /auth/token/code?type=singleAccess": {
    "code": "<redacted>",
    "type": "<redacted>",
    "access": "<redacted>",
    "expires_in": "<redacted>"
  },
  "GET /users/me/connections": {
    "connections": [{ "id": "<id>", "active": true, "state": null, "error": null }],
    "total": 1
  },
  "GET /users/me/accounts": {
    "balance": "<redacted>",
    "accounts": [{ "id": "<id>", "iban": "<redacted>", "balance": "<redacted>" }],
    "total": 4
  },
  "GET /users/me/transactions?limit=50": {
    "first_date": "<redacted>",
    "last_date": "<redacted>",
    "transactions": [{ "id": "<id>", "value": "<redacted>", "wording": "<redacted>" }],
    "_links": { "next": { "href": "<redacted-url>" } },
    "total": "<redacted>"
  },
  "GET /users/me/amortizations": {
    "code": "unauthorized",
    "description": "<redacted>",
    "request_id": "<id>"
  }
}
```

## Exemples JSON anonymises

### connectors - Lister les connectors (page 1)

```json
{
  "connectors": [
    {
      "id": "<id>",
      "name": "<redacted>",
      "hidden": false,
      "charged": true,
      "code": "16820",
      "beta": false,
      "color": "12b2ff",
      "slug": "AME",
      "months_to_fetch": null,
      "siret": null,
      "uuid": "<id>",
      "restricted": false,
      "stability": {
        "status": "stable",
        "last_update": "2026-07-29 19:26:59"
      },
      "capabilities": [
        "bank",
        "twofarenew"
      ],
      "available_auth_mechanisms": "webauth",
      "categories": null,
      "auth_mechanism": "webauth",
      "account_types": [
        "checking",
        "card"
      ],
      "account_usages": [
        "PRIV",
        "ORGA"
      ],
      "products": "bank"
    },
    {
      "id": "<id>",
      "name": "<redacted>",
      "hidden": false,
      "charged": true,
      "code": null,
      "beta": false,
      "color": "0077be",
      "slug": "APV",
      "months_to_fetch": null,
      "siret": null,
      "uuid": "<id>",
      "restricted": false,
      "stability": {
        "status": "unstable",
        "last_update": "2026-07-29 19:26:59"
      },
      "capabilities": [
        "bankwealth",
        "bank"
      ],
      "available_auth_mechanisms": "credentials",
      "categories": null,
      "auth_mechanism": "credentials",
      "account_types": [
        "perp",
        "capitalisation",
        "lifeinsurance",
        "<truncated>"
      ],
      "account_usages": null,
      "products": [
        "bank",
        "wealth"
      ]
    },
    {
      "id": "<id>",
      "name": "<redacted>",
      "hidden": false,
      "charged": true,
      "code": null,
      "beta": false,
      "color": "538b19",
      "slug": "ASS",
      "months_to_fetch": null,
      "siret": null,
      "uuid": "<id>",
      "restricted": false,
      "stability": {
        "status": "stable",
        "last_update": "2026-07-29 19:26:59"
      },
      "capabilities": [
        "document",
        "bankwealth",
        "bank"
      ],
      "available_auth_mechanisms": "credentials",
      "categories": null,
      "auth_mechanism": "credentials",
      "account_types": [
        "perp",
        "pea",
        "lifeinsurance",
        "<truncated>"
      ],
      "account_usages": null,
      "documents_type": "other",
      "products": [
        "bank",
        "wealth"
      ]
    },
    "<truncated>"
  ],
  "total": 37
}
```

### connectors - Lire le connecteur de test

```json
{
  "id": "<id>",
  "name": "<redacted>",
  "hidden": false,
  "charged": false,
  "code": null,
  "beta": false,
  "color": "5c2963",
  "slug": "EXA",
  "months_to_fetch": null,
  "siret": null,
  "uuid": "<id>",
  "restricted": false,
  "fields": [
    {
      "name": "<redacted>",
      "label": "<redacted>",
      "regex": null,
      "type": "text",
      "required": true,
      "auth_mechanisms": "credentials",
      "connector_sources": "directaccess"
    },
    {
      "name": "<redacted>",
      "label": "<redacted>",
      "regex": null,
      "type": "password",
      "required": true,
      "auth_mechanisms": "credentials",
      "connector_sources": "directaccess"
    },
    {
      "name": "<redacted>",
      "label": "<redacted>",
      "regex": null,
      "type": "list",
      "required": false,
      "auth_mechanisms": [
        "webauth",
        "credentials"
      ],
      "connector_sources": "openapi",
      "values": [
        {
          "label": "<redacted>",
          "value": "par"
        },
        {
          "label": "<redacted>",
          "value": "pro"
        },
        {
          "label": "<redacted>",
          "value": "wrongpass"
        },
        "<truncated>"
      ]
    },
    "<truncated>"
  ],
  "sources": [
    {
      "uuid": "<id>",
      "id": "<id>",
      "id_connector": "<id>",
      "name": "<redacted>",
      "auth_mechanism": "webauth",
      "fallback": null,
      "sync_periodicity": null,
      "first_opening": "2019-09-03 09:54:55",
      "disabled": null,
      "priority": 0,
      "disabled_capabilities": null,
      "capabilities": [
        "transfer",
        "twofarenew",
        "profile",
        "<truncated>"
      ],
      "available_auth_mechanisms": [
        "credentials",
        "webauth"
      ],
      "account_types": [
        "card",
        "checking"
      ],
      "account_usages": [
        "ORGA",
        "PRIV"
      ],
      "available_transfer_mechanisms": "webauth",
      "transfer_validate_mechanism": "webauth",
      "transfer_beneficiary_types": "iban",
      "transfer_execution_date_types": "periodic",
      "transfer_execution_frequencies": [
        "semiannually",
        "two-weekly",
        "weekly",
        "<truncated>"
      ],
      "transfer_max_nb_instructions": 1,
      "transfer_with_payer_account": "optional",
      "payment_settings": {
        "available_validate_mechanisms": "webauth",
        "beneficiary_types": "iban",
        "execution_date_types": [
          "first_open_day",
          "deferred",
          "instant",
          "<truncated>"
        ],
        "bulk_execution_date_types": [
          "first_open_day",
          "deferred",
          "instant"
        ],
        "execution_frequencies": [
          "semiannually",
          "two-weekly",
          "quarterly",
          "<truncated>"
        ],
        "maximum_number_of_instructions": "<redacted>",
        "providing_payer_account": "optional",
        "bulk_providing_payer_account": "optional",
        "partial_status_tracking": null,
        "is_app_to_app_used": {
          "android": false,
          "ios": false
        },
        "bank_provides_payer_account": null,
        "bank_provides_payer_label": null,
        "transfer_date_types_where_trusted_beneficiary_required": null,
        "trusted_beneficiaries_required_for_bulk": false,
        "cancellation_available": true,
        "minimum_amount": {
          "instant": 0.0,
          "first_open_day": 0.0,
          "deferred": 0.0
        },
        "maximum_amount": null,
        "minimum_date_delta_days": 0,
        "maximum_date_delta_days": null
      },
      "stability": {
        "status": "stable",
        "last_update": "2026-07-29 19:26:59"
      },
      "categories": null
    },
    {
      "uuid": "<id>",
      "id": "<id>",
      "id_connector": "<id>",
      "name": "<redacted>",
      "auth_mechanism": "credentials",
      "fallback": null,
      "sync_periodicity": null,
      "first_opening": "2014-12-03 10:04:23",
      "disabled": null,
      "priority": 2,
      "disabled_capabilities": null,
      "capabilities": [
        "bankwealth",
        "twofarenew",
        "document",
        "<truncated>"
      ],
      "available_auth_mechanisms": "credentials",
      "account_types": [
        "card",
        "checking",
        "lifeinsurance",
        "<truncated>"
      ],
      "account_usages": [
        "ORGA",
        "PRIV"
      ],
      "available_transfer_mechanisms": "credentials",
      "transfer_validate_mechanism": "credentials",
      "transfer_beneficiary_types": null,
      "transfer_execution_date_types": [
        "first_open_day",
        "deferred"
      ],
      "transfer_execution_frequencies": [
        "semiannually",
        "two-weekly",
        "weekly",
        "<truncated>"
      ],
      "transfer_max_nb_instructions": 1,
      "transfer_with_payer_account": "mandatory",
      "documents_type": null,
      "stability": {
        "status": "stable",
        "last_update": "2026-07-29 19:26:59"
      },
      "categories": null
    }
  ],
  "countries": {
    "id": "<id>",
    "name": "<redacted>"
  },
  "stability": {
    "status": "stable",
    "last_update": "2026-07-29 19:26:59"
  },
  "capabilities": [
    "bankwealth",
    "transfer",
    "twofarenew",
    "<truncated>"
  ],
  "urls": null,
  "available_auth_mechanisms": [
    "webauth",
    "credentials"
  ],
  "categories": null,
  "auth_mechanism": "webauth",
  "account_types": [
    "card",
    "savings",
    "pea",
    "<truncated>"
  ],
  "account_usages": [
    "PRIV",
    "ORGA"
  ],
  "available_transfer_mechanisms": [
    "webauth",
    "credentials"
  ],
  "transfer_beneficiary_types": "iban",
  "transfer_execution_date_types": [
    "first_open_day",
    "deferred",
    "periodic"
  ],
  "payment_fields": {
    "name": "<redacted>",
    "label": "<redacted>",
    "regex": null,
    "type": "list",
    "required": false,
    "auth_mechanisms": "webauth",
    "connector_sources": "openapi",
    "values": [
      {
        "label": "<redacted>",
        "value": "legacy"
      },
      {
        "label": "<redacted>",
        "value": "redirect"
      },
      {
        "label": "<redacted>",
        "value": "decoupled"
      },
      "<truncated>"
    ]
  },
  "payment_settings": {
    "available_validate_mechanisms": "webauth",
    "beneficiary_types": "iban",
    "execution_date_types": [
      "first_open_day",
      "deferred",
      "instant",
      "<truncated>"
    ],
    "bulk_execution_date_types": [
      "first_open_day",
      "deferred",
      "instant"
    ],
    "execution_frequencies": [
      "semiannually",
      "two-weekly",
      "quarterly",
      "<truncated>"
    ],
    "maximum_number_of_instructions": "<redacted>",
    "providing_payer_account": "optional",
    "bulk_providing_payer_account": "optional",
    "partial_status_tracking": null,
    "is_app_to_app_used": {
      "android": false,
      "ios": false
    },
    "bank_provides_payer_account": null,
    "bank_provides_payer_label": null,
    "transfer_date_types_where_trusted_beneficiary_required": null,
    "trusted_beneficiaries_required_for_bulk": false,
    "cancellation_available": true,
    "minimum_amount": {
      "instant": 0.0,
      "first_open_day": 0.0,
      "deferred": 0.0
    },
    "maximum_amount": null,
    "minimum_date_delta_days": 0,
    "maximum_date_delta_days": null
  },
  "documents_type": null,
  "products": [
    "bank",
    "pay",
    "wealth"
  ]
}
```

### connectors - Lister les sources du connecteur de test (page 1)

```json
{
  "total": 2,
  "sources": [
    {
      "uuid": "<id>",
      "id": "<id>",
      "id_connector": "<id>",
      "name": "<redacted>",
      "auth_mechanism": "credentials",
      "fallback": null,
      "sync_periodicity": null,
      "first_opening": "2014-12-03 10:04:23",
      "disabled": null,
      "priority": 2,
      "disabled_capabilities": null,
      "capabilities": [
        "banktransferaddrecipient",
        "banktransfer",
        "twofarenew",
        "<truncated>"
      ],
      "available_auth_mechanisms": "credentials",
      "account_types": [
        "card",
        "checking",
        "lifeinsurance",
        "<truncated>"
      ],
      "account_usages": [
        "ORGA",
        "PRIV"
      ],
      "available_transfer_mechanisms": "credentials",
      "transfer_validate_mechanism": "credentials",
      "transfer_beneficiary_types": null,
      "transfer_execution_date_types": [
        "first_open_day",
        "deferred"
      ],
      "transfer_execution_frequencies": [
        "semiannually",
        "two-weekly",
        "weekly",
        "<truncated>"
      ],
      "transfer_max_nb_instructions": 1,
      "transfer_with_payer_account": "mandatory",
      "documents_type": null,
      "stability": {
        "status": "stable",
        "last_update": "2026-07-29 19:26:59"
      },
      "categories": null
    },
    {
      "uuid": "<id>",
      "id": "<id>",
      "id_connector": "<id>",
      "name": "<redacted>",
      "auth_mechanism": "webauth",
      "fallback": null,
      "sync_periodicity": null,
      "first_opening": "2019-09-03 09:54:55",
      "disabled": null,
      "priority": 0,
      "disabled_capabilities": null,
      "capabilities": [
        "onetimepayment",
        "transfer",
        "twofarenew",
        "<truncated>"
      ],
      "available_auth_mechanisms": [
        "credentials",
        "webauth"
      ],
      "account_types": [
        "card",
        "checking"
      ],
      "account_usages": [
        "ORGA",
        "PRIV"
      ],
      "available_transfer_mechanisms": "webauth",
      "transfer_validate_mechanism": "webauth",
      "transfer_beneficiary_types": "iban",
      "transfer_execution_date_types": "periodic",
      "transfer_execution_frequencies": [
        "semiannually",
        "two-weekly",
        "weekly",
        "<truncated>"
      ],
      "transfer_max_nb_instructions": 1,
      "transfer_with_payer_account": "optional",
      "payment_settings": {
        "available_validate_mechanisms": "webauth",
        "beneficiary_types": "iban",
        "execution_date_types": [
          "periodic",
          "deferred",
          "instant",
          "<truncated>"
        ],
        "bulk_execution_date_types": [
          "instant",
          "deferred",
          "first_open_day"
        ],
        "execution_frequencies": [
          "quarterly",
          "two-monthly",
          "weekly",
          "<truncated>"
        ],
        "maximum_number_of_instructions": "<redacted>",
        "providing_payer_account": "optional",
        "bulk_providing_payer_account": "optional",
        "partial_status_tracking": null,
        "is_app_to_app_used": {
          "android": false,
          "ios": false
        },
        "bank_provides_payer_account": null,
        "bank_provides_payer_label": null,
        "transfer_date_types_where_trusted_beneficiary_required": null,
        "trusted_beneficiaries_required_for_bulk": false,
        "cancellation_available": true,
        "minimum_amount": {
          "instant": 0.0,
          "first_open_day": 0.0,
          "deferred": 0.0
        },
        "maximum_amount": null,
        "minimum_date_delta_days": 0,
        "maximum_date_delta_days": null
      },
      "stability": {
        "status": "stable",
        "last_update": "2026-07-29 19:26:59"
      },
      "categories": null
    }
  ]
}
```

### connectors - Lire une source du connecteur de test

```json
{
  "uuid": "<id>",
  "id": "<id>",
  "id_connector": "<id>",
  "name": "<redacted>",
  "auth_mechanism": "credentials",
  "fallback": null,
  "sync_periodicity": null,
  "first_opening": "2014-12-03 10:04:23",
  "disabled": null,
  "priority": 2,
  "disabled_capabilities": null,
  "capabilities": [
    "banktransferaddrecipient",
    "banktransfer",
    "twofarenew",
    "<truncated>"
  ],
  "available_auth_mechanisms": "credentials",
  "account_types": [
    "card",
    "checking",
    "lifeinsurance",
    "<truncated>"
  ],
  "account_usages": [
    "ORGA",
    "PRIV"
  ],
  "available_transfer_mechanisms": "credentials",
  "transfer_validate_mechanism": "credentials",
  "transfer_beneficiary_types": null,
  "transfer_execution_date_types": [
    "first_open_day",
    "deferred"
  ],
  "transfer_execution_frequencies": [
    "semiannually",
    "two-weekly",
    "weekly",
    "<truncated>"
  ],
  "transfer_max_nb_instructions": 1,
  "transfer_with_payer_account": "mandatory",
  "documents_type": null,
  "stability": {
    "status": "stable",
    "last_update": "2026-07-29 19:26:59"
  },
  "categories": null
}
```

### users - Lister les utilisateurs (page 1)

```json
{
  "users": null,
  "total": 0
}
```

### documents - Lister les types de documents

```json
{
  "code": "unauthorized",
  "description": "You don't have the required authorization parameter to access this endpoint.",
  "request_id": "<id>"
}
```

## Pagination et liens

- GET /connectors: aucun lien next observe page 1.
- GET /connectors/{connectorUuid}/sources: aucun lien next observe page 1.
- GET /users: aucun lien next observe page 1.

## Routes impossibles ou non executees

- Le script relancable n auto-selectionne pas un utilisateur si `POWENS_USER_ID` est absent; le parcours execute a utilise l alias documente `me` apres la creation explicite.
- `POST /auth/renew` a ete execute au deuxieme passage avec `grant_type`, `client_id`, `client_secret`, `id_user` et `revoke_previous=false`; le token a ete utilise en memoire puis la session a ete fermee.
- `POST /auth/init` avec `client_id` et `client_secret` a ete execute une fois en Sandbox, avec valeurs provenant uniquement des variables d environnement; aucun token ou identifiant n a ete conserve dans Git.
- `POST /users/{userId}/subscriptions/{subscriptionId}` avec `{ "disabled": true|false }` changerait le consentement et pourrait supprimer des documents enfants; token utilisateur; non execute.
- Les POST/PUT de connexion, compte, transaction et document, ainsi que les PUT/PATCH de connector et les DELETE documentes, restent non executes; ils modifient ou suppriment des donnees et exigeraient leurs tokens documentes.

## Fichiers et validations

- Fichiers de cette mission: `tools/powens-sandbox/powens-readonly-tests.ps1` et `tools/powens-sandbox/REPORT.md`.
- Aucun fichier Kotlin, Gradle, SQLDelight, metier ou UX n'a ete modifie.
- Analyse syntaxique PowerShell: PASS.
- Execution du banc relancable: 5 PASS, 1 BLOCKED, 0 FAIL, 10 NOT RUN.
- Parcours utilisateur explicite: 13 PASS, 1 BLOCKED, 0 FAIL; aucun secret ni contenu financier n a ete ecrit dans le rapport.
- Deuxieme passage comptes/investissements: 15 PASS, 1 BLOCKED, 0 FAIL; aucun secret ni identifiant brut n a ete conserve.
- Commande du banc: `& .\tools\powens-sandbox\powens-readonly-tests.ps1` avec variables d'environnement injectees en memoire depuis le scope utilisateur; aucune valeur n'est reproduite.

## Prochaines etapes minimales

- Pour relancer le parcours complet, recreer explicitement un utilisateur Sandbox et refaire l interaction WebView; ne pas automatiser la creation par defaut.
- Pour les nouvelles connexions, relancer les GET apres la fin de synchronisation si les positions PEA ou compte-titres sont attendues; aucune nouvelle creation n est necessaire.
- Pour lever le blocage, demander l activation de la capacite `amortizations` dans le domaine Sandbox; aucune modification n a ete tentee.
- Le banc relancable reste volontairement GET-only; les ecritures de connexions, comptes, transactions, subscriptions, documents et les DELETE restent hors perimetre.

## Commande de relance

```powershell
& .\tools\powens-sandbox\powens-readonly-tests.ps1
```
