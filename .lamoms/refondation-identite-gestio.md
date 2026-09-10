# Refondation de l'identité de Gestio

> Document de travail. Cette refondation repart du problème utilisateur et de la promesse produit avant de redescendre vers le rôle, les principes, les capacités, les parcours, les écrans et l'architecture.

## Chaîne de refondation

```text
PROBLÈME UTILISATEUR
        ↓
PROMESSE DE GESTIO
        ↓
RÔLE DE GESTIO
        ↓
PRINCIPES PRODUIT
        ↓
CAPACITÉS NÉCESSAIRES
        ↓
PARCOURS
        ↓
ÉCRANS
        ↓
ARCHITECTURE TECHNIQUE
```

À ce stade, les cinq premières étapes sont établies et le cadrage des parcours est en cours. Les écrans et l'architecture technique ne doivent pas être déduits ou figés avant que les parcours soient travaillés explicitement.

## 1. Problème utilisateur

**Les gens ont du mal à évaluer leur situation financière réelle pour se fixer des objectifs adaptés.**

Gestio ne part donc pas de l'idée que les gens « ne savent pas gérer leur argent ». Le problème se situe en amont : sans évaluation réaliste de leur situation, il est difficile de savoir quels objectifs sont réellement compatibles avec leurs finances.

Les difficultés comme ne pas savoir précisément où va son argent, ne pas savoir quoi faire au quotidien ou avoir des finances dispersées peuvent découler de ce problème plus fondamental.

## 2. Promesse de Gestio

**Gestio évalue la situation financière réelle d'une personne pour lui permettre de construire des objectifs réalistes et d'en mesurer les conséquences.**

## Principe associé

Gestio ne promet pas de changer la situation financière de l'utilisateur et ne garantit pas qu'il atteindra ses objectifs, même les plus ambitieux.

Sa responsabilité est de fournir une base suffisamment réaliste pour permettre à la personne de comprendre sa situation, d'évaluer ce qu'un objectif implique et de décider en connaissance de cause.

Gestio ne remplace donc pas la décision de l'utilisateur : il rend cette décision mieux informée.

## 3. Rôle de Gestio

**Gestio est un copilote financier qui transforme la situation financière réelle de l'utilisateur en informations exploitables pour comprendre ce qu'il peut viser, mesurer ce qu'impliquent ses objectifs et identifier les ajustements possibles. La décision finale appartient toujours à l'utilisateur.**

Le rôle de copilote signifie que Gestio ne se limite pas à présenter des chiffres. Il accompagne la décision selon la logique suivante :

```text
situation réelle
      ↓
ce qu'elle permet
      ↓
ce qu'implique l'objectif
      ↓
ajustements possibles
      ↓
décision de l'utilisateur
```

« Copilote » désigne ici un rôle produit et n'implique pas nécessairement une interface conversationnelle ou l'utilisation d'une IA. Gestio éclaire les choix et leurs conséquences sans décider à la place de l'utilisateur.

## 4. Principes produit

### 4.1 Gestio éclaire la décision, il ne décide pas à la place de l'utilisateur

Gestio peut analyser une situation, montrer ce qu'un objectif implique et présenter plusieurs ajustements possibles. Il ne choisit pas automatiquement l'objectif, la dépense à réduire ou le compromis à effectuer. La décision finale appartient à l'utilisateur.

### 4.2 Gestio part de la situation financière réelle de l'utilisateur, et non de règles budgétaires universelles imposées

Gestio ne construit pas son analyse à partir d'un « budget parfait » ou d'une répartition théorique applicable à tout le monde. Il part des comptes, de l'historique, du rythme financier et des objectifs propres à l'utilisateur.

Les éventuelles marges d'ajustement doivent donc être recherchées dans cette réalité. Gestio peut, par exemple, identifier des marges crédibles à partir des habitudes et de la variabilité des dépenses, puis proposer des scénarios. Ces scénarios restent des possibilités et non des prescriptions.

### 4.3 Gestio distingue clairement les faits, les projections et les possibilités

Gestio doit permettre à l'utilisateur de savoir de quelle nature est chaque information présentée :

- un **fait** provient des données financières observées ;
- une **projection** est une estimation de ce qui pourrait se produire à partir des données disponibles ;
- une **possibilité** représente un scénario ou un ajustement que l'utilisateur pourrait choisir.

