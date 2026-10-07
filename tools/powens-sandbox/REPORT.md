# Powens Sandbox REST - rapport

- Domaine: `gestio-sandbox.biapi.pro`
- Reference API: `C:\Users\djabi\bibliotheque\docs\core\POWENS.md` uniquement
- Mode: GET uniquement; aucun POST, PUT, PATCH ou DELETE emis.
- Secrets: valeurs jamais imprimees ou enregistrees.

## Variables verifiees (noms uniquement)

- `POWENS_BASE_URL`: present
- `POWENS_CLIENT_ID`: present
- `POWENS_CLIENT_SECRET`: present
- `POWENS_USERS_TOKEN`: present
- `POWENS_USER_ID`: present

## Resume: PASS=5 BLOCKED=1 FAIL=0 NOT_RUN=10

| Domaine | Test | Route | Token requis | Parametres | HTTP | Structure JSON | Resultat | Note |
|---|---|---|---|---|---:|---|---|---|
| connectors | Lister les connectors (page 1) | `GET /connectors` | aucun | aucun | 200 | JSON object; keys=connectors, total; arrays=connectors[38] | PASS | HTTP success; JSON object parsed. |
| connectors | Lire le connecteur de test | `GET /connectors/{connectorUuid}?expand=fields,sources,payment_fields,countries,urls` | aucun | connectorUuid; expand facultatif | 200 | JSON object; keys=account_types, account_usages, auth_mechanism, available_auth_mechanisms, available_transfer_mechanisms, beta, capabilities, categories, charged, code, color, countries, documents_type, fields, hidden, id, months_to_fetch, name, payment_fields, payment_settings, products, restricted, siret, slug, sources, stability, transfer_beneficiary_types, transfer_execution_date_types, urls, uuid; arrays=fields[4], sources[2], countries[1], capabilities[10], urls[0], available_auth_mechanisms[2], categories[0], account_types[10], account_usages[2], available_transfer_mechanisms[2], transfer_beneficiary_types[1], transfer_execution_date_types[3], payment_fields[1], documents_type[0], products[3] | PASS | HTTP success; JSON object parsed. |
| connectors | Lister les sources du connecteur de test (page 1) | `GET /connectors/{connectorUuid}/sources` | aucun | connectorUuid | 200 | JSON object; keys=sources, total; arrays=sources[2] | PASS | HTTP success; JSON object parsed. |
| connectors | Lire une source du connecteur de test | `GET /connectors/{connectorUuid}/sources/{sourceId}` | aucun | connectorUuid; sourceId | 200 | JSON object; keys=account_types, account_usages, auth_mechanism, available_auth_mechanisms, available_transfer_mechanisms, capabilities, categories, disabled, disabled_capabilities, documents_type, fallback, first_opening, id, id_connector, name, priority, stability, sync_periodicity, transfer_beneficiary_types, transfer_execution_date_types, transfer_execution_frequencies, transfer_max_nb_instructions, transfer_validate_mechanism, transfer_with_payer_account, uuid; arrays=disabled_capabilities[0], capabilities[7], available_auth_mechanisms[1], account_types[10], account_usages[2], available_transfer_mechanisms[1], transfer_beneficiary_types[0], transfer_execution_date_types[2], transfer_execution_frequencies[9], documents_type[0], categories[0] | PASS | HTTP success; JSON object parsed. |
| users | Lister les utilisateurs (page 1) | `GET /users` | Authorization: Bearer POWENS_USERS_TOKEN | aucun | 200 | JSON object; keys=total, users; arrays=users[1] | PASS | HTTP success; JSON object parsed. |
| documents | Lister les types de documents | `GET /documenttypes` | aucun | aucun | 401 | JSON object; keys=code, description, request_id | BLOCKED | HTTP 401; route, scope, capability or resource unavailable: code=unauthorized |
| utilisateur | Lire l utilisateur | `GET /users/{userId}` | Authorization: Bearer <user-access-token> | userId | not called | not checked | NOT RUN | User-access-token indisponible en GET-only; l'obtention via POST /auth/renew est interdite par cette mission. |
| utilisateur | Lister les comptes | `GET /users/{userId}/accounts` | Authorization: Bearer <user-access-token> | userId; all facultatif | not called | not checked | NOT RUN | User-access-token indisponible en GET-only; l'obtention via POST /auth/renew est interdite par cette mission. |
| utilisateur | Lister les transactions | `GET /users/{userId}/transactions?limit=50` | Authorization: Bearer <user-access-token> | userId; limit obligatoire (50) | not called | not checked | NOT RUN | User-access-token indisponible en GET-only; l'obtention via POST /auth/renew est interdite par cette mission. |
| utilisateur | Lister les connexions | `GET /users/{userId}/connections` | Authorization: Bearer <user-access-token> | userId | not called | not checked | NOT RUN | User-access-token indisponible en GET-only; l'obtention via POST /auth/renew est interdite par cette mission. |
| utilisateur | Lister les subscriptions | `GET /users/{userId}/subscriptions` | Authorization: Bearer <user-access-token> | userId; all facultatif | not called | not checked | NOT RUN | User-access-token indisponible en GET-only; l'obtention via POST /auth/renew est interdite par cette mission. |
| utilisateur | Lister les documents | `GET /users/{userId}/documents?limit=50` | Authorization: Bearer <user-access-token> | userId; limit obligatoire (50) | not called | not checked | NOT RUN | User-access-token indisponible en GET-only; l'obtention via POST /auth/renew est interdite par cette mission. |
| utilisateur | Lister les investissements | `GET /users/{userId}/investments` | Authorization: Bearer <user-access-token> | userId | not called | not checked | NOT RUN | User-access-token indisponible en GET-only; l'obtention via POST /auth/renew est interdite par cette mission. |
| utilisateur | Lister les market orders | `GET /users/{userId}/marketorders` | Authorization: Bearer <user-access-token> | userId | not called | not checked | NOT RUN | User-access-token indisponible en GET-only; l'obtention via POST /auth/renew est interdite par cette mission. |
| utilisateur | Lister les pockets | `GET /users/{userId}/pockets` | Authorization: Bearer <user-access-token> | userId | not called | not checked | NOT RUN | User-access-token indisponible en GET-only; l'obtention via POST /auth/renew est interdite par cette mission. |
| utilisateur | Lister les amortizations | `GET /users/{userId}/amortizations` | Authorization: Bearer <user-access-token> | userId | not called | not checked | NOT RUN | User-access-token indisponible en GET-only; l'obtention via POST /auth/renew est interdite par cette mission. |

