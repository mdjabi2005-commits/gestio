# Stitch brief — Gestio

## Objet

Produire une famille cohérente de maquettes mobile-first couvrant les quatre parcours métier actuellement retenus pour Gestio :

- `premiere-ouverture`
- `usage-courant`
- `objectif`
- `simulation`

La maquette doit traduire les `user_flow` déjà cadrés sans revenir aux anciens écrans comme source de vérité. Les anciens écrans peuvent seulement servir de repère secondaire lorsqu'ils restent compatibles avec les parcours actuels.

## Sources de vérité

- Direction visuelle : `DOCUMENTATION_URL/knowledge/profiles/gestio/context/DESIGN.md`
- Méthode de maquettage : `DOCUMENTATION_URL/methods/MAQUETTAGE.md`
- Identité produit : `.lamoms/refondation-identite-gestio.md`
- Glossaire métier : `.lamoms/glossaire-gestio.md`
- Parcours :
  - `.lamoms/journeys/premiere-ouverture.md`
  - `.lamoms/journeys/usage-courant.md`
  - `.lamoms/journeys/objectif.md`
  - `.lamoms/journeys/simulation.md`

## Utilisateur

Une personne qui veut comprendre sa situation financière réelle avant de décider quoi faire. Gestio doit informer, expliquer et projeter sans décider à sa place.

L'interface doit rester lisible en quelques secondes, ne jamais transformer un écart financier en jugement moral, et toujours distinguer ce qui est observé, projeté et simulé.

## Surface

Une seule famille de maquettes pour l'application mobile Gestio. Les quatre parcours utilisent la même surface, la même grammaire visuelle et des composants cohérents.

La version desktop n'est pas une conception séparée : elle sera une déclinaison plus aérée de la version mobile.

## Règles visuelles obligatoires

Appliquer `DESIGN.md` comme source de vérité. En particulier :

- un écran = une question = une réponse dominante ;
- la réponse dominante est un chiffre chaque fois que cela a du sens ;
- test des cinq secondes : la réponse à la question de l'écran doit être identifiable en moins de cinq secondes ;
- trois niveaux de hiérarchie maximum : dominant, explication, ce qui attend ou mène ailleurs ;
- grille et espacements en multiples de 8 ;
- deux crans typographiques minimum entre niveaux réellement distincts ;
- chiffres tabulaires ; format monétaire français `1 247,00 €` ;
- montants jamais coupés sur deux lignes ;
- aucun rouge/vert pour qualifier positif ou négatif ;
- aucun jugement visuel sur les écarts ;
- aucun anneau ni jauge radiale ;
- aucune barre sans son montant et sa borne ;
- aucun graphe dans la première lecture sauf quand il porte directement la réponse ;
- pas de cartes à ombre portée ;
- pas d'icônes décoratives ;
- pas de boutons pleins ; les actions sont principalement des lignes de texte avec chevron `›` lorsqu'elles naviguent ;
- pas de barre de navigation globale ;
- modales interdites par défaut, sauf alerte de liquidité urgente et actionnable ;
- structure d'abord en niveaux de gris ; la couleur n'est pas encore une dépendance de lisibilité ;
- quand la couleur sera posée, conserver la logique 60/30/10 définie dans `DESIGN.md` ;
- l'alerte de liquidité est le seul élément autorisé à avoir un traitement visuel réellement fort.

## Principes métier visibles

La maquette doit rendre perceptibles sans jargon inutile les concepts suivants :

- budget libre : argent réellement disponible à l'instant `t` après prise en compte des sorties déjà engagées ou suffisamment certaines ;
- rythme financier ;
- CP / capacité d'épargne ;
- pockets et qualification vital/plaisir ;
- fonds d'urgence ;
- objectif, reste à financer, effort nécessaire et écart ;
- situation de référence ;
- simulation ;
- distinction `fait / projection / possibilité`.

Les termes techniques `SH`, `SB`, `SPP` et `CP` peuvent rester internes quand une formulation française plus claire existe à l'écran. Ne pas afficher un acronyme uniquement parce qu'il existe dans le modèle métier.

---

# Cartographie des écrans

## Parcours 1 — Première ouverture

### PO-01 — Historique disponible

**Question :** De combien de recul Gestio dispose-t-il pour comprendre ma situation ?

**Réponse dominante :** nombre de mois d'historique exploitable, par exemple `12 mois`.

**Explication :**

- sources connectées ;
- comptes récupérés ;
- date du plus ancien mouvement utile ;
- message clair si moins de 12 mois sont disponibles ;
- ne pas bloquer la suite uniquement parce que 12 mois ne sont pas atteints.

**Actions :**

- `Continuer ›`
- lien discret pour corriger/reconnecter une source si nécessaire.

