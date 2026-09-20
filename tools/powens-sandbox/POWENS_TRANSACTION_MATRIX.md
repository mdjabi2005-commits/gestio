# Powens Sandbox - matrice transactionnelle

- Corpus : transactions actives retournées par `GET /users/{userId}/transactions`, pagination suivie jusqu'à la fin.
- Le rapport ne conserve aucun montant, libellé, identifiant, token, secret ou valeur brute.
- Transactions analysées : 1139
- Comptes analysés : 10
- Pages transactionnelles lues : 2
- Champs top-level observés dans la réponse de base : 40
- Sous-champs JSON observés : 4

## Document de travail

Cette matrice sert à passer de la réponse JSON Powens à un modèle compréhensible
et affichable dans Gestio. Elle réunit trois niveaux qu'il faut conserver
séparés :

1. **Contrat documenté** : ce que Powens promet dans sa documentation ;
2. **Observation Sandbox** : ce qui a effectivement été reçu dans le corpus ;
3. **Règle Gestio proposée** : la manière de présenter ou de modéliser ces
   données, à valider avant de la transformer en contrat produit.

La présence d'un champ dans le corpus ne suffit donc pas à en faire un champ
obligatoire. De même, l'absence d'un champ dans ce corpus ne suffit pas à
conclure qu'il est impossible pour tous les connecteurs.

### Ordre de lecture

| Partie | Question à laquelle elle répond |
|---|---|
| Matrice connexion / compte | Dans quels supports le corpus a-t-il été observé ? |
| Matrice des champs | Quel est le statut du champ, sa couverture et ses types observés ? |
| Matrice champ × type de transaction | Avec quels `type` le champ a-t-il été observé ? |
| Dépendances de contrat et de ressources | Quelle condition explique la présence, l'absence ou le sens du champ ? |
| Catégorisation Powens | Comment utiliser la classification fournisseur sans la confondre avec une pocket Gestio ? |
| Expansions et limites | Qu'est-ce qui a réellement été demandé et reçu dans le Sandbox ? |

### Vocabulaire de travail

| Terme | Usage dans Gestio | Source et limite |
|---|---|---|
| **Mouvement** | Terme neutre d'affichage pour un événement financier présenté à l'utilisateur | Ce n'est pas une ressource Powens ; la ressource d'origine doit rester conservée |
| **Transaction bancaire** | Mouvement porté par `/transactions`, avec un montant, des dates et un état de comptabilisation éventuel | Un objet peut être `coming` ou supprimé ; « transaction » ne signifie donc pas automatiquement « définitivement comptabilisé » |
| **Ordre de marché** | Instruction ou cycle de vie d'investissement présenté avec ses propres informations | Ressource distincte `/marketorders` ; ne pas le fabriquer à partir d'un simple `type=market_order` |
| **Catégorie** | Classification fournie par Powens lorsqu'elle est disponible | Classification hiérarchique ; elle ne devient pas automatiquement une pocket personnalisable |
| **Pocket** | Construction métier Gestio pour regrouper des dépenses ou affecter de l'épargne | À ne pas confondre avec une catégorie fournisseur |

### Les axes qui conditionnent le schéma

| Axe déterminant | Ce qu'il conditionne | Ce qu'il ne permet pas de déduire seul |
|---|---|---|
| Ressource appelée | Le schéma de base : transaction bancaire ou ordre de marché | Une correspondance automatique entre les deux ressources |
| `transaction.type` | La famille sémantique et le présentateur à utiliser (`transfer`, `card`, `profit`, `market_order`, etc.) | La présence de tous les champs propres à cette famille |
| `coming` | Le libellé d'état « à venir » / non comptabilisé | L'absence de montant ou l'absence de date |
| `active` | L'inclusion dans les services et synthèses PFM | La comptabilisation du mouvement |
| `deleted` | Le fait qu'un mouvement a été retiré et qu'il n'est normalement plus dans la liste standard | Une annulation métier ou un remboursement |
| `rdate`, `date`, `vdate` | Le libellé de la date à afficher : ordre, comptabilisation ou valeur | Qu'une date absente puisse être remplacée par une autre sans le signaler |
| Présence de `counterparty` | La possibilité de lire ses sous-champs (`label`, compte, rôle) | Qu'une contrepartie existe pour chaque type de mouvement |
| Activation de la fonctionnalité + `expand=categories` | La disponibilité des catégories Powens | Qu'un `id_category` observé suffise à reconstruire la hiérarchie |
| Activation de la fonctionnalité + `expand=attachments` | La disponibilité des pièces jointes | Qu'une réponse HTTP 200 contienne effectivement des pièces |
| Connector, type de compte et période synchronisée | La couverture réellement observable | Une règle métier universelle sur le type de mouvement |