## Exemples JSON anonymises

### connectors - Lister les connectors (page 1)

```json
{
    "connectors":  [
                       {
                           "id":  "\u003cid\u003e",
                           "name":  "\u003credacted\u003e",
                           "hidden":  false,
                           "charged":  true,
                           "code":  "16820",
                           "beta":  false,
                           "color":  "12b2ff",
                           "slug":  "AME",
                           "months_to_fetch":  null,
                           "siret":  null,
                           "uuid":  "\u003cid\u003e",
                           "restricted":  false,
                           "stability":  {
                                             "status":  "stable",
                                             "last_update":  "2026-07-29 19:26:59"
                                         },
                           "capabilities":  [
                                                "twofarenew",
                                                "bank"
                                            ],
                           "available_auth_mechanisms":  "webauth",
                           "categories":  {

                                          },
                           "auth_mechanism":  "webauth",
                           "account_types":  [
                                                 "card",
                                                 "checking"
                                             ],
                           "account_usages":  [
                                                  "PRIV",
                                                  "ORGA"
                                              ],
                           "products":  "bank"
                       },
                       {
                           "id":  "\u003cid\u003e",
                           "name":  "\u003credacted\u003e",
                           "hidden":  false,
                           "charged":  true,
                           "code":  null,
                           "beta":  false,
                           "color":  "0077be",
                           "slug":  "APV",
                           "months_to_fetch":  null,
                           "siret":  null,
                           "uuid":  "\u003cid\u003e",
                           "restricted":  false,
                           "stability":  {
                                             "status":  "unstable",
                                             "last_update":  "2026-07-29 19:26:59"
                                         },
                           "capabilities":  [
                                                "bankwealth",
                                                "bank"
                                            ],
                           "available_auth_mechanisms":  "credentials",
                           "categories":  {

                                          },
                           "auth_mechanism":  "credentials",
                           "account_types":  [
                                                 "perp",
                                                 "lifeinsurance",
                                                 "capitalisation",
                                                 "\u003ctruncated\u003e"
                                             ],
                           "account_usages":  {

                                              },
                           "products":  [
                                            "bank",
                                            "wealth"
                                        ]
                       },
                       {
                           "id":  "\u003cid\u003e",
                           "name":  "\u003credacted\u003e",
                           "hidden":  false,
                           "charged":  true,
                           "code":  null,
                           "beta":  false,
                           "color":  "538b19",
                           "slug":  "ASS",
                           "months_to_fetch":  null,
                           "siret":  null,
                           "uuid":  "\u003cid\u003e",
                           "restricted":  false,
                           "stability":  {
                                             "status":  "stable",
                                             "last_update":  "2026-07-29 19:26:59"
                                         },
                           "capabilities":  [
                                                "bankwealth",
                                                "document",
                                                "bank"
                                            ],
                           "available_auth_mechanisms":  "credentials",
                           "categories":  {

                                          },
                           "auth_mechanism":  "credentials",
                           "account_types":  [
                                                 "perp",
                                                 "lifeinsurance",
                                                 "capitalisation",
                                                 "\u003ctruncated\u003e"
                                             ],
                           "account_usages":  {

                                              },
                           "documents_type":  "other",
                           "products":  [
                                            "bank",
                                            "wealth"
                                        ]
                       },
                       "\u003ctruncated\u003e"
                   ],
    "total":  38
}
```

