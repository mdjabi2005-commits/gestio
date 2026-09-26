# Bilan de catégorisation locale Powens — MVP

Relevé du 2026-09-26. Ce bilan décrit des agrégats produits en mémoire lors
d'une lecture de l'API Powens ; il ne contient ni identifiant bancaire, ni
libellé brut, ni montant individuel, ni secret.

## Périmètre et preuve

- 1 177 transactions ont été lues sur la vue agrégée de l'utilisateur, avec
  pagination suivie.
- Le jeton d'accès a été renouvelé seulement en mémoire pour effectuer les
  lectures ; aucune transaction, catégorie Powens ou métadonnée bancaire n'a
  été modifiée.
- `categories[]` n'a fourni aucune catégorie exploitable. Un `id_category`
  opaque est présent sur les 1 177 lignes et n'est pas interprété.
- Une contrepartie est présente sur 105 lignes. Elle reste une preuve
  facultative, pas une catégorie.

Le rapprochement des virements internes est conservé sans modification :

| Sous-catégorie | Lignes | Confiance |
|---|---:|---:|
| Virement interne exact | 160 | 0,96 |
| Virement interne décalé | 12 | 0,99 |
| **Total Virements internes** | **172** | — |

## Résultat de la passe locale

| Catégorie | Lignes | Sous-catégories |
|---|---:|---|
| Virements internes | 172 | exact 160 ; décalé 12 |
| Hors dépense | 48 | RevPoints 32 ; vérification de carte 16 |
| Revenus | 16 | intérêts de placement 16 |
| Placements | 286 | achats de titres 38 ; ventes de titres 174 ; plan d'épargne 43 ; ordre d'investissement 31 |
| Alimentation | 73 | courses 36 ; restauration 37 |
| Transport | 84 | mobilité 55 ; entretien 14 ; assurance 11 ; péage 3 ; carburant 1 |
| Abonnements | 5 | divertissement numérique 4 ; services numériques 1 |
| Charges fixes | 14 | cotisations 10 ; téléphonie 4 |
| Loisirs | 5 | culture 3 ; don 2 |
| Habillement | 4 | vêtements 4 |
| Santé | 1 | optique 1 |
| Logement | 0 | aucune ligne suffisamment explicite dans ce corpus |
| À revoir | 469 | à qualifier humainement |
| **Total** | **1 177** | |

La passe précédente classait déjà 51 lignes par règle locale. Les règles
ajoutées classent 485 lignes supplémentaires. La file à revoir passe donc de
954 à 469 lignes, sans toucher aux 172 virements internes.

## Règles appliquées et confiance

| Famille de règle | Lignes | Confiance |
|---|---:|---:|
| Ordres de vente de titres | 174 | 0,99 |
| Ordres et plans d'épargne de placement | 112 | 0,98–0,99 |
| Achats de titres | 38 | 0,99 |
| Intérêts de placement | 16 | 0,98 |
| Mobilité et transport collectif | 55 | 0,95 |
| Courses et restauration | 73 | 0,94 |
| Véhicule (entretien, assurance, péage, carburant) | 29 | 0,94–0,96 |
| RevPoints et vérifications de carte | 48 | 0,99 |
| Charges fixes identifiables | 14 | 0,98 |
| Abonnements numériques | 5 | 0,96–0,98 |
| Culture, dons, habillement et optique | 10 | 0,90–0,98 |

Les règles sont déterministes : type Powens lorsque celui-ci identifie sans
ambiguïté une opération de placement, puis fragment de libellé normalisé pour
les catégories documentées. Chaque affectation conserve l'identifiant de la
règle et son niveau de confiance. Le repli explicite reste `À revoir`.

Exemples représentatifs, volontairement non identifiants : un ordre d'achat
de titre, une vente de titre, un paiement de supermarché, un achat de
restauration, un abonnement numérique, une validation temporaire de carte et
un trajet de mobilité. Une paire de mouvements opposés reste classée en
virement interne avant toute règle de libellé.

## Ce qui reste volontairement à qualifier

Les 469 lignes à revoir se répartissent ainsi :

| Type Powens | Lignes |
|---|---:|
| transfer non apparié | 182 |
| card | 172 |
| unknown | 55 |
| deposit | 51 |
| withdrawal | 6 |
| bank | 3 |

Elles concernent 200 familles de libellés, dont 332 occurrences répétées. Le
caractère répété ne suffit pas à décider : transferts vers une personne,
dépôts, retraits, enseignes généralistes, services à usage mixte et libellés
incomplets restent en revue. Parmi ces 469 lignes, 61 portent une
contrepartie, mais celle-ci ne prouve pas à elle seule la nature de la dépense
ou du revenu.

Limites connues :

- aucune catégorie Powens développée n'est disponible pour corroborer les
  règles locales ;
- les vérifications de carte sont isolées hors dépense, mais doivent être
  revues si elles deviennent des opérations définitives ;
- les virements non appariés ne sont jamais assimilés automatiquement à des
  revenus, dépenses ou virements internes ;
- les règles locales vivent dans le lab ignoré et n'embarquent aucune donnée
  bancaire réelle.

## Validations

- `npm run lint` dans `.lamoms/lab` : réussi ;
- `npm run smoke` dans `.lamoms/lab` : réussi (`5/5`) ;
- `npm run build` dans `.lamoms/lab` : réussi (57 modules transformés) ;
- relecture API finale : 1 177 lignes, 172 virements internes conservés,
  536 affectations locales et 469 lignes en revue.