**États à maquetter :**

- historique suffisant ;
- historique partiel ;
- source indisponible.

### PO-02 — Répartition en pockets

**Question :** Est-ce que Gestio a correctement compris où part mon argent ?

**Réponse dominante :** état synthétique du classement, par exemple `14 pockets classées · 3 à revoir`.

**Explication :**

- liste des pockets avec montant observé ;
- transactions ambiguës ou non classées signalées sans dramatisation ;
- accès au détail d'une pocket par chevron.

**Actions :**

- corriger une pocket ou ses transactions ;
- ajouter/renommer/regrouper une pocket lorsque nécessaire ;
- `Continuer ›`.

**Contrainte :** éviter un dashboard de catégories concurrentes. La synthèse du classement domine ; la liste explique.

### PO-03 — Qualification vital / plaisir

**Question :** Quelles pockets est-ce que je considère comme vitales ou plaisir ?

**Nature d'écran :** réglage guidé. Ne pas forcer artificiellement un chiffre dominant si cela nuit à la compréhension.

**Contenu :**

- liste des pockets ;
- qualification `Vital` ou `Plaisir` définie par l'utilisateur ;
- état non qualifié permis mais explicitement visible ;
- aucun choix automatique présenté comme vérité.

**Interaction :** enregistrement implicite à chaque choix lorsque possible.

**État à maquetter :** pockets partiellement qualifiées.

### PO-04 — Fonds d'urgence

**Question :** Quelle réserve est-ce que je protège pour les imprévus ?

**Réponse dominante :** montant total actuellement contenu dans les comptes désignés comme fonds d'urgence.

**Explication :**

- comptes d'épargne disponibles ;
- compte désigné ou non ;
- le rôle est attribué au compte, pas à un montant arbitraire dans ce compte ;
- aucun compte choisi = aucun fonds d'urgence déclaré.

**Actions :** désigner/retirer un compte du fonds d'urgence, avec enregistrement implicite.

### PO-05 — Première situation

La sortie nominale de Première ouverture doit rejoindre la même grammaire que l'Usage courant. Ne pas créer une seconde version concurrente de la situation financière.

**Question :** Combien puis-je réellement utiliser maintenant ?

**Réponse dominante :** budget libre.

Cet écran doit réutiliser la structure de `UC-01` ci-dessous et sert de transition vers l'usage normal.

---

## Parcours 2 — Usage courant

### UC-01 — Situation actuelle

**Question :** Combien puis-je réellement utiliser maintenant ?

**Réponse dominante :** budget libre, en très grand format.

**Explication de niveau 2 :**

- argent déjà entré sur la période ;
- argent déjà sorti ;
- entrées encore attendues ;
- sorties encore attendues ;
- borne temporelle explicite, par exemple `d'ici le 30 septembre` ;
- projection de fin de période si elle apporte une information distincte du budget libre ;
- distinction visuelle claire entre faits déjà observés et montants projetés.

**Niveau 3 :**

- `Voir mon rythme financier ›`
- `Voir mes pockets ›`
- `Voir ma protection ›`
- éventuel changement significatif récent, discret tant qu'il n'est pas une alerte de liquidité.

**États à maquetter :**

- budget libre positif ;
- budget libre nul ou négatif sans jugement visuel ;
- donnée future partiellement inconnue ;
- alerte de liquidité urgente distincte de tous les autres états.

### UC-02 — Rythme financier

**Question :** Combien puis-je épargner de façon soutenable chaque mois ?

**Réponse dominante :** CP / capacité d'épargne, affichée en français, par exemple `320,00 € / mois`.

**Explication :**

- revenu mensuel habituel ;
- dépense mensuelle habituelle ;
- épargne effectivement observée ;
- variabilité ;
- ne pas confondre épargne observée et capacité d'épargne calculée.

**Niveau 3 :** lien vers la répartition en pockets si l'utilisateur veut comprendre ce qui compose cette capacité.

### UC-03 — Pockets

**Question :** Où part habituellement mon argent ?

**Réponse dominante :** montant mensuel habituel dépensé, accompagné de sa répartition par pockets.

**Explication :**

- chaque pocket porte son montant ;
- qualification vital/plaisir affichée avec sobriété ;
- accès au détail par chevron ;
- libellés longs tronqués, jamais repliés sur plusieurs lignes.

**Contrainte :** aucune couleur morale pour distinguer vital/plaisir ou dépassement.

### UC-04 — Protection

**Question :** Quelle réserve me protège actuellement d'un imprévu ?

**Réponse dominante :** montant du fonds d'urgence.

**Explication :**

- comptes qui le constituent ;
- information distincte du budget libre et des sommes potentiellement affectables à des objectifs ;
- si aucun fonds n'est déclaré, afficher ce fait simplement.