### connectors - Lire le connecteur de test

```json
{
    "id":  "\u003cid\u003e",
    "name":  "\u003credacted\u003e",
    "hidden":  false,
    "charged":  false,
    "code":  null,
    "beta":  false,
    "color":  "5c2963",
    "slug":  "EXA",
    "months_to_fetch":  null,
    "siret":  null,
    "uuid":  "\u003cid\u003e",
    "restricted":  false,
    "fields":  [
                   {
                       "name":  "\u003credacted\u003e",
                       "label":  "\u003credacted\u003e",
                       "regex":  null,
                       "type":  "text",
                       "required":  true,
                       "auth_mechanisms":  "credentials",
                       "connector_sources":  "directaccess"
                   },
                   {
                       "name":  "\u003credacted\u003e",
                       "label":  "\u003credacted\u003e",
                       "regex":  null,
                       "type":  "password",
                       "required":  true,
                       "auth_mechanisms":  "credentials",
                       "connector_sources":  "directaccess"
                   },
                   {
                       "name":  "\u003credacted\u003e",
                       "label":  "\u003credacted\u003e",
                       "regex":  null,
                       "type":  "list",
                       "required":  false,
                       "auth_mechanisms":  [
                                               "credentials",
                                               "webauth"
                                           ],
                       "connector_sources":  "openapi",
                       "values":  [
                                      {
                                          "label":  "\u003credacted\u003e",
                                          "value":  "par"
                                      },
                                      {
                                          "label":  "\u003credacted\u003e",
                                          "value":  "pro"
                                      },
                                      {
                                          "label":  "\u003credacted\u003e",
                                          "value":  "wrongpass"
                                      },
                                      "\u003ctruncated\u003e"
                                  ]
                   },
                   "\u003ctruncated\u003e"
               ],
    "sources":  [
                    {
                        "uuid":  "\u003cid\u003e",
                        "id":  "\u003cid\u003e",
                        "id_connector":  "\u003cid\u003e",
                        "name":  "\u003credacted\u003e",
                        "auth_mechanism":  "webauth",
                        "fallback":  null,
                        "sync_periodicity":  null,
                        "first_opening":  "2019-09-03 09:54:55",
                        "disabled":  null,
                        "priority":  0,
                        "disabled_capabilities":  {

                                                  },
                        "capabilities":  [
                                             "twofarenew",
                                             "profile",
                                             "bank",
                                             "\u003ctruncated\u003e"
                                         ],
                        "available_auth_mechanisms":  [
                                                          "credentials",
                                                          "webauth"
                                                      ],
                        "account_types":  [
                                              "card",
                                              "checking"
                                          ],
                        "account_usages":  [
                                               "ORGA",
                                               "PRIV"
                                           ],
                        "available_transfer_mechanisms":  "webauth",
                        "transfer_validate_mechanism":  "webauth",
                        "transfer_beneficiary_types":  "iban",
                        "transfer_execution_date_types":  "periodic",
                        "transfer_execution_frequencies":  [
                                                               "semiannually",
                                                               "two-weekly",
                                                               "weekly",
                                                               "\u003ctruncated\u003e"
                                                           ],
                        "transfer_max_nb_instructions":  1,
                        "transfer_with_payer_account":  "optional",
                        "payment_settings":  {
                                                 "available_validate_mechanisms":  "webauth",
                                                 "beneficiary_types":  "iban",
                                                 "execution_date_types":  [
                                                                              "periodic",
                                                                              "first_open_day",
                                                                              "deferred",
                                                                              "\u003ctruncated\u003e"
                                                                          ],
                                                 "bulk_execution_date_types":  [
                                                                                   "first_open_day",
                                                                                   "deferred",
                                                                                   "instant"
                                                                               ],
                                                 "execution_frequencies":  [
                                                                               "quarterly",
                                                                               "monthly",
                                                                               "daily",
                                                                               "\u003ctruncated\u003e"
                                                                           ],
                                                 "maximum_number_of_instructions":  "\u003credacted\u003e",
                                                 "providing_payer_account":  "optional",
                                                 "bulk_providing_payer_account":  "optional",
                                                 "partial_status_tracking":  {

                                                                             },
                                                 "is_app_to_app_used":  {
                                                                            "android":  false,
                                                                            "ios":  false
                                                                        },
                                                 "bank_provides_payer_account":  null,
                                                 "bank_provides_payer_label":  null,
                                                 "transfer_date_types_where_trusted_beneficiary_required":  {

                                                                                                            },
                                                 "trusted_beneficiaries_required_for_bulk":  false,
                                                 "cancellation_available":  true,
                                                 "minimum_amount":  {
                                                                        "instant":  0.0,
                                                                        "first_open_day":  0.0,
                                                                        "deferred":  0.0
                                                                    },
                                                 "maximum_amount":  null,
                                                 "minimum_date_delta_days":  0,
                                                 "maximum_date_delta_days":  null
                                             },
                        "stability":  {
                                          "status":  "stable",
                                          "last_update":  "2026-07-29 19:26:59"
                                      },
                        "categories":  {

                                       }
                    },
                    {
                        "uuid":  "\u003cid\u003e",
                        "id":  "\u003cid\u003e",
                        "id_connector":  "\u003cid\u003e",
                        "name":  "\u003credacted\u003e",
                        "auth_mechanism":  "credentials",
                        "fallback":  null,
                        "sync_periodicity":  null,
                        "first_opening":  "2014-12-03 10:04:23",
                        "disabled":  null,
                        "priority":  2,
                        "disabled_capabilities":  {

                                                  },
                        "capabilities":  [
                                             "twofarenew",
                                             "profile",
                                             "bank",
                                             "\u003ctruncated\u003e"
                                         ],
                        "available_auth_mechanisms":  "credentials",
                        "account_types":  [
                                              "card",
                                              "checking",
                                              "lifeinsurance",
                                              "\u003ctruncated\u003e"
                                          ],
                        "account_usages":  [
                                               "ORGA",
                                               "PRIV"
                                           ],
                        "available_transfer_mechanisms":  "credentials",
                        "transfer_validate_mechanism":  "credentials",
                        "transfer_beneficiary_types":  {

                                                       },
                        "transfer_execution_date_types":  [
                                                              "first_open_day",
                                                              "deferred"
                                                          ],
                        "transfer_execution_frequencies":  [
                                                               "semiannually",
                                                               "two-weekly",
                                                               "weekly",
                                                               "\u003ctruncated\u003e"
                                                           ],
                        "transfer_max_nb_instructions":  1,
                        "transfer_with_payer_account":  "mandatory",
                        "documents_type":  {

                                           },
                        "stability":  {
                                          "status":  "stable",
                                          "last_update":  "2026-07-29 19:26:59"
                                      },
                        "categories":  {

                                       }
                    }
                ],
    "countries":  {
                      "id":  "\u003cid\u003e",
                      "name":  "\u003credacted\u003e"
                  },
    "stability":  {
                      "status":  "stable",
                      "last_update":  "2026-07-29 19:26:59"
                  },
    "capabilities":  [
                         "twofarenew",
                         "profile",
                         "bank",
                         "\u003ctruncated\u003e"
                     ],
    "urls":  {

             },
    "available_auth_mechanisms":  [
                                      "credentials",
                                      "webauth"
                                  ],
    "categories":  {

                   },
    "auth_mechanism":  "webauth",
    "account_types":  [
                          "pee",
                          "perco",
                          "market",
                          "\u003ctruncated\u003e"
                      ],
    "account_usages":  [
                           "ORGA",
                           "PRIV"
                       ],
    "available_transfer_mechanisms":  [
                                          "credentials",
                                          "webauth"
                                      ],
    "transfer_beneficiary_types":  "iban",
    "transfer_execution_date_types":  [
                                          "periodic",
                                          "first_open_day",
                                          "deferred"
                                      ],
    "payment_fields":  {
                           "name":  "\u003credacted\u003e",
                           "label":  "\u003credacted\u003e",
                           "regex":  null,
                           "type":  "list",
                           "required":  false,
                           "auth_mechanisms":  "webauth",
                           "connector_sources":  "openapi",
                           "values":  [
                                          {
                                              "label":  "\u003credacted\u003e",
                                              "value":  "legacy"
                                          },
                                          {
                                              "label":  "\u003credacted\u003e",
                                              "value":  "redirect"
                                          },
                                          {
                                              "label":  "\u003credacted\u003e",
                                              "value":  "decoupled"
                                          },
                                          "\u003ctruncated\u003e"
                                      ]
                       },
    "payment_settings":  {
                             "available_validate_mechanisms":  "webauth",
                             "beneficiary_types":  "iban",
                             "execution_date_types":  [
                                                          "periodic",
                                                          "first_open_day",
                                                          "deferred",
                                                          "\u003ctruncated\u003e"
                                                      ],
                             "bulk_execution_date_types":  [
                                                               "first_open_day",
                                                               "deferred",
                                                               "instant"
                                                           ],
                             "execution_frequencies":  [
                                                           "quarterly",
                                                           "monthly",
                                                           "daily",
                                                           "\u003ctruncated\u003e"
                                                       ],
                             "maximum_number_of_instructions":  "\u003credacted\u003e",
                             "providing_payer_account":  "optional",
                             "bulk_providing_payer_account":  "optional",
                             "partial_status_tracking":  {

                                                         },
                             "is_app_to_app_used":  {
                                                        "android":  false,
                                                        "ios":  false
                                                    },
                             "bank_provides_payer_account":  null,
                             "bank_provides_payer_label":  null,
                             "transfer_date_types_where_trusted_beneficiary_required":  {

                                                                                        },
                             "trusted_beneficiaries_required_for_bulk":  false,
                             "cancellation_available":  true,
                             "minimum_amount":  {
                                                    "instant":  0.0,
                                                    "first_open_day":  0.0,
                                                    "deferred":  0.0
                                                },
                             "maximum_amount":  null,
                             "minimum_date_delta_days":  0,
                             "maximum_date_delta_days":  null
                         },
    "documents_type":  {

                       },
    "products":  [
                     "bank",
                     "pay",
                     "wealth"
                 ]
}
```