Ces trois niveaux ne doivent pas être présentés avec le même degré de certitude.

## 5. Capacités nécessaires

Les capacités décrivent ce que Gestio doit savoir faire pour remplir son rôle de copilote financier. Elles sont définies indépendamment des solutions techniques qui pourront les implémenter.

### 5.1 Construire la situation financière réelle

Gestio doit pouvoir rassembler et exploiter les informations nécessaires pour obtenir une vue cohérente de la situation financière de l'utilisateur : comptes, soldes, transactions, épargne, revenus, dépenses et autres éléments pertinents.

### 5.2 Comprendre le rythme financier

Gestio doit analyser la manière dont les revenus et les dépenses se comportent dans le temps.

Pour les dépenses, le comportement peut notamment être distingué entre :

- **dépense récurrente fixe** : revient selon une fréquence identifiable avec un montant fixe ou suffisamment stable ;
- **dépense récurrente variable** : revient selon une fréquence identifiable mais avec des montants différents ;
- **dépense ponctuelle** : ne présente pas de récurrence identifiable.

Cette dimension observable est distincte de la nature que l'utilisateur attribue à la dépense :

- **vitale** ;
- **plaisir**.

Gestio peut analyser le comportement d'une dépense à partir des données, mais ne décide pas à la place de l'utilisateur si une dépense est vitale ou plaisir. Cette qualification appartient à l'utilisateur.

### 5.3 Évaluer la capacité financière réelle

À partir de la situation et du rythme financier observés, ainsi que des choix de l'utilisateur sur la nature de ses dépenses, Gestio doit estimer ce que sa situation lui permet réellement : capacité d'épargne, marge disponible, variabilité à absorber ou effort financier soutenable.

Cette capacité ne doit pas être calculée à partir d'une règle budgétaire universelle, mais à partir de la situation propre à l'utilisateur.

### 5.4 Évaluer un objectif

Gestio doit pouvoir confronter un objectif à la capacité financière réelle de l'utilisateur afin de déterminer ce que cet objectif implique : délai réaliste, effort nécessaire, écart éventuel avec la situation actuelle et conséquences sur la trajectoire financière.

Par exemple, Gestio peut constater qu'un objectif atteignable en 20 mois au rythme actuel nécessiterait un effort mensuel supplémentaire pour être atteint en 12 mois.

### 5.5 Simuler des scénarios

Gestio doit permettre d'explorer différents futurs possibles sans modifier réellement les finances de l'utilisateur.

Cette capacité comprend deux familles de simulation :

- **simulation d'objectif** : faire varier une échéance, un montant d'objectif, un effort mensuel, une somme déjà disponible ou un autre paramètre afin d'en mesurer les conséquences ;
- **simulation d'imprévu** : introduire un choc financier hypothétique afin de mesurer sa capacité à être absorbé et son impact sur la situation et les objectifs.

La simulation d'objectif répond notamment à la question : **« Si je change ce paramètre, qu'est-ce que cela donne ? »**

La simulation d'imprévu répond notamment à la question : **« Si cet imprévu arrivait, à quel point ferait-il dévier ma trajectoire ? »**

Gestio ne mesure donc pas seulement si un objectif est atteignable : il peut aussi mesurer la résistance de la trajectoire à un imprévu.

### 5.6 Identifier des ajustements possibles

Lorsque l'évaluation ou une simulation fait apparaître un effort supplémentaire nécessaire, Gestio doit pouvoir montrer où des ajustements sont potentiellement possibles dans la situation réelle de l'utilisateur.

Cette analyse peut notamment s'appuyer sur le comportement des dépenses et sur leur qualification **vitale / plaisir définie par l'utilisateur**. Gestio peut ainsi montrer différentes marges ou combinaisons permettant, par exemple, de dégager une somme supplémentaire chaque mois.

Cette capacité répond à la question : **« Concrètement, où puis-je agir dans mes finances ? »**

Gestio propose des possibilités ; il ne choisit pas l'ajustement à appliquer à la place de l'utilisateur.

### 5.7 Prendre en compte le fonds d'urgence

Gestio doit permettre de distinguer une réserve destinée à absorber les imprévus de l'argent librement mobilisable pour les objectifs.

Le fonds d'urgence fait partie de l'évaluation de la situation financière : sa présence ou son absence modifie la capacité de la situation à absorber un choc sans dégrader immédiatement les autres trajectoires.