**Niveau 3 :** `Simuler un imprévu ›`.

---

## Parcours 3 — Objectif

### OBJ-01 — Montant cible

**Question :** Combien veux-tu atteindre ?

**Réponse dominante :** montant cible éditable.

**Contenu :** nom ou description courte de l'objectif, puis montant cible.

**Interaction :** saisie simple, sans bouton plein de validation.

### OBJ-02 — Somme déjà affectée

**Question :** Combien as-tu déjà décidé de consacrer à cet objectif ?

**Réponse dominante :** somme affectée.

**Explication :**

- avoirs potentiellement affectables connus de Gestio ;
- fonds d'urgence exclu ;
- distinction explicite entre ce qui pourrait être utilisé et ce que l'utilisateur décide réellement d'affecter ;
- valorisation incertaine signalée comme telle.

**Action :** sélectionner les montants/supports réellement affectés.

### OBJ-03 — Échéance

**Question :** Quand veux-tu atteindre cet objectif ?

**Réponse dominante :** date ou durée choisie.

**État alternatif :** `Pas d'échéance` ; dans ce cas Gestio estimera un délai à partir de la CP actuelle.

### OBJ-04 — Évaluation avec échéance

**Question :** Qu'est-ce que cette échéance me demande chaque mois ?

**Réponse dominante :** effort mensuel nécessaire.

**Explication :**

- reste à financer ;
- CP actuelle ;
- part de CP mobilisée ;
- écart éventuel formulé en français ;
- si effort > CP, ne jamais écrire `impossible` ; expliquer que les paramètres actuels demandent davantage que la capacité actuelle et quantifier l'écart.

**Niveau 3 :**

- `Conserver cet objectif ›`
- `Modifier l'objectif ›`
- `Explorer une simulation ›`.

### OBJ-05 — Évaluation sans échéance

**Question :** Avec ma situation actuelle, quand pourrais-je atteindre cet objectif ?

**Réponse dominante :** date ou durée estimée.

**Explication :** reste à financer + CP utilisée pour la projection + borne de départ.

**État limite :** CP nulle, négative ou insuffisamment fiable ; expliquer pourquoi aucune date fiable n'est produite.

---

## Parcours 4 — Simulation

### SIM-01 — Choix du scénario

**Question :** Qu'est-ce que je veux tester ?

**Nature d'écran :** bifurcation simple, pas un tableau de bord.

**Actions principales :**

- `Modifier un objectif ›`
- `Simuler un imprévu ›`

L'écran ne doit pas présenter des indicateurs financiers concurrents : il sert uniquement à choisir la question suivante.

### SIM-02 — Simulation d'objectif — délai résultant

**Question :** Si je change cette hypothèse, quand l'objectif serait-il atteint ?

**Réponse dominante :** nouvelle date ou nouvelle durée estimée.

**Explication :** comparaison compacte `Référence / Scénario` pour :

- montant cible ;
- somme affectée ;
- hypothèse de répartition si elle change la CP ;
- CP de référence et CP simulée ;
- date de référence et date simulée.

**Important :** la situation réelle reste visuellement identifiable comme référence. Le scénario ne remplace jamais la référence tant qu'il n'est pas adopté.

### SIM-03 — Simulation d'objectif — effort résultant

État alternatif de la même logique lorsque l'échéance est fixée.

**Question :** Si je garde cette échéance, quel effort mensuel ce scénario demande-t-il ?

**Réponse dominante :** effort mensuel nécessaire simulé.

**Explication :** CP de référence, CP simulée, reste à financer, écart avant/après.

**Interaction :** les hypothèses sur pockets sont modifiées au niveau des pockets ; `SB`, `SPP` et `CP` sont recalculés derrière sans exiger que l'utilisateur manipule directement les acronymes.

### SIM-04 — Simulation d'imprévu

**Question :** Si cet imprévu arrivait, combien resterait-il réellement à absorber ?

**Réponse dominante :** montant restant après utilisation potentielle du fonds d'urgence.

**Explication :**

- montant du choc ;
- part couverte par le fonds d'urgence ;
- reste non couvert ;
- impact projeté sur situation et objectifs ;
- scénario explicitement présenté comme hypothétique.

**État alternatif :** fonds d'urgence suffisant, où le dominant peut être `0,00 € à absorber hors réserve`.

### SIM-05 — Comparaison et décision

La comparaison doit pouvoir exister dans `SIM-02`, `SIM-03` ou `SIM-04` sans nécessiter un dashboard final séparé. Si Stitch propose un écran de synthèse, il doit conserver une seule conséquence dominante.

**Actions permises :**