### connectors - Lister les sources du connecteur de test (page 1)

```json
{
    "total":  2,
    "sources":  [
                    {
                        "uuid":  "\u003cid\u003e",
                        "id":  "\u003cid\u003e",
                        "id_connector":  "\u003cid\u003e",
                        "name":  "\u003credacted\u003e",
                        "auth_mechanism":  "credentials",
                        "fallback":  null,
                        "sync_periodicity":  null,
                        "first_opening":  "2014-12-03 10:04:23",
                        "disabled":  null,
                        "priority":  2,
                        "disabled_capabilities":  {

                                                  },
                        "capabilities":  [
                                             "twofarenew",
                                             "profile",
                                             "bank",
                                             "\u003ctruncated\u003e"
                                         ],
                        "available_auth_mechanisms":  "credentials",
                        "account_types":  [
                                              "card",
                                              "checking",
                                              "lifeinsurance",
                                              "\u003ctruncated\u003e"
                                          ],
                        "account_usages":  [
                                               "ORGA",
                                               "PRIV"
                                           ],
                        "available_transfer_mechanisms":  "credentials",
                        "transfer_validate_mechanism":  "credentials",
                        "transfer_beneficiary_types":  {

                                                       },
                        "transfer_execution_date_types":  [
                                                              "first_open_day",
                                                              "deferred"
                                                          ],
                        "transfer_execution_frequencies":  [
                                                               "semiannually",
                                                               "two-weekly",
                                                               "weekly",
                                                               "\u003ctruncated\u003e"
                                                           ],
                        "transfer_max_nb_instructions":  1,
                        "transfer_with_payer_account":  "mandatory",
                        "documents_type":  {

                                           },
                        "stability":  {
                                          "status":  "stable",
                                          "last_update":  "2026-07-29 19:26:59"
                                      },
                        "categories":  {

                                       }
                    },
                    {
                        "uuid":  "\u003cid\u003e",
                        "id":  "\u003cid\u003e",
                        "id_connector":  "\u003cid\u003e",
                        "name":  "\u003credacted\u003e",
                        "auth_mechanism":  "webauth",
                        "fallback":  null,
                        "sync_periodicity":  null,
                        "first_opening":  "2019-09-03 09:54:55",
                        "disabled":  null,
                        "priority":  0,
                        "disabled_capabilities":  {

                                                  },
                        "capabilities":  [
                                             "twofarenew",
                                             "profile",
                                             "bank",
                                             "\u003ctruncated\u003e"
                                         ],
                        "available_auth_mechanisms":  [
                                                          "credentials",
                                                          "webauth"
                                                      ],
                        "account_types":  [
                                              "card",
                                              "checking"
                                          ],
                        "account_usages":  [
                                               "ORGA",
                                               "PRIV"
                                           ],
                        "available_transfer_mechanisms":  "webauth",
                        "transfer_validate_mechanism":  "webauth",
                        "transfer_beneficiary_types":  "iban",
                        "transfer_execution_date_types":  "periodic",
                        "transfer_execution_frequencies":  [
                                                               "semiannually",
                                                               "two-weekly",
                                                               "weekly",
                                                               "\u003ctruncated\u003e"
                                                           ],
                        "transfer_max_nb_instructions":  1,
                        "transfer_with_payer_account":  "optional",
                        "payment_settings":  {
                                                 "available_validate_mechanisms":  "webauth",
                                                 "beneficiary_types":  "iban",
                                                 "execution_date_types":  [
                                                                              "periodic",
                                                                              "first_open_day",
                                                                              "deferred",
                                                                              "\u003ctruncated\u003e"
                                                                          ],
                                                 "bulk_execution_date_types":  [
                                                                                   "first_open_day",
                                                                                   "deferred",
                                                                                   "instant"
                                                                               ],
                                                 "execution_frequencies":  [
                                                                               "quarterly",
                                                                               "monthly",
                                                                               "daily",
                                                                               "\u003ctruncated\u003e"
                                                                           ],
                                                 "maximum_number_of_instructions":  "\u003credacted\u003e",
                                                 "providing_payer_account":  "optional",
                                                 "bulk_providing_payer_account":  "optional",
                                                 "partial_status_tracking":  {

                                                                             },
                                                 "is_app_to_app_used":  {
                                                                            "android":  false,
                                                                            "ios":  false
                                                                        },
                                                 "bank_provides_payer_account":  null,
                                                 "bank_provides_payer_label":  null,
                                                 "transfer_date_types_where_trusted_beneficiary_required":  {

                                                                                                            },
                                                 "trusted_beneficiaries_required_for_bulk":  false,
                                                 "cancellation_available":  true,
                                                 "minimum_amount":  {
                                                                        "instant":  0.0,
                                                                        "first_open_day":  0.0,
                                                                        "deferred":  0.0
                                                                    },
                                                 "maximum_amount":  null,
                                                 "minimum_date_delta_days":  0,
                                                 "maximum_date_delta_days":  null
                                             },
                        "stability":  {
                                          "status":  "stable",
                                          "last_update":  "2026-07-29 19:26:59"
                                      },
                        "categories":  {

                                       }
                    }
                ]
}
```

