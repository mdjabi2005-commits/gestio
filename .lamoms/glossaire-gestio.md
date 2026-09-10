# Glossaire métier — Gestio

> Référence de travail issue de la refondation et des quatre parcours `premiere-ouverture`, `usage-courant`, `objectif` et `simulation`. Ce vocabulaire est désormais le socle métier de Gestio, mais certaines appellations pourront encore être affinées avant validation finale.

## Situation financière réelle

Représentation cohérente de la situation de l'utilisateur construite à partir des données observées : établissements financiers, supports financiers, soldes, transactions, épargne, revenus, dépenses, historiques disponibles, fonds d'urgence et autres éléments utiles.

Gestio part de cette situation réelle pour analyser ce que l'utilisateur peut viser. Elle n'est pas construite à partir d'une règle budgétaire universelle.

## Établissement financier

Organisation qui ouvre, héberge ou administre un support financier de l'utilisateur.

Une banque, un courtier ou une plateforme de crypto-actifs peuvent être des établissements financiers. L'établissement n'est ni le titulaire ni le support lui-même. Un portefeuille crypto en auto-conservation peut ne dépendre d'aucun établissement.

## Compte bancaire

Support bancaire qui porte un solde en monnaie et des opérations. Dans Gestio, un compte bancaire reçoit l'un des deux types métier suivants :

- **compte courant** : compte utilisé pour les encaissements, paiements et prélèvements du quotidien ; son solde contribue au budget libre ;
- **compte d'épargne** : réserve monétaire volontairement séparée du quotidien ; son solde ne contribue pas au budget libre, mais peut être désigné comme fonds d'urgence ou devenir potentiellement affectable à un objectif par décision explicite de l'utilisateur.

Le terme « compte principal » n'est pas utilisé : il ne décrit ni la nature du compte ni son rôle dans un calcul.

## Support financier

Terme générique pour ce que l'utilisateur détient financièrement. Un support financier est rattaché à un établissement lorsqu'il y en a un, mais cette relation n'est pas obligatoire.

Les catégories actuellement reconnues sont :

- compte bancaire ;
- support d'investissement, par exemple un compte-titres ordinaire ou un PEA ;
- portefeuille crypto, conservé par une plateforme ou en auto-conservation.

Un support d'investissement ou un portefeuille crypto peut figurer dans la vue « épargne et placements », mais n'est pas un compte d'épargne et ne devient jamais automatiquement de l'argent disponible.

## Rythme financier

Comportement habituel des revenus, dépenses et épargne dans le temps.

Il décrit notamment ce qui est généralement gagné, dépensé et épargné, ainsi que la régularité ou la variabilité de ces flux.

## Revenu récurrent fixe

Revenu qui revient selon une fréquence identifiable avec un montant fixe ou suffisamment stable.

Exemple : salaire mensuel stable.

## Revenu récurrent variable

Revenu qui revient selon une fréquence identifiable mais dont le montant varie.

Exemple : primes régulières mais variables.

## Revenu ponctuel

Revenu sans récurrence identifiable.

Exemple : vente exceptionnelle d'un objet, remboursement exceptionnel ou rentrée d'argent isolée.

## Dépense récurrente fixe

Dépense qui revient selon une fréquence identifiable avec un montant fixe ou suffisamment stable.

Exemple : loyer ou abonnement.

## Dépense récurrente variable

Dépense qui revient selon une fréquence identifiable mais dont le montant varie.

Exemple : courses alimentaires ou facture d'énergie variable.

## Dépense ponctuelle

Dépense sans récurrence identifiable.

Exemple : achat exceptionnel ou dépense imprévue isolée.

## Pocket

Regroupement métier de dépenses utilisé pour représenter la réalité financière de l'utilisateur.

Gestio peut proposer une structure initiale de pockets et y classer des transactions, mais l'utilisateur peut adapter cette structure à sa propre réalité.

## Qualification vital / plaisir

Sens attribué par l'utilisateur à une pocket.

- **Vital** : dépense que l'utilisateur considère comme nécessaire ou difficilement compressible dans sa situation.
- **Plaisir** : dépense que l'utilisateur considère comme non vitale et davantage ajustable.

