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

### Contrôle ultérieur de la source

Deux lectures de contrôle successives effectuées après ce snapshot retournent
le même agrégat de 1 178 transactions et aucune ligne `review`. Elles observent
174 virements internes (162 exacts, 12 décalés) et 205 demandes de qualification
(145 débits carte, 6 retraits, 54 sorties non typées). L'écart avec le snapshot
validé ci-dessous provient donc d'une évolution ou d'une normalisation des
données retournées par l'API, pas d'une modification du rapprochement. Le
snapshot à 1 177 lignes est conservé comme référence validée.

## Résultat final

| Catégorie | Lignes | Sous-catégories |
|---|---:|---|
| Virements internes | 172 | exact 160 ; décalé 12 |
| Hors dépense | 48 | RevPoints 32 ; vérification de carte 16 |
| Revenus | 16 | intérêts de placement 16 |
| Placements | 286 | achats 38 ; ventes 174 ; plan d'épargne 43 ; ordre 31 |
| Alimentation | 84 | courses 39 ; restauration 45 |
| Transport | 85 | mobilité 53 ; parking 1 ; entretien 16 ; assurance 11 ; péage 3 ; carburant 1 |
| Abonnements | 5 | divertissement numérique 3 ; services numériques 2 |
| Charges fixes | 14 | cotisations 10 ; téléphonie 4 |
| Loisirs | 5 | culture 3 ; don 2 |
| Habillement | 4 | vêtements 4 |
| Santé | 1 | optique 1 |
| Logement | 0 | aucune ligne suffisamment explicite |
| Virements à contrepartie non déterminée | 181 | entrant 105 ; sortant 76 |
| Flux carte | 161 | débit 144 ; crédit 3 ; montant nul 14 |
| Espèces | 57 | dépôt 51 ; retrait 6 |
| Flux bancaire | 3 | entrée 2 ; sortie 1 |
| Flux non typé | 55 | sortie 55 |
| À revoir | **0** | — |
| **Total** | **1 177** | |

## Règles et constats appliqués

Les 548 affectations de règle locale conservent un identifiant de règle et un
niveau de confiance. Elles couvrent les opérations de placement, les revenus
de placement, les enseignes documentées d'alimentation, de transport et de
services, les charges fixes, RevPoints et les vérifications de carte.

La passe carte rend le stationnement explicite (`Transport › Parking`,
confiance 0,96) et prépare le cinéma (`Loisirs › Cinéma`, 0,98) pour les
débits carte dont l'enseigne est explicite. Une ligne courante a été déplacée
de `Mobilité` vers `Parking`; aucun libellé du jeu API actuel n'a déclenché la
règle cinéma.

Avant toute règle d'enseigne, un crédit carte ou un montant nul est désormais
classé comme tel (sauf RevPoints et vérification de carte). Trois lignes qui
ressemblaient à une dépense par leur libellé sont ainsi redevenues un constat de
flux : un crédit ou un mouvement nul n'établit pas une dépense.

Les règles `Revenus › Activité` (Uber) et `Revenus › Salaire` ne s'appliquent
qu'aux montants entrants. Ainsi, les gains de livraison Uber restent des
revenus, sans confondre un éventuel débit carte Uber avec un gain.

| Preuve de classement | Lignes | Confiance |
|---|---:|---:|
| Règle locale déterministe | 548 | 0,90–0,99 |
| Paires de virements internes | 172 | 0,85–0,99 |
| Observation du type et du signe Powens | 457 | 0,99 sur le flux observé |
| Sans classement | **0** | — |

Les 457 dernières lignes ne sont pas artificiellement transformées en dépenses
ou revenus. Elles sont classées avec la nature certaine du flux retournée par
Powens : virement dont la contrepartie n'est pas déterminée par le périmètre
connecté, débit/crédit carte, dépôt/retrait espèces, flux bancaire ou flux non
typé. La confiance de `0,99` porte donc sur ce fait technique, pas sur une
finalité métier ou une pocket.

## Qualification demandée à la personne

Le catégoriseur marque explicitement 205 mouvements pour lesquels Gestio doit
demander un renseignement, sans effacer le constat technique si la personne
passe la question :

| Flux conservé | Lignes | Question attendue |
|---|---:|---|
| `Flux carte › Débit carte` | 144 | À quoi correspond ce paiement ? |
| `Espèces › Retrait` | 6 | À quel usage ont servi ces espèces ? |
| `Flux non typé › Sortie` | 55 | Quelle est l'origine de cette opération ? |