### connectors - Lire une source du connecteur de test

```json
{
    "uuid":  "\u003cid\u003e",
    "id":  "\u003cid\u003e",
    "id_connector":  "\u003cid\u003e",
    "name":  "\u003credacted\u003e",
    "auth_mechanism":  "credentials",
    "fallback":  null,
    "sync_periodicity":  null,
    "first_opening":  "2014-12-03 10:04:23",
    "disabled":  null,
    "priority":  2,
    "disabled_capabilities":  {

                              },
    "capabilities":  [
                         "twofarenew",
                         "profile",
                         "bank",
                         "\u003ctruncated\u003e"
                     ],
    "available_auth_mechanisms":  "credentials",
    "account_types":  [
                          "card",
                          "checking",
                          "lifeinsurance",
                          "\u003ctruncated\u003e"
                      ],
    "account_usages":  [
                           "ORGA",
                           "PRIV"
                       ],
    "available_transfer_mechanisms":  "credentials",
    "transfer_validate_mechanism":  "credentials",
    "transfer_beneficiary_types":  {

                                   },
    "transfer_execution_date_types":  [
                                          "first_open_day",
                                          "deferred"
                                      ],
    "transfer_execution_frequencies":  [
                                           "semiannually",
                                           "two-weekly",
                                           "weekly",
                                           "\u003ctruncated\u003e"
                                       ],
    "transfer_max_nb_instructions":  1,
    "transfer_with_payer_account":  "mandatory",
    "documents_type":  {

                       },
    "stability":  {
                      "status":  "stable",
                      "last_update":  "2026-07-29 19:26:59"
                  },
    "categories":  {

                   }
}
```