Gestio peut observer le comportement des dépenses, mais ne décide pas à la place de l'utilisateur si une pocket est vitale ou plaisir.

## SH — Seuil haut

Marge mensuelle structurelle calculée à partir des flux récurrents fixes :

`SH = revenus récurrents fixes - dépenses récurrentes fixes`

Dans le modèle de travail actuel, le SH est considéré comme fixé par la situation financière observée. Les ajustements de répartition portent ensuite sur SB et SPP, ce qui modifie CP.

## SB — Seuil bas

Somme des montants affectés aux pockets qualifiées comme vitales.

Le SB représente donc la part du SH nécessaire pour couvrir le niveau de dépenses vitales retenu par l'utilisateur.

## SPP — Somme des pockets plaisir

Somme des montants affectés aux pockets qualifiées comme plaisir.

SPP représente la part du SH consacrée aux dépenses non vitales selon la qualification donnée par l'utilisateur.

## CP — Capacité d'épargne

Part restante du SH après couverture du SB et du SPP.

`CP = SH - SB - SPP`

La CP représente la capacité d'épargne mensuelle disponible dans la situation de référence de l'utilisateur. Elle est distincte de l'épargne effectivement observée sur une période donnée.

## Invariant SH / SB / SPP / CP

Le modèle de travail actuel pose l'égalité suivante :

`SH = SB + SPP + CP`

Le SH est la référence structurelle issue de la situation observée. Toute modification de SB ou SPP entraîne mécaniquement une modification de CP tant que SH reste inchangé.

## Budget libre

Montant réellement disponible à un instant donné après prise en compte des sorties déjà engagées ou suffisamment certaines à venir.

Le budget libre répond à la question : **« Combien puis-je réellement utiliser maintenant sans compromettre les dépenses qui doivent encore être payées ? »**

Exemple :

- solde disponible le 1er septembre : 1 000 € ;
- assurance prévue : 100 € ;
- loyer prévu : 400 € ;
- budget libre : 500 €.

Le budget libre est une notion de court terme liée à la liquidité à l'instant `t`. Il ne doit pas être confondu avec la CP, qui décrit une capacité d'épargne structurelle et mensuelle.

Le budget libre est calculé à partir des comptes courants et des engagements connus. Les comptes d'épargne, supports d'investissement et portefeuilles crypto en sont exclus, même s'ils peuvent être mobilisables par un choix explicite de l'utilisateur.

## Contrôle de liquidité — health check

Consultation ponctuelle qui répond à la question : **« Les prélèvements et autres engagements connus partiront-ils du bon compte sans risque de rejet ? »**

Pour chaque engagement à venir, Gestio compare son montant et sa date avec le solde observé du compte courant d'origine, après les engagements connus antérieurs. Le résultat est une projection, jamais une certitude : les transactions futures inconnues et la fraîcheur des données peuvent en limiter la fiabilité.

Le contrôle produit l'un des trois constats suivants :

- **couvert** : les données connues suffisent à couvrir l'engagement ;
- **à risque** : les données connues indiquent que le compte d'origine pourrait être insuffisant ;
- **à confirmer** : les données disponibles ne permettent pas de conclure.

Ce contrôle n'est pas un tableau de bord ni une alerte permanente. Il peut être ouvert volontairement ; un signal contextuel n'apparaît dans l'usage courant que lorsqu'un engagement est à risque ou à confirmer.

## Fonds d'urgence

Réserve destinée à absorber les imprévus sans dégrader immédiatement les autres trajectoires financières.

Le rôle de fonds d'urgence est défini par l'utilisateur sur un ou plusieurs comptes d'épargne ou autres supports financiers désignés comme réserve. Lorsqu'un support est désigné comme fonds d'urgence, sa valeur est réservée à ce rôle et n'est pas considérée comme librement mobilisable pour un objectif.

## Avoir potentiellement affectable à un objectif

Actif ou somme que l'utilisateur pourrait choisir d'utiliser pour financer un objectif, hors fonds d'urgence.

Cela peut notamment inclure des comptes d'épargne, supports d'investissement, portefeuilles crypto ou autres supports financiers pertinents.

Cette appellation reste volontairement provisoire : le concept est conservé, mais son nom pourra être simplifié lors de la validation finale du vocabulaire.