### Règle de présentation humaine

Le présentateur ne doit pas afficher le JSON brut. Il compose une fiche à partir
des champs disponibles et de leurs dépendances :

1. un intitulé humain construit à partir du type et du libellé disponible ;
2. le montant et la devise s'ils sont réellement présents ;
3. des dates nommées selon leur rôle (`passée le`, `comptabilisée le`, `valeur le`) ;
4. un état indépendant pour `à venir`, `active` et `deleted` ;
5. la catégorie fournisseur, si elle est reçue, séparée des classifications
   propres à Gestio ;
6. les métadonnées techniques dans un niveau de détail secondaire.

Une donnée absente doit être affichée comme **non disponible** ou être masquée
selon le niveau de détail. Elle ne doit jamais être remplacée par zéro, par une
date voisine ou par une relation supposée.

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

Cette table mesure une cooccurrence dans le corpus. Elle ne transforme pas un
`100 % non-null` observé en obligation de schéma et ne transforme pas un champ
rare en champ réservé à un seul `type`. Pour décider de l'affichage, il faut
croiser cette table avec les axes de dépendance et la ressource appelée.

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

## Dépendances de contrat et de ressources

La présence d'un `type` ne suffit pas à déduire tout le schéma d'un élément. Le
type fixe surtout une famille sémantique et un vocabulaire d'affichage ; les
autres champs restent optionnels ou dépendent d'un état, d'une activation de
produit, d'une expansion ou de la disponibilité du connecteur.

### Ce que le type fixe réellement

| Situation | Relation observée ou documentée | Règle de travail |
|---|---|---|
| `transaction.type` quel que soit sa valeur | Le type est un enum de la ressource Transaction | Choisir une famille de présentation, puis vérifier les champs présents ; ne pas construire un sous-schéma obligatoire uniquement à partir du type |
| `type = transfer` | `counterparty` est documenté comme facultatif ; dans le corpus, les 100 objets de contrepartie observés sont associés à des transferts | Présenter le bénéficiaire ou l'émetteur si l'objet existe ; conserver une vue de transfert même lorsqu'il manque |
| `type = market_order` dans `/transactions` | La valeur existe dans le flux transactionnel, mais les détails d'ordre appartiennent à la ressource `/marketorders` | Afficher un mouvement lié à un ordre seulement avec les données reçues ; ne pas ajouter quantité, prix ou état d'ordre par supposition |
| `type = order` | Quatre occurrences sont observées dans le corpus, sans contrat local suffisant pour les assimiler à un ordre de marché | Garder une présentation générique et documenter la relation seulement après preuve sur la ressource concernée |
| `type = bank`, `card`, `deposit`, `profit` ou `withdrawal` | La valeur choisit une famille sémantique, mais le corpus ne démontre pas un ensemble de champs exclusif et obligatoire pour chacune | Utiliser le socle commun puis enrichir avec chaque champ réellement présent |
| `categories` quel que soit le `type` | La classification dépend de l'activation Powens et de l'expansion, pas de la valeur de `type` | Traiter la catégorie comme une extension indépendante et conserver ses niveaux `parent_code` / `code` |

La bonne dépendance à retenir est donc :

```text
ressource → type → présentateur
                    ↘ champs réellement présents
état / activation / expansion / connector → disponibilité des champs
```

### Dépendances officielles de la ressource Transaction

| Condition ou relation | Conséquence de contrat | Confiance |
|---|---|---|
| `type` | Choisit la nature documentée (`card`, `transfer`, `profit`, `market_order`, etc.) ; ne garantit pas à lui seul la présence d'un sous-ensemble complet de champs | officielle |
| `coming = true` | Le mouvement n'est pas encore comptabilisé sur le compte | officielle |
| `active = false` | Powens l'ignore dans ses synthèses et sommes ; ce n'est pas la même information que « à venir » | officielle |
| `deleted != null` | Le mouvement a été retiré par la banque ; la liste standard l'exclut, `all` permet de le demander | officielle |
| `rdate` / `rdatetime` | Date de passation de l'ordre | officielle |
| `date` / `datetime` | Date de comptabilisation sur le compte | officielle |
| `vdate` / `vdatetime` | Date de valeur ; souvent égale à `date`, mais à conserver séparément | officielle |
| `bdate` / `bdatetime` | Date affichée par la banque, désormais déconseillée au profit de `date` / `datetime` | officielle |
| `value` | Montant de la transaction ; la documentation le déclare nullable, même si le corpus local l'a toujours renseigné | officielle + observée |
| `gross_value`, `commission`, `original_value`, `original_currency` | Détails monétaires conditionnels ; leur absence ne signifie pas que le mouvement est invalide | officielle |
| `counterparty` | Objet facultatif ; ses sous-champs (`label`, compte, rôle) ne sont valides que si l'objet existe | officielle |
| `counterparty.type` | Rôle documenté `creditor` ou `debtor`, uniquement interprétable avec une contrepartie | officielle |
| `categories` | Disponible seulement si la catégorisation est activée et demandée par `expand=categories` | officielle |
| `attachments` | Disponible seulement si la capacité est activée et demandée par `expand=attachments` | officielle |