### users - Lister les utilisateurs (page 1)

```json
{
    "users":  {
                  "id":  "\u003cid\u003e",
                  "signin":  "2026-09-19 14:06:53",
                  "platform":  "sharedAccess"
              },
    "total":  1
}
```

### documents - Lister les types de documents

```json
{
    "code":  "unauthorized",
    "description":  "You don\u0027t have the required authorization parameter to access this endpoint.",
    "request_id":  "\u003cid\u003e"
}
```

## Pagination et liens

- GET /connectors: aucun lien next observe page 1.
- GET /connectors/{connectorUuid}/sources: aucun lien next observe page 1.
- GET /users: aucun lien next observe page 1.

## Routes impossibles ou non executees

- Les routes utilisateur ne sont pas selectionnees automatiquement si `POWENS_USER_ID` est absent.
- `POST /auth/renew` permettrait d'obtenir un user-access-token avec `grant_type`, `client_id`, `client_secret`, `id_user` et `revoke_previous` facultatif; risque: emission de token; non execute car POST interdit.
- `POST /auth/init` avec `client_id` et `client_secret` creerait un utilisateur; non execute.
- `POST /users/{userId}/subscriptions/{subscriptionId}` avec `{ "disabled": true|false }` changerait le consentement et pourrait supprimer des documents enfants; token utilisateur; non execute.
- Les POST/PUT de connexion, compte, transaction et document, ainsi que les PUT/PATCH de connector et les DELETE documentes, restent non executes; ils modifient ou suppriment des donnees et exigeraient leurs tokens documentes.

## Fichiers et validations

- Fichiers de cette mission: `tools/powens-sandbox/powens-readonly-tests.ps1` et `tools/powens-sandbox/REPORT.md`.
- Aucun fichier Kotlin, Gradle, SQLDelight, metier ou UX n'a ete modifie.
- Analyse syntaxique PowerShell: PASS.
- Execution read-only: 5 PASS, 1 BLOCKED, 0 FAIL, 10 NOT RUN.
- Commande du banc: `& .\tools\powens-sandbox\powens-readonly-tests.ps1` avec variables d'environnement injectees en memoire depuis le scope utilisateur; aucune valeur n'est reproduite.

## Prochaines etapes minimales

- Definir explicitement `POWENS_USER_ID` avec un identifiant valide si les routes utilisateur doivent etre testees; ne pas prendre le premier resultat automatiquement.
- Reevaluer la contradiction entre l'obtention requise du user-access-token et l'interdiction de toute operation POST avant toute phase supplementaire.

## Commande de relance

```powershell
& .\tools\powens-sandbox\powens-readonly-tests.ps1
```