- continuer à modifier ;
- revenir à la référence ;
- quitter sans changement ;
- retenir explicitement une modification lorsque le type de modification le permet.

Aucune modification de la situation réelle ne doit se produire implicitement.

---

# Patterns de composants attendus

Les maquettes doivent réutiliser une petite famille de patterns plutôt que créer une géométrie différente à chaque écran :

1. **Bloc dominant** : question courte + chiffre dominant + borne temporelle éventuelle.
2. **Lignes explicatives** : libellé à gauche, montant tabulaire à droite, séparateurs fins.
3. **Ligne navigable** : libellé + chevron `›`.
4. **Comparaison référence / scénario** : deux valeurs parfaitement alignées, différence lisible sans rouge/vert.
5. **Liste de pockets** : nom tronqué + qualification + montant, même rythme vertical partout.
6. **Barre avec bornes** uniquement quand elle apporte une lecture réellement plus rapide ; elle porte toujours le montant et la borne.
7. **État d'incertitude** : texte explicatif sobre, jamais une fausse précision.
8. **Alerte de liquidité** : seul pattern autorisé à rompre fortement la neutralité visuelle.

La répétition de ces patterns doit créer la cohérence de l'application. Ne pas multiplier les cartes, badges, capsules ou formes différentes pour produire artificiellement de la variété.

# Données fictives de référence

Utiliser un jeu de données cohérent entre tous les écrans afin que l'utilisateur puisse suivre la même situation d'un parcours à l'autre :

- revenus récurrents fixes : `2 000,00 € / mois` ;
- dépenses récurrentes fixes : `800,00 € / mois` ;
- SH : `1 200,00 € / mois` ;
- SB : `700,00 € / mois` ;
- SPP : `300,00 € / mois` ;
- CP : `200,00 € / mois` ;
- fonds d'urgence : `2 500,00 €` ;
- solde liquide au 1er septembre : `1 000,00 €` ;
- assurance attendue : `100,00 €` le 10 septembre ;
- loyer attendu : `400,00 €` le 15 septembre ;
- budget libre de départ : `500,00 €` ;
- objectif : `12 000,00 €` ;
- somme déjà affectée : `3 000,00 €` ;
- reste à financer : `9 000,00 €`.

Pour les états de simulation, conserver ce même scénario de base afin que la comparaison soit immédiatement compréhensible.

# Hors périmètre

- architecture technique ;
- choix des bibliothèques UI ;
- navigation système Android ;
- logique de synchronisation bancaire ;
- algorithme de classification automatique des transactions ;
- palette couleur définitive ;
- illustrations décoratives ;
- gamification ;
- recommandations prescriptives du type `tu devrais réduire telle dépense` ;
- ancien découpage en parcours `ajustement` ou `imprevu-reel`.

# Critères de validation UX

- chaque écran possède une question identifiable ;
- sa réponse dominante est visible en moins de cinq secondes ;
- aucune vue ne ressemble à un dashboard multi-KPI ;
- budget libre, CP, fonds d'urgence et somme affectée à un objectif ne sont jamais confondus ;
- l'utilisateur sait distinguer fait, projection et simulation ;
- une hypothèse de simulation ne ressemble jamais à une donnée réelle déjà adoptée ;
- un objectif au-delà de la CP actuelle reste compréhensible et conservable ;
- aucune couleur ou icône n'est nécessaire pour comprendre un dépassement ou un écart ;
- les écrans de réglage ne forcent pas artificiellement une réponse chiffrée ;
- le même pattern visuel signifie la même chose sur tous les parcours.

# Critères de validation UI

- composition mobile-first ;
- niveaux de gris suffisants pour comprendre toute la hiérarchie ;
- trois niveaux visuels maximum ;
- espacements en multiples de 8 ;
- chiffres tabulaires ;
- aucun montant cassé sur deux lignes ;
- pas d'ombre portée ;
- pas de barre de navigation ;
- pas de bouton principal plein ;
- pas d'anneau ou jauge radiale ;
- graphes relégués hors première lecture sauf justification explicite ;
- actions navigables signalées par `›` ;
- libellés bancaires longs testés et tronqués proprement ;
- positif et négatif traités avec la même hiérarchie visuelle.

# Livrable attendu de Stitch

Une seule famille visuelle cohérente contenant les écrans listés ci-dessus et leurs principaux états. La première passe doit rester en niveaux de gris afin de valider la structure avant toute exploration de couleur.

Les écrans doivent pouvoir être relus dans l'ordre des quatre parcours, mais ils doivent également fonctionner individuellement : chaque écran porte sa propre question et sa propre réponse dominante.

Aucun `projectId` Stitch, identifiant technique de cycle ou CREF ne doit être ajouté à ce brief. Codex résout les identifiants techniques lors de l'appel MCP Stitch.