Les états `coming`, `active` et `deleted` doivent donc être modélisés comme des
axes distincts. Il ne faut pas les réduire à un seul enum `BOOKED/PENDING` sans
conserver l'information fournisseur.

### Ressource MarketOrder : schéma séparé

`transaction.type = market_order` est une valeur de l'enum TransactionType,
mais `/transactions` et `/marketorders` sont deux ressources différentes. La
ressource `MarketOrder` porte les propriétés propres à un ordre de marché :

| Condition ou relation | Champs concernés | Règle d'affichage |
|---|---|---|
| Direction de l'ordre | `order_direction.name` = `BUY` ou `SALE` | Afficher « achat » ou « vente », jamais seulement `market_order` |
| Type d'ordre | `order_type.name` = `MARKET`, `LIMIT`, `TRIGGER`, `UNKNOWN` | Afficher le type ; montrer `ordervalue` seulement pour les types où il s'applique |
| État de l'ordre | `state` | Pilote le texte « en attente », « exécuté », etc. ; ne pas le confondre avec `coming` d'une transaction bancaire |
| Cycle de vie | `date`, `execution_date`, `validity_date` | Afficher trois dates nommées : création, exécution, validité ; chacune peut être absente selon l'état |
| Mode de paiement | `payment_method` = `CASH`, `DEFERRED`, `UNKNOWN` | Donne le contexte du règlement ; ne prouve pas à lui seul qu'une transaction bancaire correspondante existe |
| Exécution | `quantity`, `amount`, `unitprice` | Les valeurs peuvent être absentes avant l'exécution ; les présenter comme inconnues, jamais comme zéro |
| Synchronisation / suppression | `last_update`, `deleted` | Distinguer dernière observation et ordre supprimé |

Les ordres de marché disposent donc d'une vue de détail propre. Un débit ou un
crédit bancaire lié à l'ordre ne doit être créé dans Gestio que lorsqu'il est
observé comme transaction monétaire ; il ne doit pas être inventé à partir du
seul `type`.

### Conséquence pour la matrice et l'affichage

| Niveau | Contenu |
|---|---|
| Socle commun | Identité, compte, type fournisseur, libellé, montant/devise si présent, dates disponibles, état de visibilité |
| Extension transaction bancaire | Comptabilisation, valeur, contrepartie, commission, devise d'origine, catégories, pièces jointes |
| Extension ordre de marché | Instrument, direction, type d'ordre, état, dates d'ordre, quantité, prix, montant et mode de paiement |
| Technique | Identifiants, `webid`, `date_scraped`, `last_update`, état brut et payload original ; replié par défaut |

La règle retenue pour l'interface est donc : **le type choisit la présentation,
la présence réelle et la dépendance documentée des champs choisissent le contenu**.
Une absence est affichée comme « non disponible » ou masquée selon le niveau de
détail ; elle n'est jamais remplacée par zéro ou par une valeur déduite.

Sources officielles :

