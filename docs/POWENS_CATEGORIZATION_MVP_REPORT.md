# Bilan de catégorisation locale Powens — passe complète

Relevé du 2026-09-27. Ce bilan contient uniquement des agrégats produits en
mémoire lors d'une lecture de l'API Powens : aucun identifiant bancaire,
libellé brut, montant individuel ou secret n'est enregistré.

## Périmètre et preuve

- 1 177 transactions ont été lues sur la vue agrégée de l'utilisateur, avec
  pagination suivie.
- Le jeton d'accès a été renouvelé seulement en mémoire afin d'effectuer les
  lectures ; aucune transaction, catégorie Powens ou métadonnée bancaire n'a
  été modifiée.
- `categories[]` ne fournit aucune catégorie exploitable. Un `id_category`
  opaque est présent mais n'est pas interprété.
- Le rapprochement des virements internes est inchangé : 80 paires exactes
  (160 lignes) et 6 paires décalées (12 lignes), soit 172 lignes au total.

## Résultat final

| Catégorie | Lignes | Sous-catégories |
|---|---:|---|
| Virements internes | 172 | exact 160 ; décalé 12 |
| Hors dépense | 48 | RevPoints 32 ; vérification de carte 16 |
| Revenus | 16 | intérêts de placement 16 |
| Placements | 286 | achats 38 ; ventes 174 ; plan d'épargne 43 ; ordre 31 |
| Alimentation | 84 | courses 39 ; restauration 45 |
| Transport | 87 | mobilité 56 ; entretien 16 ; assurance 11 ; péage 3 ; carburant 1 |
| Abonnements | 6 | divertissement numérique 4 ; services numériques 2 |
| Charges fixes | 14 | cotisations 10 ; téléphonie 4 |
| Loisirs | 5 | culture 3 ; don 2 |
| Habillement | 4 | vêtements 4 |
| Santé | 1 | optique 1 |
| Logement | 0 | aucune ligne suffisamment explicite |
| Virements à contrepartie non déterminée | 181 | entrant 105 ; sortant 76 |
| Flux carte | 158 | débit 144 ; crédit 2 ; montant nul 12 |
| Espèces | 57 | dépôt 51 ; retrait 6 |
| Flux bancaire | 3 | entrée 2 ; sortie 1 |
| Flux non typé | 55 | sortie 55 |
| À revoir | **0** | — |
| **Total** | **1 177** | |

## Règles et constats appliqués

Les 551 affectations de règle locale conservent un identifiant de règle et un
niveau de confiance. Elles couvrent les opérations de placement, les revenus
de placement, les enseignes documentées d'alimentation, de transport et de
services, les charges fixes, RevPoints et les vérifications de carte.

Les 15 règles supplémentaires de cette passe sont des motifs déjà documentés
dans le référentiel Gestio et non ambigus : épiceries, restauration, entretien
automobile, stationnement et stockage numérique. Elles ont classé 15 lignes.

| Preuve de classement | Lignes | Confiance |
|---|---:|---:|
| Règle locale déterministe | 551 | 0,90–0,99 |
| Paires de virements internes | 172 | 0,85–0,99 |
| Observation du type et du signe Powens | 454 | 0,99 sur le flux observé |
| Sans classement | **0** | — |

Les 454 dernières lignes ne sont pas artificiellement transformées en dépenses
ou revenus. Elles sont classées avec la nature certaine du flux retournée par
Powens : virement dont la contrepartie n'est pas déterminée par le périmètre
connecté, débit/crédit carte, dépôt/retrait espèces, flux bancaire ou flux non
typé. La confiance de `0,99` porte donc sur ce fait technique, pas sur une
finalité métier ou une pocket.

Le résultat reste compatible avec le parcours Gestio : ces constats de flux ne
changent ni la taxonomie des pockets, ni les maquettes, ni le droit de la
personne à corriger la destination métier d'un paiement générique.

## Limites explicites

- Une catégorie Powens développée n'est pas disponible pour corroborer les
  règles locales.
- Un flux carte générique ou un virement à contrepartie non déterminée n'est
  pas présenté comme une catégorie de dépense, un revenu, un virement interne
  ou un virement externe sans preuve additionnelle.
- Les 12 flux carte à montant nul restent classés comme tels ; ils doivent être
  réévalués s'ils deviennent un mouvement financier définitif.
- Il ne reste aucune ligne sans classement, mais une future règle de rattachement
  aux pockets devra être validée par la personne pour les 454 constats de flux.

## Validations

- `npm run lint` dans `.lamoms/lab` : réussi ;
- `npm run smoke` dans `.lamoms/lab` : réussi (`15/15`) ;
- `npm run build` dans `.lamoms/lab` : réussi (57 modules transformés) ;
- `npm run api-check` dans `.lamoms/lab` : réussi, 1 177 transactions et
  aucune ligne `review` ;
- aucun fichier Kotlin, SQLDelight ou de maquette n'a été modifié.