`Flux non typé` signifie que Powens a renvoyé `type: unknown` : le signe dit
seulement si l'argent entre ou sort, sans établir s'il s'agit d'une dépense,
d'un revenu, d'un remboursement ou d'un virement. Ce n'est donc pas une
catégorie de dépense.

Le lab expose cette attente avec `needsUserInput`. Son écran de qualification
reste aujourd'hui alimenté par une fixture : le raccordement de cette file aux
données réelles est volontairement hors de cette passe de catégorisation.

Le résultat reste compatible avec le parcours Gestio : ces constats de flux ne
changent ni la taxonomie des pockets, ni les maquettes, ni le droit de la
personne à corriger la destination métier d'un paiement générique.

## Limites explicites

- Une catégorie Powens développée n'est pas disponible pour corroborer les
  règles locales.
- Un flux carte générique ou un virement à contrepartie non déterminée n'est
  pas présenté comme une catégorie de dépense, un revenu, un virement interne
  ou un virement externe sans preuve additionnelle.
- Les 14 flux carte à montant nul restent classés comme tels ; ils doivent être
  réévalués s'ils deviennent un mouvement financier définitif.
- Les 144 débits carte génériques restent des débits carte, pas des dépenses
  attribuées silencieusement à une enveloppe. Il faudra une enseigne explicite
  ou une résolution utilisateur réutilisable pour les catégoriser plus loin.
- Les 6 retraits et les 55 flux non typés sont également conservés avec leur
  nature technique jusqu'à ce que la personne indique leur usage ou origine.
- Il ne reste aucune ligne sans classement, mais une future règle de rattachement
  aux pockets devra être validée par la personne pour les 457 constats de flux.

## Validations

- `npm run lint` dans `.lamoms/lab` : réussi ;
- `npm run smoke` dans `.lamoms/lab` : réussi ;
- `npm run build` dans `.lamoms/lab` : réussi (59 modules transformés) ;
- `npm run api-check` dans `.lamoms/lab` : réussi ; la dernière double lecture
  stable retourne 1 178 transactions et aucune ligne `review` ;
- aucun fichier Kotlin ou SQLDelight n'a été modifié ; les changements de
  maquette restent dans `.lamoms/lab`, qui est ignoré par Git.

## Prototype dynamique de la maquette

L'écran local `PO-AMBIGUOUS` ne part plus d'une liste statique d'opérations à
revoir. Il dérive sa file de `categorizeTransactions(...)` et de
`needsUserInput`, sur la fixture synthétique uniquement. Les trois exemples
montrent respectivement un débit carte, un retrait d'espèces et un flux non
typé ; aucun libellé ou montant bancaire réel n'est affiché ou conservé par la
maquette.

Pour chaque opération, la personne peut choisir une catégorie, une
sous-catégorie et une qualification Gestio. Elle peut aussi définir un compte
préféré au niveau de la catégorie, puis éventuellement le remplacer pour une
sous-catégorie. La résolution est explicite :

1. préférence de sous-catégorie ;
2. sinon préférence de catégorie ;
3. sinon aucun compte préféré.

Le compte source de la transaction reste un fait bancaire distinct : cette
préférence ne le réécrit jamais. Si la question est passée, le flux technique
est conservé (`Flux carte`, `Espèces › Retrait` ou `Flux non typé`) et peut être
repris plus tard.

Le prototype conserve seulement ces choix dans le `localStorage` du navigateur
pour pouvoir valider le comportement de l'écran après rechargement. Il ne lit
pas l'API Powens et n'écrit aucune donnée réelle. Une base Kotlin/SQLDelight
serait prématurée ici : le schéma présent ne porte ni sous-catégorie, ni
préférence catégorie/sous-catégorie vers un compte, ni réponse utilisateur. Le
modèle persistant reste donc à décider avant tout raccordement aux données
bancaires.

Validation complémentaire du 2026-09-27 : parcours navigateur local effectué,
sélection enregistrée puis retrouvée après rechargement ; une préférence
`Alimentation` a été remplacée correctement par la préférence `Courses`, sans
modifier le compte source. `npm run lint`, `npm run smoke` et `npm run build`
ont aussi réussi après cette évolution (59 modules transformés).