**Le rôle de fonds d'urgence est défini par l'utilisateur au niveau des comptes d'épargne.** Gestio peut identifier les comptes et leurs soldes, mais ne décide pas qu'un compte constitue le fonds d'urgence. L'utilisateur indique quels comptes d'épargne en font partie ou non.

Lorsqu'un compte est désigné comme faisant partie du fonds d'urgence, son solde est considéré comme réservé à ce rôle et n'est pas assimilé à de l'argent librement mobilisable pour les objectifs. Cette règle conserve une unité de qualification explicite : le compte, plutôt qu'un montant arbitraire à l'intérieur d'un compte.

Lors d'une simulation d'imprévu, Gestio doit pouvoir montrer quelle part du choc peut être absorbée par le fonds d'urgence, quelle part reste à absorber et quelles conséquences cela aurait sur la situation ou les objectifs.

Gestio ne se contente donc pas d'afficher le montant du fonds d'urgence : il permet d'en comprendre le rôle et ce qu'il protège réellement.

### 5.8 Suivre la situation et les objectifs dans le temps

Gestio doit réévaluer la situation au fur et à mesure que de nouvelles données apparaissent et indiquer si la trajectoire reste cohérente avec les objectifs, si la situation dérive ou si certaines hypothèses doivent être réévaluées.

Lorsqu'un imprévu réel apparaît, il devient une nouvelle donnée de la situation. Gestio réévalue alors la capacité financière et l'impact éventuel sur les objectifs au lieu de continuer à utiliser une trajectoire devenue obsolète.

### 5.9 Rendre les analyses explicables

Gestio doit permettre à l'utilisateur de comprendre l'origine de ses conclusions et de distinguer les données observées, les calculs, les hypothèses, les projections et les possibilités proposées.

## Enchaînement central des capacités

```text
Comprendre la situation et le rythme financier
                ↓
Évaluer la capacité financière réelle
                ↓
Prendre en compte la protection face aux imprévus
                ↓
Confronter cette capacité à un objectif
                ↓
Simuler des objectifs ou des imprévus
                ↓
Identifier où des ajustements sont possibles
                ↓
L'utilisateur décide
                ↓
Suivre et réévaluer la situation dans le temps
```

## 6. Parcours — cadrage en cours

### 6.1 Première ouverture — construire ma situation

**Intention :** permettre à Gestio de passer d'un utilisateur dont il ne connaît encore rien à une première représentation suffisamment fiable de sa situation financière pour commencer à l'accompagner.

Enchaînement actuellement validé :

```text
Première utilisation de Gestio
        ↓
Apporter ses données financières
        ↓
Gestio construit l'historique disponible
        ↓
Gestio analyse revenus et dépenses
        ↓
Gestio détecte les comportements
récurrents fixes / récurrents variables / ponctuels
        ↓
L'utilisateur complète ce que Gestio
ne peut pas décider seul
notamment vital / plaisir
        ↓
L'utilisateur indique quels comptes d'épargne
constituent son fonds d'urgence
        ↓
Gestio évalue le rythme financier
        ↓
Gestio calcule une première
capacité financière réelle
        ↓
Première situation financière construite
        ↓
Entrée dans l'usage courant
```

#### Décision sur le fonds d'urgence

Le fonds d'urgence n'est pas automatiquement déduit par Gestio et n'est pas défini comme un montant arbitraire demandé à l'utilisateur.

Gestio présente les comptes d'épargne identifiés et **l'utilisateur indique lesquels constituent son fonds d'urgence**. Gestio observe les données financières ; l'utilisateur attribue le rôle de ces comptes.

Cette décision suit le même principe que la qualification **vitale / plaisir** : Gestio peut observer et analyser les données, mais ne remplace pas le jugement de l'utilisateur lorsqu'il s'agit de leur donner un sens personnel.

Le détail du `user_flow`, notamment la manière de qualifier vital / plaisir sans imposer le classement manuel de centaines de transactions, reste à définir avant de considérer ce parcours comme cadré.

## Étape suivante

Poursuivre le cadrage du parcours **Première ouverture**, puis cadrer les autres parcours. Une fois les parcours validés, construire leur graphe Mermaid global puis créer les fiches Lamoms dans `.lamoms/journeys/` à partir de `knowledge/templates/JOURNEY_TEMPLATE.md` de `DOCUMENTATION_URL`.