- [Bank transactions](https://docs.powens.com/api-reference/products/data-aggregation/bank-transactions)
- [Transactions integration guide](https://docs.powens.com/documentation/integration-guides/transactions/transactions-integration-guide)
- [Market orders](https://docs.powens.com/api-reference/products/wealth-aggregation/market-orders)
- [Wealth and loans integration guide](https://docs.powens.com/documentation/integration-guides/wealth-and-loans)
- [Categorization](https://docs.powens.com/api-reference/products/data-aggregation/categorization)
- [Transactions attachments](https://docs.powens.com/api-reference/products/data-aggregation/transactions-attachments)

## Contrats métier candidats issus de la matrice champ × type

Les contrats ci-dessous sont des **propositions de travail**. Ils traduisent les
relations observées en règles lisibles par Gestio, mais ne valent pas encore
validation métier ou décision d'architecture.

### Contrat commun : mouvement affichable

| Bloc | Champs candidats | Condition | Règle métier proposée |
|---|---|---|---|
| Identité | `id`, `id_account`, `type` | Objet issu de `/transactions` | Identifier le mouvement et conserver son type Powens sans le remplacer par un libellé local |
| Libellé | `wording`, `simplified_wording`, `original_wording` | Au moins un libellé disponible | Choisir un libellé humain ; garder le libellé brut en détail |
| Montant | `value`, `original_value`, devises | Valeur et devise présentes ou nulles | Afficher le montant réellement reçu ; ne jamais transformer `null` en zéro |
| Temps | `date` / `datetime`, puis `rdate` / `vdate` | Une ou plusieurs dates présentes | Afficher chaque date avec son rôle ; ne pas les fusionner silencieusement |
| Cycle de vie | `coming`, `active`, `deleted` | Champs présents | Afficher trois états indépendants ; ne pas fabriquer un unique statut `pending` |
| Classification | `categories[]` | Fonction activée, expansion demandée et propriété reçue | Afficher la classification fournisseur séparément des concepts métier Gestio |
| Technique | `webid`, `date_scraped`, `last_update`, extensions | Niveau de détail secondaire | Conserver pour le diagnostic, replier dans l'interface courante |

Ce contrat commun définit ce qu'un présentateur peut tenter d'afficher. Il ne
rend pas tous les champs obligatoires : un mouvement peut rester compréhensible
avec une date ou une devise indisponible, à condition que cette absence soit
visible.

### Extensions conditionnelles

| Extension | Déclencheur | Champs concernés | Ce que le contrat garantit |
|---|---|---|---|
| Contrepartie | `counterparty` est un objet non nul, souvent observé avec `transfer` | `label`, `account_scheme_name`, `account_identification`, `type` | Une contrepartie détaillée peut être affichée ; son absence ne rend pas le transfert invalide |
| Ordre de marché | Données reçues depuis `/marketorders` | direction, type d'ordre, état, dates, quantité, prix, montant | Une vue d'ordre dédiée ; ces champs ne doivent pas être inventés depuis `/transactions` |
| Catégorisation fournisseur | Activation Powens + `expand=categories` + `categories[]` présent | `parent_code`, `code` | Une classification hiérarchique peut être affichée ; elle n'est pas une pocket |
| Pièces jointes | Activation + `expand=attachments` + éléments reçus | `attachments[]` | Un accès aux pièces peut être proposé ; HTTP 200 seul ne suffit pas |

### Invariants à conserver dans le contrat

| Invariant | Conséquence |
|---|---|
| `type` choisit une famille, pas un schéma complet | Le présentateur vérifie chaque champ avant de l'utiliser |
| `coming`, `active` et `deleted` sont indépendants | Aucun ne doit être déduit des deux autres |
| Absence et valeur nulle ne signifient pas zéro | L'interface distingue « non disponible » de « montant nul » |
| Catégorie Powens et pocket Gestio sont différentes | Une catégorie fournisseur ne crée ni ne modifie une pocket |
| `market_order` dans `/transactions` et objet `/marketorders` sont différents | Aucun ordre bancaire ou détail d'investissement n'est créé par supposition |
| Cooccurrence observée et obligation de contrat sont différentes | Les taux de la matrice servent d'évidence, pas de validation automatique |

### Positions métier exprimées — proposition de contrat

Les réponses données pour cette première passe modifient le statut de plusieurs
questions : elles deviennent des positions de travail, sans être encore une
décision d'architecture irréversible.

| Sujet | Position de travail | Conséquence pour le contrat |
|---|---|---|
| Nature du flux | Faire confiance au `type` Powens comme classification fournisseur ; traiter `unknown` explicitement lorsque l'API le retourne | Ne pas reconstruire par défaut une classification locale concurrente ; conserver le type brut et prévoir un présentateur générique pour `unknown` |
| Libellé d'origine | `original_wording` doit rester la trace du libellé bancaire reçu | Ne jamais l'écraser avec une correction utilisateur |
| Libellé utilisateur | `wording` est le libellé personnalisable ; `comment` est une note distincte | Rendre ces métadonnées modifiables dans l'interface sans modifier l'identité du mouvement |
| Priorité d'affichage du libellé | Afficher d'abord le libellé bancaire d'origine ; après modification, afficher le libellé choisi par l'utilisateur | Conserver `original_wording` comme référence, afficher `wording` comme libellé courant après édition, et montrer `comment` séparément |
| Autres métadonnées modifiables | La référence locale documente aussi `application_date`, `categories` et `active` comme propriétés modifiables par le POST Powens | Traiter ces modifications comme des actions séparées, avec confirmation et journalisation ; ne pas les confondre avec le libellé bancaire |
| Unicité | Un libellé peut aider l'humain, mais il est modifiable et ne constitue pas une identité | Utiliser une clé technique fondée sur la source, la ressource, le compte et l'identifiant Powens (`id`), jamais sur `wording` |
| Parsing | Un mouvement déjà identifié peut être normalisé une première fois puis retrouvé par son identité technique | Rejouer le parsing si les données source pertinentes changent ; une simple correction de `wording` ne doit pas créer un nouveau mouvement |
| Champs techniques | Ils sont surtout utiles au développeur, mais certains peuvent aider un utilisateur en détail ou en support | Les conserver dans le modèle et les rendre accessibles dans un niveau avancé, sans les afficher par défaut |
| Catégorie « sélectionnée » | Dans la question précédente, « sélectionner » désignait le choix d'affichage ou de traitement ; Powens fournit d'abord une catégorie, ce n'est pas automatiquement un choix utilisateur | Séparer catégorie fournisseur reçue, éventuel remplacement manuel et pocket Gestio ; ne pas appeler une catégorie Powens une pocket |

Les propriétés documentées comme modifiables sont `wording`, `comment`,
`application_date`, `categories` et `active`. La structure exacte d'écriture de
`categories` reste toutefois à vérifier avant tout POST, car la documentation
Powens présente une incohérence de type.

### Questions métier que la matrice ne tranche pas encore

- quelle relation stable, s'il en existe une, rattache un `market_order` à une
  transaction monétaire ;

Le principe d'affichage des champs techniques est désormais fixé : ils ne sont
pas affichés dans les écrans courants ; ils restent conservés et peuvent être
exposés uniquement dans un détail avancé ou un contexte de support lorsque cela
répond à un besoin réel.

La question de l'absence de catégorie ne constitue plus une alternative métier
pour le produit : le chemin nominal s'appuie sur les catégories Powens. Si
`categories[]` manque malgré ce contrat, il s'agit d'une indisponibilité
technique ou d'une activation incomplète ; Gestio ne doit ni inventer une
catégorie ni recréer automatiquement un moteur local concurrent. La réaction
visible exacte (information, écran partiellement disponible ou blocage d'un
calcul) reste à préciser écran par écran.

## Matrice écrans × données nécessaires

Cette matrice répond à la question : **quelles données sont nécessaires pour
répondre à la question de chaque écran ?** Elle ne demande pas d'afficher tous
les champs disponibles. Un écran reçoit un état préparé ; il ne rend jamais le
JSON Powens directement.

### Niveaux de données

| Niveau | Données | Règle d'affichage |
|---|---|---|
| Socle mouvement | `id`, `id_account`, `type`, `value`, devise si disponible, `date` / `datetime`, un libellé (`wording`, `simplified_wording` ou `original_wording`) | Utilisé pour identifier, calculer et afficher un mouvement ; l'identifiant reste technique |
| État et périmètre | `coming`, `active`, `deleted`, puis le traitement dérivé (`INTERNAL_NEUTRAL`, `INCOME_CANDIDATE`, `EXPENSE_CANDIDATE`, `TO_REVIEW`) | Filtrer et expliquer sans confondre « à venir », « actif » et « supprimé » |
| Classification | `categories[]` avec `parent_code` et `code`, après activation et expansion | Utilisé pour les regroupements et les libellés humains ; jamais affiché comme JSON et jamais transformé en pocket par défaut |
| Contexte conditionnel | `counterparty.*`, dates `rdate` / `vdate`, `comment`, pièces jointes, détails d'ordre | Affiché uniquement lorsqu'il répond à la question de l'écran ou lorsque l'utilisateur ouvre le détail |
| Technique | `webid`, `date_scraped`, `last_update`, `state`, payload source et identifiants de rapprochement | Conservé pour synchronisation, support et diagnostic ; replié par défaut |

### Besoin par écran

| Parcours / écran | Réponse attendue par l'utilisateur | Données métier indispensables | Champs Powens qui alimentent ces données | À ne pas afficher par défaut |
|---|---|---|---|---|
| Première ouverture — Deux questions | Donner une estimation d'épargne et une intention | Saisie utilisateur, état de l'étape | Aucun champ de transaction ; l'import vient après | Tout mouvement avant l'import |
| Première ouverture — Import du relevé | Faire entrer les mouvements sans doublon | Payload source, source, compte, identité technique, rapport d'import | `id`, `id_account`, `date`, `value`, `type`, libellés et état source | JSON brut, tokens, métadonnées de synchronisation |
| Première ouverture — Solde du mois | Comprendre où part l'argent sur une période | Période, couverture, revenus, dépenses, catégories, exclusion des virements internes | `id`, `id_account`, `value`, `date`, `type`, `active`, `coming`, `deleted`, `categories[]`; `counterparty` et libellés pour rapprocher les transferts | `webid`, `date_scraped`, `last_update`, payload |
| Première ouverture — Arbitrage des grosses lignes | Reconnaître ou corriger une ligne importante | Identité, libellé humain, montant, date, type, catégorie fournisseur, contrepartie si présente | `id`, `wording` / `simplified_wording` / `original_wording`, `value`, `date`, `type`, `categories[]`, `counterparty.*` | `id` technique en présentation principale, état brut et JSON |
| Première ouverture — Confirmer les récurrences | Dire si une série revient et si son montant est imposé | Série de mouvements, libellé, montants, dates, nature de fréquence, identité des lignes | `id`, libellés, `value`, `date`, `type`, `active`, `coming` | Toutes les dates techniques et le détail fournisseur non nécessaire à la décision |
| Première ouverture — Vital ou plaisir | Qualifier les catégories de dépenses | Catégorie Powens mappée, total observé, période, décision `VITAL` ou `PLEASURE` | `categories[]`, `value`, `date`, traitement interne déjà exclu | Libellé bancaire de chaque ligne, identifiants et champs de synchronisation |
| Première ouverture — Objectif et financement | Dire combien atteindre et quelles économies affecter | Soldes des comptes/supports d'épargne, cible, échéance, affectations utilisateur | Principalement comptes et soldes ; les transactions servent seulement à établir les soldes/couverture | Détail des mouvements courants |
| Simulation — Simulation | Comprendre l'effet d'une enveloppe choisie | Seuil bas, seuil haut, enveloppe, répartition observée, capacité, projection d'objectif | Agrégats calculés à partir des mouvements classés ; aucune ligne Powens n'est affichée | Libellés, catégories brutes, identifiants |
| Simulation — Créer une poche | Nommer et qualifier une nouvelle poche | Nom, marque `VITAL` / `PLEASURE`, enveloppe proposée | Agrégat historique éventuellement utilisé pour proposer une valeur | Toute métadonnée transactionnelle |
| Usage courant — Budget libre | Savoir combien dépenser jusqu'à la prochaine entrée | Solde courant, horizon, engagements, trois mouvements à venir et trois récents, alertes | Pour le solde et les lignes : `id_account`, `value`, `date`, libellé, `type`, `coming`, `active`, `deleted`; le rapprochement interne utilise aussi `counterparty.*` | `original_wording` si un libellé utilisateur existe déjà, JSON et champs techniques |
| Usage courant — Alerte de liquidité | Comprendre quel compte risque un rejet | Compte concerné, solde daté, engagement, date, montant, déficit | `id_account`, `value`, `date`, libellé si nécessaire ; données de compte et engagements calculés | Détails techniques et catégories sans rapport avec le risque |
| Usage courant — Planifier une dépense | Ajouter explicitement une sortie future | Montant, échéance, compte, catégorie Powens affichable, nature, lien éventuel avec une transaction réalisée | Catégories `categories[]` pour les choix ; `id_account` pour le compte ; `id` uniquement au rapprochement ultérieur | Payload source et états techniques |
| Usage courant — Dépenses du mois | Voir le réel par rapport au plafond | Mois, dépenses cumulées, catégories, lignes du mois, traitement des internes | `value`, `date`, `type`, `categories[]`, libellé humain, `id_account`, rapprochement interne | `rdate`, `vdate`, `date_scraped`, `webid` sauf détail avancé |
| Point de situation — Point de situation | Savoir si la trajectoire est tenue | Épargne affectée, courbes réelle/référence, écart, conséquence, arbitrages | Agrégats : `value`, `date`, `type`, catégories et nature récurrente ; les lignes ne sont pas le contenu dominant | Liste brute des mouvements et métadonnées techniques |
| Point de situation — Enveloppes de vie | Comparer dépensé et prévu par poche | Total dépensé, enveloppe, période, catégorie → poche, dépassement | `value`, `date`, `categories[]`, traitement interne, périodes | Libellés et détails de chaque mouvement |
| Point de situation — Poche | Comprendre ce qui produit le dépassement | Poche, enveloppe, contribution, trois plus grosses sorties, lien d'ajustement | `value`, `date`, libellé humain, `id`, catégorie Powens mappée, traitement interne | `id` en texte courant, compte et détails techniques sauf demande |
| Point de situation — Transactions | Consulter la liste complète d'une poche | Liste filtrée, triée et datée, libellé utilisateur/original, montant, catégorie, commentaire éventuel | `id`, `value`, `date`, `id_account`, `type`, `categories[]`, `wording`, `original_wording`, `comment` | JSON brut, `webid`, synchronisation et détails non pertinents |

### Conséquence pour le contrat de modèle

Le modèle actuel `NormalizedTransaction` couvre une partie du socle
(`id`, compte, dates, montant, devise, libellés normalisés, contrepartie et
rapprochement), mais ne porte pas encore explicitement `type`,
`categories[]`, `comment`, `wording`, `original_wording`, `coming`, `active` et
`deleted` comme données Powens distinctes. La matrice d'écran ne justifie pas
de les ajouter tous à tous les écrans : elle montre plutôt que la normalisation
doit conserver ces informations, puis que chaque état de présentation ne doit
projeter que son sous-ensemble.

Le code contient encore un classement local dans
`shared/src/commonMain/kotlin/com/gestio/core/categorization/Categorization.kt`
et un repli `non catégorisé`. Ce fait est conservé comme écart technique à
résoudre ; il ne remplace pas la position métier actuelle qui fait de Powens la
source de classification attendue. Aucune suppression de code n'est décidée
dans cette matrice.

### Règle de lecture finale

Pour construire un état d'écran :

```text
source Powens → normalisation conservant les champs utiles →
classification/rapprochement dérivés → agrégat métier → état d'écran →
présentation humaine
```

Le `type` choisit la famille de présentation et participe aux règles de
traitement, mais il ne rend pas automatiquement tous les champs d'une
transaction obligatoires. Les écrans décident du sous-ensemble visible ; la
présence du champ dans le JSON décide seulement de ce qui peut être calculé ou
signalé comme indisponible.

## Comptabilisation et virements internes

Le type `transfer` ne suffit pas à dire si l'argent est réellement entré ou
sorti de la situation financière de l'utilisateur. Il faut distinguer le
mouvement observé sur un compte de son effet sur le périmètre Gestio.

### Trois niveaux à ne pas mélanger

| Niveau | Question | Traitement d'un virement A → B entre deux comptes inclus |
|---|---|---|
| Compte | Que s'est-il passé sur ce compte précis ? | Sortie sur A et entrée sur B |
| Périmètre Gestio | L'argent est-il entré dans l'ensemble des comptes suivis ou en est-il sorti ? | Effet net nul |
| Synthèse métier | Est-ce un revenu ou une dépense ? | Ni revenu ni dépense |

Le virement interne doit donc rester visible dans l'historique et modifier les
soldes propres aux comptes, mais il ne doit pas gonfler les revenus, les
dépenses, les catégories de dépenses ou la capacité calculée à partir de ces
flux. Un transfert d'un compte courant vers un compte d'épargne peut toutefois
modifier le budget libre ou la disponibilité d'un compte : c'est un changement
de répartition de liquidité, pas une dépense.

### Contrat de flux dérivé

| Donnée dérivée | Valeurs de travail | Rôle |
|---|---|---|
| Type fournisseur | Valeur Powens brute, par exemple `transfer` | Conserver la classification source |
| Sens sur le compte | `IN` ou `OUT` | Décrire la variation du compte à partir du montant normalisé |
| Périmètre | `INTERNAL`, `EXTERNAL_IN`, `EXTERNAL_OUT`, `UNKNOWN` | Dire si l'argent reste dans le périmètre suivi |
| Traitement comptable | `INTERNAL_NEUTRAL`, `INCOME_CANDIDATE`, `EXPENSE_CANDIDATE`, `TO_REVIEW` | Décider ce qui entre dans les agrégats, sans le déduire du seul `type` |
| Rapprochement | Identifiant commun des deux jambes, ou absence | Relier la sortie A et l'entrée B sans fusionner les événements bruts |

`EXTERNAL_IN` et `EXTERNAL_OUT` décrivent d'abord un franchissement du périmètre
Gestio. Ils ne doivent pas être automatiquement renommés « revenu » ou
« dépense » sans règle métier complémentaire : un apport, un remboursement, un
prêt ou un transfert vers un tiers peuvent avoir des traitements différents.

### Invariant d'un virement interne confirmé

Un virement interne est confirmé lorsque deux mouvements peuvent être reliés
avec suffisamment de preuves :

- montants opposés et même devise ;
- comptes différents mais inclus dans le périmètre Gestio ;
- dates de comptabilisation compatibles ;
- indice de virement dans les libellés ou les données fournisseur ;
- contrepartie qui prouve que le compte opposé appartient bien au même périmètre.

Pour une paire confirmée de montant `x` :

```text
compte A       : -x
compte B       : +x
périmètre      :  0
revenus        :  0
dépenses       :  0
historique     : 2 jambes reliées, ou 1 mouvement groupé avec détail
```

La classification interne doit être appliquée avant la catégorisation des
dépenses : un virement confirmé ne reçoit pas une pocket de dépense.

### État actuel du code et risque à traiter

`shared/src/commonMain/kotlin/com/gestio/core/transfers/Transfers.kt` rapproche
actuellement les deux jambes avec les critères ci-dessus, puis
`Balance.kt`, `DepensesDuMois.kt` et la catégorisation excluent les identifiants
rapprochés des agrégats de revenus et de dépenses.

Le risque restant est explicite : une jambe qui ressemble à un virement mais
qui ne trouve pas sa contrepartie retombe aujourd'hui sur le calcul par signe.
Elle peut alors être comptée comme dépense ou revenu. Le contrat cible doit
prévoir un état `TO_REVIEW` ou équivalent pour rendre ces cas visibles avant de
les intégrer définitivement dans les agrégats.

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

## Catégorisation Powens

### Contrat documenté

La catégorisation Powens est une fonctionnalité distincte de l'agrégation des
transactions et n'est pas activée par défaut sur un domaine. Lorsqu'elle est
active, `GET /users/{userId}/transactions?expand=categories` ajoute à chaque
transaction une propriété `categories` sous forme de tableau d'objets :

```text
categories[]
├── code        catégorie enfant
└── parent_code famille parente ou null
```

La catégorisation Powens est donc une classification hiérarchique fournie par
le fournisseur. Elle ne constitue pas, par elle-même, une pocket Gestio
personnalisable. La documentation expose également une mise à jour des
catégories via `POST /users/{userId}/transactions/{transactionId}`, mais cette
écriture n'a pas été exécutée dans la mission de lecture seule ; la forme exacte
du corps doit être vérifiée avant toute utilisation.

### Résultat dans le corpus Sandbox

Les expansions `categories` ont répondu HTTP 200 pour les dix comptes testés,
mais la propriété n'était présente dans aucune des 1 139 transactions et aucun
élément n'a été retourné. Le champ observé `transaction.id_category` est une
extension distincte, avec une seule valeur distincte anonymisée ; il ne permet
pas de reconstruire la hiérarchie `code` / `parent_code`.

Conclusion : le contrat Powens permet de remplacer un moteur local de
classification automatique, mais l'activation et la réception effective des
catégories ne sont pas encore démontrées dans ce Sandbox.

### Règle de modélisation proposée

| Donnée Powens | Rôle Gestio | Règle |
|---|---|---|
| `categories[].parent_code` | Famille de classification | Conserver comme niveau parent, sans le transformer en pocket |
| `categories[].code` | Catégorie fournisseur | Conserver le code et afficher un libellé humain mappé |
| Tableau `categories[]` | Classification d'une transaction | Conserver le tableau ; ne pas l'écraser prématurément en catégorie unique |
| Absence de `categories` sur le chemin nominal | Indisponibilité technique | Signaler une activation ou une réception incomplète ; ne pas inventer de catégorie et ne pas réactiver automatiquement une classification locale concurrente |

Si l'activation Powens est confirmée, le concept de **pocket de gestion servant
uniquement à classer les transactions** devient inutile. Il faudra alors
supprimer ou désactiver ce seul mécanisme local, sans confondre cette décision
avec les éventuelles poches d'épargne ou qualifications personnelles du
produit.

Source officielle : [Categorization](https://docs.powens.com/api-reference/products/data-aggregation/categorization)
et [Bank transactions](https://docs.powens.com/api-reference/products/data-aggregation/bank-transactions).

## Points à fermer avant le contrat Gestio

Cette section empêche de confondre une hypothèse de travail avec une décision
validée :

| Point | État actuel | Preuve ou décision attendue |
|---|---|---|
| Activation de la catégorisation sur le domaine Sandbox | À confirmer auprès de Powens | Après activation, refaire un GET avec `expand=categories` et constater `categories[]` sur des transactions |
| Libellés humains des codes Powens | À définir | Choisir la source de traduction ou afficher temporairement le code avec son parent |
| Catégorie fournisseur versus pocket Gestio | Proposition de séparation | Validation métier avant de supprimer toute classification locale existante |
| Lien entre `transaction.type = market_order` et `/marketorders` | Non démontré | Identifier une relation stable avant de fusionner les vues |
| Corps exact du POST de mise à jour des catégories | Non vérifié | Ne rien écrire avant résolution de l'incohérence de documentation et validation dans le Sandbox |
| Réaction à une absence de `categories` | Position de travail : ce n'est pas une catégorie métier | Afficher une indisponibilité technique selon l'écran ; ne pas inventer de catégorie et ne pas lancer de classification locale concurrente |

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
