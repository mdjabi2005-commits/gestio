# Powens Sandbox - matrice transactionnelle

- Corpus : transactions actives retournées par `GET /users/{userId}/transactions`, pagination suivie jusqu'à la fin.
- Le rapport ne conserve aucun montant, libellé, identifiant, token, secret ou valeur brute.
- Transactions analysées : 1139
- Comptes analysés : 10
- Pages transactionnelles lues : 2
- Champs top-level observés dans la réponse de base : 40
- Sous-champs JSON observés : 4

## Matrice connexion / compte

- Les libellés `CONNECTION_nn` et `ACCOUNT_nn` sont des positions locales anonymisées ; aucun identifiant bancaire n'est conservé.

| Connexion | Compte | Connector | Type technique | Transactions |
|---|---|---|---|---:|
| CONNECTION_01 | ACCOUNT_01 | Revolut | checking | 249 |
| CONNECTION_01 | ACCOUNT_02 | Revolut | checking | 49 |
| CONNECTION_01 | ACCOUNT_03 | Revolut | checking | 36 |
| CONNECTION_01 | ACCOUNT_04 | Revolut | checking | 17 |
| CONNECTION_02 | ACCOUNT_05 | La Banque Postale | checking | 63 |
| CONNECTION_02 | ACCOUNT_06 | La Banque Postale | savings | 52 |
| CONNECTION_02 | ACCOUNT_07 | La Banque Postale | savings | 6 |
| CONNECTION_03 | ACCOUNT_08 | Trade Republic | pea | 34 |
| CONNECTION_03 | ACCOUNT_09 | Trade Republic | market | 117 |
| CONNECTION_03 | ACCOUNT_10 | Trade Republic | checking | 516 |

## Matrice des champs

- `official` : champ décrit par la documentation Transactions.
- `deprecated` : champ encore observable mais déconseillé par Powens.
- `observed-extension` : champ observé dans le Sandbox mais hors tableau transactionnel documenté.
- `optional-expand` : champ obtenu uniquement avec une expansion documentée.