## Somme affectée à un objectif

Part des avoirs potentiellement affectables que l'utilisateur décide réellement de consacrer à un objectif donné.

Un avoir disponible n'est donc jamais considéré comme automatiquement affecté à un objectif.

## Objectif

Résultat financier que l'utilisateur souhaite atteindre et que Gestio confronte à sa situation financière réelle afin de mesurer ce qu'il implique.

Un objectif peut notamment comporter :

- un montant cible ;
- une somme déjà affectée ;
- une échéance facultative.

Un objectif peut être conservé même si les paramètres actuels le rendent incompatible avec la CP. Gestio mesure alors l'écart sans qualifier l'objectif d'impossible.

## Reste à financer

Montant de l'objectif qui doit encore être constitué après prise en compte de la somme déjà affectée.

`reste à financer = montant cible - somme déjà affectée`

## Effort nécessaire

Montant d'épargne mensuel requis pour atteindre un objectif dans l'échéance choisie.

Lorsque l'objectif n'a pas d'échéance, Gestio peut à l'inverse utiliser la CP actuelle pour estimer un délai réaliste.

## Écart

Différence entre l'effort nécessaire pour un objectif et la CP disponible.

- si l'effort nécessaire est inférieur à la CP, une partie de la CP reste disponible ;
- s'il est égal à la CP, l'objectif mobilise toute la capacité actuelle ;
- s'il est supérieur à la CP, l'écart représente la capacité supplémentaire qui serait nécessaire pour respecter les paramètres de l'objectif.

L'écart est une information à comprendre, pas une interdiction.

## Situation de référence

État financier réel servant de point de comparaison avant toute simulation.

Une simulation ne remplace pas cette référence tant que l'utilisateur n'a pas explicitement décidé d'adopter une modification.

## Simulation

Exploration d'un scénario hypothétique sans modifier immédiatement la situation réelle ni l'objectif de référence.

Deux familles principales sont retenues :

- **simulation d'objectif** : modification hypothétique du montant cible, de l'échéance, de la somme affectée ou d'autres paramètres liés à l'objectif ;
- **simulation d'imprévu** : introduction d'un choc financier hypothétique afin d'en mesurer l'absorption par le fonds d'urgence et les conséquences sur la situation et les objectifs.

Les simulations peuvent également explorer des hypothèses de répartition sur SB et SPP, avec recalcul de CP tant que SH reste fixe.

## Fait

Information issue directement des données financières observées.

Exemple : solde bancaire ou transaction effectivement constatée.

## Projection

Estimation de ce qui pourrait se produire à partir des données disponibles et d'hypothèses explicites.

Exemple : dépenses encore attendues sur le mois ou délai estimé pour atteindre un objectif.

## Possibilité

Scénario ou ajustement que l'utilisateur pourrait choisir mais qui n'est pas encore réel.

Exemple : réduire une pocket plaisir de 100 € par mois ou décaler une échéance d'objectif.

## Relation entre les trois niveaux

Gestio doit toujours permettre à l'utilisateur de distinguer :

`fait → ce qui est observé`

`projection → ce qui est estimé`

`possibilité → ce qui pourrait être choisi`

Ces trois niveaux ne doivent pas être présentés avec le même degré de certitude.

## Concepts à ne pas confondre

### Budget libre et CP

- **Budget libre** : argent réellement disponible à un instant donné après réservation des dépenses déjà attendues.
- **CP** : capacité d'épargne mensuelle structurelle issue du modèle `SH = SB + SPP + CP`.

### Récurrence et vital / plaisir

- **récurrent fixe / récurrent variable / ponctuel** décrit le comportement observable d'un revenu ou d'une dépense ;
- **vital / plaisir** décrit le sens donné par l'utilisateur à une pocket.

Une même dépense peut donc être, par exemple, `récurrente fixe + plaisir` ou `récurrente variable + vitale`.

### Avoir potentiellement affectable et somme affectée

- **avoir potentiellement affectable** : ce que l'utilisateur pourrait utiliser pour un objectif ;
- **somme affectée** : ce qu'il décide effectivement d'y consacrer.

Le fonds d'urgence est exclu des avoirs librement affectables par définition.
