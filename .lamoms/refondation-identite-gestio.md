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

À ce stade, les quatre premières étapes sont établies. Les suivantes ne doivent pas être déduites ou figées avant d'être travaillées explicitement.

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

## Étape suivante

Définir les **capacités nécessaires** pour que Gestio puisse tenir sa promesse et remplir son rôle tout en respectant ces principes, avant de définir les parcours, les écrans ou l'architecture technique.