| Chemin JSON | Statut | Signification | Clé présente | Non-null | Null | Types observés | Types de comptes | Connectors | Comptes touchés | Types transaction | Valeurs sûres |
|---|---|---|---:|---:|---:|---|---|---|---:|---|---|
| `transaction.active` | official | Included by PFM services when true | 1139 | 1139 | 0 | boolean | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.application_date` | official | PFM application date; editable | 1139 | 1139 | 0 | string | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.attachments` | optional-expand | Documented attachment expansion; tested separately | 0 | 0 | 0 |  |  |  | 0 |  |  |
| `transaction.bdate` | deprecated | Bank-displayed date; use date | 1139 | 1139 | 0 | string | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.bdatetime` | deprecated | Bank-displayed date-time; use datetime | 1139 | 0 | 1139 | null | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.card` | official | Associated card number or marker | 1139 | 1139 | 0 | string | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.categories` | optional-expand | Documented category expansion; tested separately | 0 | 0 | 0 |  |  |  | 0 |  |  |
| `transaction.coming` | official | Not yet posted when true | 1139 | 1139 | 0 | boolean | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.comment` | official | User comment | 1139 | 0 | 1139 | null | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.commission` | official | Commission | 1139 | 0 | 1139 | null | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.commission_currency` | official | Commission currency | 1139 | 0 | 1139 | null | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.counterparty` | official | Optional business or individual counterparty | 1139 | 100 | 1039 | null, object | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.counterparty.account_identification` | official | Counterparty account identification | 100 | 82 | 18 | null, string | checking | Revolut | 3 | transfer |  |
| `transaction.counterparty.account_scheme_name` | official | Counterparty account scheme | 100 | 82 | 18 | null, string | checking | Revolut | 3 | transfer |  |
| `transaction.counterparty.label` | official | Counterparty label | 100 | 100 | 0 | string | checking | Revolut | 3 | transfer |  |
| `transaction.counterparty.type` | official | Counterparty role: creditor or debtor | 100 | 100 | 0 | string | checking | Revolut | 3 | transfer |  |
| `transaction.country` | deprecated | Original country; deprecated | 1139 | 0 | 1139 | null | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.date` | official | Posting date | 1139 | 1139 | 0 | string | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.date_scraped` | official | Date and time seen by Powens | 1139 | 1139 | 0 | string | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.datetime` | official | Posting date and time in UTC | 1139 | 351 | 788 | null, string | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.deleted` | official | Removal date when deleted | 1139 | 0 | 1139 | null | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.details` | observed-extension | Observed optional details object | 1139 | 0 | 1139 | null | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.documents_count` | observed-extension | Observed count of related documents | 1139 | 1139 | 0 | integer | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.formatted_value` | observed-extension | Observed display-formatted value | 1139 | 1139 | 0 | string | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.gross_value` | official | Gross transaction value | 1139 | 0 | 1139 | null | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.id` | official | Transaction identifier | 1139 | 1139 | 0 | integer | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.id_account` | official | Related account identifier | 1139 | 1139 | 0 | integer | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.id_category` | observed-extension | Observed Sandbox category identifier; do not infer meaning without mapping | 1139 | 1139 | 0 | integer | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal | distinct=1; values omitted |
| `transaction.id_cluster` | official | Cluster identifier | 1139 | 0 | 1139 | null | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.informations` | observed-extension | Observed extensible information object | 1139 | 1139 | 0 | object | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.last_update` | official | Last update | 1139 | 1139 | 0 | string | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.original_currency` | official | Original currency | 1139 | 0 | 1139 | null | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.original_gross_value` | official | Gross value in original currency | 1139 | 0 | 1139 | null | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.original_value` | official | Value in original currency | 1139 | 0 | 1139 | null | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.original_wording` | official | Full bank label | 1139 | 1139 | 0 | string | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.rdate` | official | Date the order was given | 1139 | 1139 | 0 | string | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.rdatetime` | official | Date and time the order was given | 1139 | 351 | 788 | null, string | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.simplified_wording` | official | Simplified label | 1139 | 1139 | 0 | string | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.state` | observed-extension | Observed Sandbox field; not part of the documented core table | 1139 | 1139 | 0 | string | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal | parsed |
| `transaction.stemmed_wording` | observed-extension | Champ observé dans le Sandbox | 1139 | 1139 | 0 | string | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.type` | official | Transaction type enum | 1139 | 1139 | 0 | string | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |
| `transaction.value` | official | Transaction value | 1139 | 1139 | 0 | decimal | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.vdate` | official | Value date | 1139 | 351 | 788 | null, string | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.vdatetime` | official | Value date and time in UTC | 1139 | 351 | 788 | null, string | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.webid` | observed-extension | Observed provider/web identifier | 1139 | 1018 | 121 | null, string | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |
| `transaction.wording` | official | Editable transaction label | 1139 | 1139 | 0 | string | checking, market, pea, savings | La Banque Postale, Revolut, Trade Republic | 10 | bank, card, deposit, market_order, order, profit, transfer, unknown, withdrawal |  |

## Matrice champ × type de transaction

| Chemin JSON | Type transaction | Non-null | Null | Comptes touchés |
|---|---|---:|---:|---:|
| `transaction.active` | bank | 3 | 0 | 3 |
| `transaction.application_date` | bank | 3 | 0 | 3 |
| `transaction.bdate` | bank | 3 | 0 | 3 |
| `transaction.bdatetime` | bank | 0 | 3 | 3 |
| `transaction.card` | bank | 3 | 0 | 3 |
| `transaction.coming` | bank | 3 | 0 | 3 |
| `transaction.comment` | bank | 0 | 3 | 3 |
| `transaction.commission` | bank | 0 | 3 | 3 |
| `transaction.commission_currency` | bank | 0 | 3 | 3 |
| `transaction.counterparty` | bank | 0 | 3 | 3 |
| `transaction.country` | bank | 0 | 3 | 3 |
| `transaction.date` | bank | 3 | 0 | 3 |
| `transaction.date_scraped` | bank | 3 | 0 | 3 |
| `transaction.datetime` | bank | 0 | 3 | 3 |
| `transaction.deleted` | bank | 0 | 3 | 3 |
| `transaction.details` | bank | 0 | 3 | 3 |
| `transaction.documents_count` | bank | 3 | 0 | 3 |
| `transaction.formatted_value` | bank | 3 | 0 | 3 |
| `transaction.gross_value` | bank | 0 | 3 | 3 |
| `transaction.id` | bank | 3 | 0 | 3 |
| `transaction.id_account` | bank | 3 | 0 | 3 |
| `transaction.id_category` | bank | 3 | 0 | 3 |
| `transaction.id_cluster` | bank | 0 | 3 | 3 |
| `transaction.informations` | bank | 3 | 0 | 3 |
| `transaction.last_update` | bank | 3 | 0 | 3 |
| `transaction.original_currency` | bank | 0 | 3 | 3 |
| `transaction.original_gross_value` | bank | 0 | 3 | 3 |
| `transaction.original_value` | bank | 0 | 3 | 3 |
| `transaction.original_wording` | bank | 3 | 0 | 3 |
| `transaction.rdate` | bank | 3 | 0 | 3 |
| `transaction.rdatetime` | bank | 0 | 3 | 3 |
| `transaction.simplified_wording` | bank | 3 | 0 | 3 |
| `transaction.state` | bank | 3 | 0 | 3 |
| `transaction.stemmed_wording` | bank | 3 | 0 | 3 |
| `transaction.type` | bank | 3 | 0 | 3 |
| `transaction.value` | bank | 3 | 0 | 3 |
| `transaction.vdate` | bank | 0 | 3 | 3 |
| `transaction.vdatetime` | bank | 0 | 3 | 3 |
| `transaction.webid` | bank | 0 | 3 | 3 |
| `transaction.wording` | bank | 3 | 0 | 3 |
| `transaction.active` | card | 309 | 0 | 3 |
| `transaction.application_date` | card | 309 | 0 | 3 |
| `transaction.bdate` | card | 309 | 0 | 3 |
| `transaction.bdatetime` | card | 0 | 309 | 3 |
| `transaction.card` | card | 309 | 0 | 3 |
| `transaction.coming` | card | 309 | 0 | 3 |
| `transaction.comment` | card | 0 | 309 | 3 |
| `transaction.commission` | card | 0 | 309 | 3 |
| `transaction.commission_currency` | card | 0 | 309 | 3 |
| `transaction.counterparty` | card | 0 | 309 | 3 |
| `transaction.country` | card | 0 | 309 | 3 |
| `transaction.date` | card | 309 | 0 | 3 |
| `transaction.date_scraped` | card | 309 | 0 | 3 |
| `transaction.datetime` | card | 46 | 263 | 3 |
| `transaction.deleted` | card | 0 | 309 | 3 |
| `transaction.details` | card | 0 | 309 | 3 |
| `transaction.documents_count` | card | 309 | 0 | 3 |
| `transaction.formatted_value` | card | 309 | 0 | 3 |
| `transaction.gross_value` | card | 0 | 309 | 3 |
| `transaction.id` | card | 309 | 0 | 3 |
| `transaction.id_account` | card | 309 | 0 | 3 |
| `transaction.id_category` | card | 309 | 0 | 3 |
| `transaction.id_cluster` | card | 0 | 309 | 3 |
| `transaction.informations` | card | 309 | 0 | 3 |
| `transaction.last_update` | card | 309 | 0 | 3 |
| `transaction.original_currency` | card | 0 | 309 | 3 |
| `transaction.original_gross_value` | card | 0 | 309 | 3 |
| `transaction.original_value` | card | 0 | 309 | 3 |
| `transaction.original_wording` | card | 309 | 0 | 3 |
| `transaction.rdate` | card | 309 | 0 | 3 |
| `transaction.rdatetime` | card | 46 | 263 | 3 |
| `transaction.simplified_wording` | card | 309 | 0 | 3 |
| `transaction.state` | card | 309 | 0 | 3 |
| `transaction.stemmed_wording` | card | 309 | 0 | 3 |
| `transaction.type` | card | 309 | 0 | 3 |
| `transaction.value` | card | 309 | 0 | 3 |
| `transaction.vdate` | card | 46 | 263 | 3 |
| `transaction.vdatetime` | card | 46 | 263 | 3 |
| `transaction.webid` | card | 284 | 25 | 3 |
| `transaction.wording` | card | 309 | 0 | 3 |
| `transaction.active` | deposit | 51 | 0 | 1 |
| `transaction.application_date` | deposit | 51 | 0 | 1 |
| `transaction.bdate` | deposit | 51 | 0 | 1 |
| `transaction.bdatetime` | deposit | 0 | 51 | 1 |
| `transaction.card` | deposit | 51 | 0 | 1 |
| `transaction.coming` | deposit | 51 | 0 | 1 |
| `transaction.comment` | deposit | 0 | 51 | 1 |
| `transaction.commission` | deposit | 0 | 51 | 1 |
| `transaction.commission_currency` | deposit | 0 | 51 | 1 |
| `transaction.counterparty` | deposit | 0 | 51 | 1 |
| `transaction.country` | deposit | 0 | 51 | 1 |
| `transaction.date` | deposit | 51 | 0 | 1 |
| `transaction.date_scraped` | deposit | 51 | 0 | 1 |
| `transaction.datetime` | deposit | 0 | 51 | 1 |
| `transaction.deleted` | deposit | 0 | 51 | 1 |
| `transaction.details` | deposit | 0 | 51 | 1 |
| `transaction.documents_count` | deposit | 51 | 0 | 1 |
| `transaction.formatted_value` | deposit | 51 | 0 | 1 |
| `transaction.gross_value` | deposit | 0 | 51 | 1 |
| `transaction.id` | deposit | 51 | 0 | 1 |
| `transaction.id_account` | deposit | 51 | 0 | 1 |
| `transaction.id_category` | deposit | 51 | 0 | 1 |
| `transaction.id_cluster` | deposit | 0 | 51 | 1 |
| `transaction.informations` | deposit | 51 | 0 | 1 |
| `transaction.last_update` | deposit | 51 | 0 | 1 |
| `transaction.original_currency` | deposit | 0 | 51 | 1 |
| `transaction.original_gross_value` | deposit | 0 | 51 | 1 |
| `transaction.original_value` | deposit | 0 | 51 | 1 |
| `transaction.original_wording` | deposit | 51 | 0 | 1 |
| `transaction.rdate` | deposit | 51 | 0 | 1 |
| `transaction.rdatetime` | deposit | 0 | 51 | 1 |
| `transaction.simplified_wording` | deposit | 51 | 0 | 1 |
| `transaction.state` | deposit | 51 | 0 | 1 |
| `transaction.stemmed_wording` | deposit | 51 | 0 | 1 |
| `transaction.type` | deposit | 51 | 0 | 1 |
| `transaction.value` | deposit | 51 | 0 | 1 |
| `transaction.vdate` | deposit | 0 | 51 | 1 |
| `transaction.vdatetime` | deposit | 0 | 51 | 1 |
| `transaction.webid` | deposit | 51 | 0 | 1 |
| `transaction.wording` | deposit | 51 | 0 | 1 |
| `transaction.active` | market_order | 282 | 0 | 3 |
| `transaction.application_date` | market_order | 282 | 0 | 3 |
| `transaction.bdate` | market_order | 282 | 0 | 3 |
| `transaction.bdatetime` | market_order | 0 | 282 | 3 |
| `transaction.card` | market_order | 282 | 0 | 3 |
| `transaction.coming` | market_order | 282 | 0 | 3 |
| `transaction.comment` | market_order | 0 | 282 | 3 |
| `transaction.commission` | market_order | 0 | 282 | 3 |
| `transaction.commission_currency` | market_order | 0 | 282 | 3 |
| `transaction.counterparty` | market_order | 0 | 282 | 3 |
| `transaction.country` | market_order | 0 | 282 | 3 |
| `transaction.date` | market_order | 282 | 0 | 3 |
| `transaction.date_scraped` | market_order | 282 | 0 | 3 |
| `transaction.datetime` | market_order | 0 | 282 | 3 |
| `transaction.deleted` | market_order | 0 | 282 | 3 |
| `transaction.details` | market_order | 0 | 282 | 3 |
| `transaction.documents_count` | market_order | 282 | 0 | 3 |
| `transaction.formatted_value` | market_order | 282 | 0 | 3 |
| `transaction.gross_value` | market_order | 0 | 282 | 3 |
| `transaction.id` | market_order | 282 | 0 | 3 |
| `transaction.id_account` | market_order | 282 | 0 | 3 |
| `transaction.id_category` | market_order | 282 | 0 | 3 |
| `transaction.id_cluster` | market_order | 0 | 282 | 3 |
| `transaction.informations` | market_order | 282 | 0 | 3 |
| `transaction.last_update` | market_order | 282 | 0 | 3 |
| `transaction.original_currency` | market_order | 0 | 282 | 3 |
| `transaction.original_gross_value` | market_order | 0 | 282 | 3 |
| `transaction.original_value` | market_order | 0 | 282 | 3 |
| `transaction.original_wording` | market_order | 282 | 0 | 3 |
| `transaction.rdate` | market_order | 282 | 0 | 3 |
| `transaction.rdatetime` | market_order | 0 | 282 | 3 |
| `transaction.simplified_wording` | market_order | 282 | 0 | 3 |
| `transaction.state` | market_order | 282 | 0 | 3 |
| `transaction.stemmed_wording` | market_order | 282 | 0 | 3 |
| `transaction.type` | market_order | 282 | 0 | 3 |
| `transaction.value` | market_order | 282 | 0 | 3 |
| `transaction.vdate` | market_order | 0 | 282 | 3 |
| `transaction.vdatetime` | market_order | 0 | 282 | 3 |
| `transaction.webid` | market_order | 282 | 0 | 3 |
| `transaction.wording` | market_order | 282 | 0 | 3 |
| `transaction.active` | order | 4 | 0 | 1 |
| `transaction.application_date` | order | 4 | 0 | 1 |
| `transaction.bdate` | order | 4 | 0 | 1 |
| `transaction.bdatetime` | order | 0 | 4 | 1 |
| `transaction.card` | order | 4 | 0 | 1 |
| `transaction.coming` | order | 4 | 0 | 1 |
| `transaction.comment` | order | 0 | 4 | 1 |
| `transaction.commission` | order | 0 | 4 | 1 |
| `transaction.commission_currency` | order | 0 | 4 | 1 |
| `transaction.counterparty` | order | 0 | 4 | 1 |
| `transaction.country` | order | 0 | 4 | 1 |
| `transaction.date` | order | 4 | 0 | 1 |
| `transaction.date_scraped` | order | 4 | 0 | 1 |
| `transaction.datetime` | order | 0 | 4 | 1 |
| `transaction.deleted` | order | 0 | 4 | 1 |
| `transaction.details` | order | 0 | 4 | 1 |
| `transaction.documents_count` | order | 4 | 0 | 1 |
| `transaction.formatted_value` | order | 4 | 0 | 1 |
| `transaction.gross_value` | order | 0 | 4 | 1 |
| `transaction.id` | order | 4 | 0 | 1 |
| `transaction.id_account` | order | 4 | 0 | 1 |
| `transaction.id_category` | order | 4 | 0 | 1 |
| `transaction.id_cluster` | order | 0 | 4 | 1 |
| `transaction.informations` | order | 4 | 0 | 1 |
| `transaction.last_update` | order | 4 | 0 | 1 |
| `transaction.original_currency` | order | 0 | 4 | 1 |
| `transaction.original_gross_value` | order | 0 | 4 | 1 |
| `transaction.original_value` | order | 0 | 4 | 1 |
| `transaction.original_wording` | order | 4 | 0 | 1 |
| `transaction.rdate` | order | 4 | 0 | 1 |
| `transaction.rdatetime` | order | 0 | 4 | 1 |
| `transaction.simplified_wording` | order | 4 | 0 | 1 |
| `transaction.state` | order | 4 | 0 | 1 |
| `transaction.stemmed_wording` | order | 4 | 0 | 1 |
| `transaction.type` | order | 4 | 0 | 1 |
| `transaction.value` | order | 4 | 0 | 1 |
| `transaction.vdate` | order | 0 | 4 | 1 |
| `transaction.vdatetime` | order | 0 | 4 | 1 |
| `transaction.webid` | order | 4 | 0 | 1 |
| `transaction.wording` | order | 4 | 0 | 1 |
| `transaction.active` | profit | 16 | 0 | 2 |
| `transaction.application_date` | profit | 16 | 0 | 2 |
| `transaction.bdate` | profit | 16 | 0 | 2 |
| `transaction.bdatetime` | profit | 0 | 16 | 2 |
| `transaction.card` | profit | 16 | 0 | 2 |
| `transaction.coming` | profit | 16 | 0 | 2 |
| `transaction.comment` | profit | 0 | 16 | 2 |
| `transaction.commission` | profit | 0 | 16 | 2 |
| `transaction.commission_currency` | profit | 0 | 16 | 2 |
| `transaction.counterparty` | profit | 0 | 16 | 2 |
| `transaction.country` | profit | 0 | 16 | 2 |
| `transaction.date` | profit | 16 | 0 | 2 |
| `transaction.date_scraped` | profit | 16 | 0 | 2 |
| `transaction.datetime` | profit | 0 | 16 | 2 |
| `transaction.deleted` | profit | 0 | 16 | 2 |
| `transaction.details` | profit | 0 | 16 | 2 |
| `transaction.documents_count` | profit | 16 | 0 | 2 |
| `transaction.formatted_value` | profit | 16 | 0 | 2 |
| `transaction.gross_value` | profit | 0 | 16 | 2 |
| `transaction.id` | profit | 16 | 0 | 2 |
| `transaction.id_account` | profit | 16 | 0 | 2 |
| `transaction.id_category` | profit | 16 | 0 | 2 |
| `transaction.id_cluster` | profit | 0 | 16 | 2 |
| `transaction.informations` | profit | 16 | 0 | 2 |
| `transaction.last_update` | profit | 16 | 0 | 2 |
| `transaction.original_currency` | profit | 0 | 16 | 2 |
| `transaction.original_gross_value` | profit | 0 | 16 | 2 |
| `transaction.original_value` | profit | 0 | 16 | 2 |
| `transaction.original_wording` | profit | 16 | 0 | 2 |
| `transaction.rdate` | profit | 16 | 0 | 2 |
| `transaction.rdatetime` | profit | 0 | 16 | 2 |
| `transaction.simplified_wording` | profit | 16 | 0 | 2 |
| `transaction.state` | profit | 16 | 0 | 2 |
| `transaction.stemmed_wording` | profit | 16 | 0 | 2 |
| `transaction.type` | profit | 16 | 0 | 2 |
| `transaction.value` | profit | 16 | 0 | 2 |
| `transaction.vdate` | profit | 0 | 16 | 2 |
| `transaction.vdatetime` | profit | 0 | 16 | 2 |
| `transaction.webid` | profit | 16 | 0 | 2 |
| `transaction.wording` | profit | 16 | 0 | 2 |
| `transaction.active` | transfer | 401 | 0 | 8 |
| `transaction.application_date` | transfer | 401 | 0 | 8 |
| `transaction.bdate` | transfer | 401 | 0 | 8 |
| `transaction.bdatetime` | transfer | 0 | 401 | 8 |
| `transaction.card` | transfer | 401 | 0 | 8 |
| `transaction.coming` | transfer | 401 | 0 | 8 |
| `transaction.comment` | transfer | 0 | 401 | 8 |
| `transaction.commission` | transfer | 0 | 401 | 8 |
| `transaction.commission_currency` | transfer | 0 | 401 | 8 |
| `transaction.counterparty` | transfer | 100 | 301 | 8 |
| `transaction.counterparty.account_identification` | transfer | 82 | 18 | 3 |
| `transaction.counterparty.account_scheme_name` | transfer | 82 | 18 | 3 |
| `transaction.counterparty.label` | transfer | 100 | 0 | 3 |
| `transaction.counterparty.type` | transfer | 100 | 0 | 3 |
| `transaction.country` | transfer | 0 | 401 | 8 |
| `transaction.date` | transfer | 401 | 0 | 8 |
| `transaction.date_scraped` | transfer | 401 | 0 | 8 |
| `transaction.datetime` | transfer | 287 | 114 | 8 |
| `transaction.deleted` | transfer | 0 | 401 | 8 |
| `transaction.details` | transfer | 0 | 401 | 8 |
| `transaction.documents_count` | transfer | 401 | 0 | 8 |
| `transaction.formatted_value` | transfer | 401 | 0 | 8 |
| `transaction.gross_value` | transfer | 0 | 401 | 8 |
| `transaction.id` | transfer | 401 | 0 | 8 |
| `transaction.id_account` | transfer | 401 | 0 | 8 |
| `transaction.id_category` | transfer | 401 | 0 | 8 |
| `transaction.id_cluster` | transfer | 0 | 401 | 8 |
| `transaction.informations` | transfer | 401 | 0 | 8 |
| `transaction.last_update` | transfer | 401 | 0 | 8 |
| `transaction.original_currency` | transfer | 0 | 401 | 8 |
| `transaction.original_gross_value` | transfer | 0 | 401 | 8 |
| `transaction.original_value` | transfer | 0 | 401 | 8 |
| `transaction.original_wording` | transfer | 401 | 0 | 8 |
| `transaction.rdate` | transfer | 401 | 0 | 8 |
| `transaction.rdatetime` | transfer | 287 | 114 | 8 |
| `transaction.simplified_wording` | transfer | 401 | 0 | 8 |
| `transaction.state` | transfer | 401 | 0 | 8 |
| `transaction.stemmed_wording` | transfer | 401 | 0 | 8 |
| `transaction.type` | transfer | 401 | 0 | 8 |
| `transaction.value` | transfer | 401 | 0 | 8 |
| `transaction.vdate` | transfer | 287 | 114 | 8 |
| `transaction.vdatetime` | transfer | 287 | 114 | 8 |
| `transaction.webid` | transfer | 312 | 89 | 8 |
| `transaction.wording` | transfer | 401 | 0 | 8 |
| `transaction.active` | unknown | 69 | 0 | 2 |
| `transaction.application_date` | unknown | 69 | 0 | 2 |
| `transaction.bdate` | unknown | 69 | 0 | 2 |
| `transaction.bdatetime` | unknown | 0 | 69 | 2 |
| `transaction.card` | unknown | 69 | 0 | 2 |
| `transaction.coming` | unknown | 69 | 0 | 2 |
| `transaction.comment` | unknown | 0 | 69 | 2 |
| `transaction.commission` | unknown | 0 | 69 | 2 |
| `transaction.commission_currency` | unknown | 0 | 69 | 2 |
| `transaction.counterparty` | unknown | 0 | 69 | 2 |
| `transaction.country` | unknown | 0 | 69 | 2 |
| `transaction.date` | unknown | 69 | 0 | 2 |
| `transaction.date_scraped` | unknown | 69 | 0 | 2 |
| `transaction.datetime` | unknown | 18 | 51 | 2 |
| `transaction.deleted` | unknown | 0 | 69 | 2 |
| `transaction.details` | unknown | 0 | 69 | 2 |
| `transaction.documents_count` | unknown | 69 | 0 | 2 |
| `transaction.formatted_value` | unknown | 69 | 0 | 2 |
| `transaction.gross_value` | unknown | 0 | 69 | 2 |
| `transaction.id` | unknown | 69 | 0 | 2 |
| `transaction.id_account` | unknown | 69 | 0 | 2 |
| `transaction.id_category` | unknown | 69 | 0 | 2 |
| `transaction.id_cluster` | unknown | 0 | 69 | 2 |
| `transaction.informations` | unknown | 69 | 0 | 2 |
| `transaction.last_update` | unknown | 69 | 0 | 2 |
| `transaction.original_currency` | unknown | 0 | 69 | 2 |
| `transaction.original_gross_value` | unknown | 0 | 69 | 2 |
| `transaction.original_value` | unknown | 0 | 69 | 2 |
| `transaction.original_wording` | unknown | 69 | 0 | 2 |
| `transaction.rdate` | unknown | 69 | 0 | 2 |
| `transaction.rdatetime` | unknown | 18 | 51 | 2 |
| `transaction.simplified_wording` | unknown | 69 | 0 | 2 |
| `transaction.state` | unknown | 69 | 0 | 2 |
| `transaction.stemmed_wording` | unknown | 69 | 0 | 2 |
| `transaction.type` | unknown | 69 | 0 | 2 |
| `transaction.value` | unknown | 69 | 0 | 2 |
| `transaction.vdate` | unknown | 18 | 51 | 2 |
| `transaction.vdatetime` | unknown | 18 | 51 | 2 |
| `transaction.webid` | unknown | 69 | 0 | 2 |
| `transaction.wording` | unknown | 69 | 0 | 2 |
| `transaction.active` | withdrawal | 4 | 0 | 1 |
| `transaction.application_date` | withdrawal | 4 | 0 | 1 |
| `transaction.bdate` | withdrawal | 4 | 0 | 1 |
| `transaction.bdatetime` | withdrawal | 0 | 4 | 1 |
| `transaction.card` | withdrawal | 4 | 0 | 1 |
| `transaction.coming` | withdrawal | 4 | 0 | 1 |
| `transaction.comment` | withdrawal | 0 | 4 | 1 |
| `transaction.commission` | withdrawal | 0 | 4 | 1 |
| `transaction.commission_currency` | withdrawal | 0 | 4 | 1 |
| `transaction.counterparty` | withdrawal | 0 | 4 | 1 |
| `transaction.country` | withdrawal | 0 | 4 | 1 |
| `transaction.date` | withdrawal | 4 | 0 | 1 |
| `transaction.date_scraped` | withdrawal | 4 | 0 | 1 |
| `transaction.datetime` | withdrawal | 0 | 4 | 1 |
| `transaction.deleted` | withdrawal | 0 | 4 | 1 |
| `transaction.details` | withdrawal | 0 | 4 | 1 |
| `transaction.documents_count` | withdrawal | 4 | 0 | 1 |
| `transaction.formatted_value` | withdrawal | 4 | 0 | 1 |
| `transaction.gross_value` | withdrawal | 0 | 4 | 1 |
| `transaction.id` | withdrawal | 4 | 0 | 1 |
| `transaction.id_account` | withdrawal | 4 | 0 | 1 |
| `transaction.id_category` | withdrawal | 4 | 0 | 1 |
| `transaction.id_cluster` | withdrawal | 0 | 4 | 1 |
| `transaction.informations` | withdrawal | 4 | 0 | 1 |
| `transaction.last_update` | withdrawal | 4 | 0 | 1 |
| `transaction.original_currency` | withdrawal | 0 | 4 | 1 |
| `transaction.original_gross_value` | withdrawal | 0 | 4 | 1 |
| `transaction.original_value` | withdrawal | 0 | 4 | 1 |
| `transaction.original_wording` | withdrawal | 4 | 0 | 1 |
| `transaction.rdate` | withdrawal | 4 | 0 | 1 |
| `transaction.rdatetime` | withdrawal | 0 | 4 | 1 |
| `transaction.simplified_wording` | withdrawal | 4 | 0 | 1 |
| `transaction.state` | withdrawal | 4 | 0 | 1 |
| `transaction.stemmed_wording` | withdrawal | 4 | 0 | 1 |
| `transaction.type` | withdrawal | 4 | 0 | 1 |
| `transaction.value` | withdrawal | 4 | 0 | 1 |
| `transaction.vdate` | withdrawal | 0 | 4 | 1 |
| `transaction.vdatetime` | withdrawal | 0 | 4 | 1 |
| `transaction.webid` | withdrawal | 0 | 4 | 1 |
| `transaction.wording` | withdrawal | 4 | 0 | 1 |

## Types de transactions par type de compte

| Type de compte | Type transaction | Nombre |
|---|---|---:|
| checking | bank | 1 |
| checking | card | 309 |
| checking | deposit | 51 |
| checking | market_order | 139 |
| checking | order | 4 |
| checking | profit | 8 |
| checking | transfer | 345 |
| checking | unknown | 69 |
| checking | withdrawal | 4 |
| market | market_order | 109 |
| market | profit | 8 |
| pea | market_order | 34 |
| savings | bank | 2 |
| savings | transfer | 56 |

## Contreparties par type de transaction

| Type transaction | Objets contrepartie | Label non-null | Compte non-null | Identification non-null | Rôles observés |
|---|---:|---:|---:|---:|---|
| transfer | 100 | 100 | 82 | 82 | creditor, debtor |

## Expansions categories / attachments

| Connexion | Compte | Type de compte | Expansion | HTTP | Pages | Transactions lues | Propriété présente | Transactions non vides | Éléments | Indicateurs fichier | Indicateurs lien | Structure JSON |
|---|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| CONNECTION_01 | ACCOUNT_01 | checking | categories | 200 | 1 | 249 | 0 | 0 | 0 | 0 | 0 |  |
| CONNECTION_01 | ACCOUNT_01 | checking | attachments | 200 | 1 | 249 | 0 | 0 | 0 | 0 | 0 |  |
| CONNECTION_01 | ACCOUNT_02 | checking | categories | 200 | 1 | 49 | 0 | 0 | 0 | 0 | 0 |  |
| CONNECTION_01 | ACCOUNT_02 | checking | attachments | 200 | 1 | 49 | 0 | 0 | 0 | 0 | 0 |  |
| CONNECTION_01 | ACCOUNT_03 | checking | categories | 200 | 1 | 36 | 0 | 0 | 0 | 0 | 0 |  |
| CONNECTION_01 | ACCOUNT_03 | checking | attachments | 200 | 1 | 36 | 0 | 0 | 0 | 0 | 0 |  |
| CONNECTION_01 | ACCOUNT_04 | checking | categories | 200 | 1 | 17 | 0 | 0 | 0 | 0 | 0 |  |
| CONNECTION_01 | ACCOUNT_04 | checking | attachments | 200 | 1 | 17 | 0 | 0 | 0 | 0 | 0 |  |
| CONNECTION_02 | ACCOUNT_05 | checking | categories | 200 | 1 | 63 | 0 | 0 | 0 | 0 | 0 |  |
| CONNECTION_02 | ACCOUNT_05 | checking | attachments | 200 | 1 | 63 | 0 | 0 | 0 | 0 | 0 |  |
| CONNECTION_02 | ACCOUNT_06 | savings | categories | 200 | 1 | 52 | 0 | 0 | 0 | 0 | 0 |  |
| CONNECTION_02 | ACCOUNT_06 | savings | attachments | 200 | 1 | 52 | 0 | 0 | 0 | 0 | 0 |  |
| CONNECTION_02 | ACCOUNT_07 | savings | categories | 200 | 1 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| CONNECTION_02 | ACCOUNT_07 | savings | attachments | 200 | 1 | 6 | 0 | 0 | 0 | 0 | 0 |  |
| CONNECTION_03 | ACCOUNT_08 | pea | categories | 200 | 1 | 34 | 0 | 0 | 0 | 0 | 0 |  |
| CONNECTION_03 | ACCOUNT_08 | pea | attachments | 200 | 1 | 34 | 0 | 0 | 0 | 0 | 0 |  |
| CONNECTION_03 | ACCOUNT_09 | market | categories | 200 | 1 | 117 | 0 | 0 | 0 | 0 | 0 |  |
| CONNECTION_03 | ACCOUNT_09 | market | attachments | 200 | 1 | 117 | 0 | 0 | 0 | 0 | 0 |  |
| CONNECTION_03 | ACCOUNT_10 | checking | categories | 200 | 1 | 516 | 0 | 0 | 0 | 0 | 0 |  |
| CONNECTION_03 | ACCOUNT_10 | checking | attachments | 200 | 1 | 516 | 0 | 0 | 0 | 0 | 0 |  |

## Connectors et comptes

| Connector | Comptes | Transactions | Types de comptes | months_to_fetch |
|---|---:|---:|---|---:|
| La Banque Postale | 3 | 121 | checking, savings | 3 |
| Revolut | 4 | 351 | checking |  |
| Trade Republic | 3 | 667 | checking, market, pea |  |

## Expansions et limites

- `categories` et `attachments` ont été testés par compte avec des requêtes GET séparées ; aucun élément n'a été téléchargé.
- Les colonnes d'indicateurs comptent uniquement la présence de noms de propriétés comme `url`, `file` ou `thumb_url`, jamais leur valeur.
- Les valeurs brutes de `wording`, `counterparty.label`, montants et identifiants sont volontairement exclues de cette matrice.
- Le corpus est celui d'un utilisateur Sandbox et des transactions actives retournées au moment du test ; il ne constitue pas une garantie pour tous les connectors.
- `transaction.state` est conservé comme extension observée ; sa signification métier n'est pas déduite sans corpus/documentation complémentaire.

## Sources

- https://docs.powens.com/api-reference/products/data-aggregation/bank-transactions
- https://docs.powens.com/api-reference/products/data-aggregation/bank-account-types
- https://docs.powens.com/api-reference/user-connections/connectors
- https://docs.powens.com/api-reference/products/data-aggregation/categorization
- https://docs.powens.com/api-reference/products/data-aggregation/transactions-attachments
