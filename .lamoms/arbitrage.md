# Arbitrages temporaires — Gestio

> Fichier de travail temporaire destiné à centraliser les questions d’arbitrage avant intégration dans les artefacts métier définitifs.

## Fonds d’urgence et répartition de l’épargne

### 1. Comment déterminer le minimum du fonds d’urgence ?

**Décision retenue**

Le minimum du fonds d’urgence est défini à partir des dépenses vitales mensuelles de l’utilisateur, et non à partir d’une règle universelle fondée sur le revenu.

Gestio calcule et présente des niveaux de couverture exprimés en mois de dépenses vitales, par exemple 1, 3 ou 6 mois. L’utilisateur choisit ensuite le niveau de sécurité qu’il souhaite retenir et peut l’ajuster.

Formule de référence :

`fonds d’urgence cible = nombre de mois de couverture choisi × dépenses vitales mensuelles`

Le lien avec le modèle Gestio se fait naturellement via le **SB**, puisqu’il représente les montants affectés aux dépenses qualifiées comme vitales.

Gestio ne décide donc pas qu’un nombre donné de mois est « le bon montant ». Il donne le contexte, montre ce que représente chaque niveau de couverture et laisse l’utilisateur choisir.

On distingue :

- **montant actuel du fonds** : somme réellement réservée au fonds d’urgence ;
- **niveau de couverture** : `montant actuel / dépenses vitales mensuelles` ;
- **cible choisie** : nombre de mois de dépenses vitales que l’utilisateur souhaite couvrir.

Cette décision respecte le principe de Gestio : fournir assez de contexte pour permettre à l’utilisateur de prendre une décision adaptée à sa situation, sans imposer une règle budgétaire universelle.

### 2. Que faire si le fonds redescend sous ce minimum ?

**Décision retenue**

Lorsque le fonds d’urgence redescend sous son minimum choisi, sa reconstitution redevient prioritaire sur le financement courant des objectifs.

La capacité d’épargne reste entièrement utilisée : elle n’est pas réduite ni laissée sans affectation. Son affectation est temporairement modifiée pour reconstituer le fonds d’urgence.

Les objectifs existants ne sont ni supprimés ni annulés. Les sommes déjà affectées à ces objectifs restent intactes, mais leur financement futur est décalé tant que le fonds d’urgence n’a pas retrouvé son minimum.

Gestio doit rendre ce décalage visible et recalculer les projections des objectifs concernés afin que l’utilisateur comprenne l’impact de cette priorité sur leur calendrier.

Si la capacité d’épargne disponible est inférieure ou égale au montant nécessaire pour reconstituer le fonds, elle est entièrement affectée au fonds d’urgence pour la période concernée.

### 3. Que faire du surplus lorsque le minimum est atteint ?

**Décision retenue**

Le surplus devient disponible immédiatement pour les objectifs dès que le fonds d’urgence atteint son minimum, sans attendre le mois suivant.

La priorité au fonds d’urgence s’applique donc uniquement au montant nécessaire pour atteindre sa cible. Le reste de la capacité d’épargne de la même période est aussitôt réaffectable aux objectifs.

Exemple : si 200 € sont nécessaires pour reconstituer le fonds d’urgence et que la capacité d’épargne du mois est de 800 €, 200 € sont affectés au fonds et les 600 € restants sont immédiatement disponibles pour les objectifs.

Cette règle maintient le principe selon lequel la capacité d’épargne est entièrement utilisée, tout en évitant de bloquer inutilement le financement des objectifs une fois le niveau de sécurité rétabli.

### 4. Que faire quand la capacité d’épargne ne couvre plus les efforts choisis ?

**Décision retenue**

Gestio ne rééquilibre pas automatiquement les objectifs et ne modifie aucun effort mensuel à l’insu de l’utilisateur.

Lorsque la somme des efforts mensuels choisis pour les objectifs dépasse la capacité d’épargne disponible, Gestio montre clairement l’écart entre les deux et indique que le plan actuel n’est plus compatible avec la capacité d’épargne observée.

Gestio propose alors à l’utilisateur de modifier lui-même les efforts mensuels de ses objectifs afin que leur somme redevienne compatible avec la capacité d’épargne disponible.

La contrainte de référence devient donc :

`Somme des efforts mensuels des objectifs ≤ capacité d’épargne disponible`

Exemple : si les objectifs représentent 800 €/mois alors que la capacité d’épargne est désormais de 600 €/mois, Gestio affiche l’écart de 200 € et invite l’utilisateur à revoir la répartition des efforts mensuels entre ses objectifs jusqu’à revenir à un total de 600 € ou moins.

Gestio accompagne la décision en montrant les conséquences des nouveaux efforts sur les projections et échéances des objectifs, mais ne choisit pas à la place de l’utilisateur quels objectifs doivent être ralentis.

## Première utilisation et consultation

### 5. À qui s’adresse prioritairement la première version ?

**Décision retenue**

La première version de Gestio s’adresse plus largement aux personnes souhaitant comprendre et organiser leurs finances.

Elle n’est donc pas limitée aux étudiants financièrement autonomes. Le besoin central retenu est la volonté de mieux comprendre sa situation financière réelle, puis de l’organiser de manière cohérente avec ses dépenses, son épargne et ses objectifs.

### 6. Comment commence la première ouverture ?

**Décision retenue**

Gestio conserve les questions préalables avant l’import des données financières.

La première ouverture commence donc par un échange avec l’utilisateur sur sa perception de son épargne, sa situation et ses intentions. Ces réponses constituent un premier contexte exprimé par l’utilisateur avant que Gestio n’observe ses données financières réelles.

L’import des données intervient ensuite. Gestio peut alors confronter la perception initiale de l’utilisateur aux faits observés, sans remplacer ce qu’il a exprimé au départ.

L’ordre retenu est donc :

`questions initiales → import des données → observation et analyse de la situation réelle`

### 7. Quelle réponse doit dominer l’écran quotidien ?

**Décision retenue**

La réponse qui doit être comprise en premier sur l’écran quotidien est : **« Combien puis-je encore dépenser ? »**

L’écran quotidien doit donc mettre en avant le budget libre et l’argent réellement utilisable à l’instant présent sans compromettre les dépenses déjà attendues.

La situation financière globale reste accessible et utile, mais elle constitue un niveau d’information secondaire par rapport à cette question immédiate d’usage quotidien.

## Point de situation

### 8. Que montre ce parcours avant l’existence d’objectifs personnels ?

**Décision différée.**

L’écran / parcours « point de situation » n’a pas encore été repris dans la refonte actuelle et doit d’abord être repensé avant de décider précisément ce qu’il montre pendant la constitution du fonds d’urgence ou après la création d’objectifs.

Cette question sera réouverte lors de la refonte de cet écran afin d’éviter de figer un comportement à partir d’une ancienne conception qui n’est plus représentative du produit actuel.

### 9. Comment suivre plusieurs objectifs ?

**À arbitrer.**

Veut-on d’abord une vue d’ensemble de tous les objectifs et de leurs progressions, puis le détail de chacun, ou un suivi centré sur un objectif sélectionné ?

### 10. Le rendez-vous hebdomadaire fait-il partie de la première version ?

**À arbitrer.**

Le corpus prévoit une notification hebdomadaire, avec un jour choisi par l’utilisateur. Est-ce à conserver dès le départ, ou le point de situation reste-t-il uniquement consulté à l’initiative de l’utilisateur ?

## Simulation et organisation des dépenses

### 11. Quelles simulations doivent être disponibles dès la première version ?

**Décision retenue**

La première version conserve l’ensemble des possibilités de simulation identifiées :

- changer l’effort mensuel ou le montant d’un objectif ;
- modifier la répartition ou l’organisation des dépenses ;
- envisager une dépense ponctuelle ;
- ajouter, modifier ou supprimer une dépense récurrente ;
- mesurer l’effet d’un imprévu sur le fonds d’urgence et sa reconstitution.

La formulation liée aux « pockets de dépenses » est abandonnée conformément à la décision de la question 12. La capacité de simulation est conservée, mais devra s’appuyer sur le nouveau modèle de catégorisation des dépenses.

### 12. Comment l’utilisateur organise-t-il ses dépenses et ses comptes courants ?

**Décision retenue**

Le concept métier de **pocket de dépense** est retiré de Gestio. Gestio distingue désormais clairement le support financier, l’usage que l’utilisateur veut en faire et la nature réelle des transactions qui y passent.

Le modèle de travail devient :

`compte bancaire → transactions → catégorie / sous-catégorie`

avec, côté Gestio, un rôle ou un usage attendu pouvant être associé par l’utilisateur à un compte courant.

Il faut donc distinguer trois niveaux :

- **type du compte** : nature bancaire du support, par exemple un compte courant ;
- **usage attendu du compte** : rôle que l’utilisateur souhaite donner à ce compte dans son organisation personnelle, par exemple « courses » ou « voiture » ;
- **catégorie / sous-catégorie d’une transaction** : nature de la dépense ou du revenu réellement observé sur ce compte.

Les catégories Powens restent attachées aux transactions et non au compte bancaire lui-même. Le rôle attribué au compte est donc un concept propre à Gestio : il sert à exprimer l’intention d’organisation de l’utilisateur sans modifier la nature bancaire du compte ni la catégorisation réelle de ses transactions.

Cette séparation permet à Gestio de détecter les écarts entre l’usage prévu d’un compte et son usage réel.

Exemple :

- compte A : usage attendu « courses » ;
- compte B : usage attendu « voiture » ;
- une transaction classée « courses / supermarché » apparaît sur le compte B.

Gestio peut alors constater que cette transaction ne correspond pas à l’usage normalement prévu pour le compte B et le signaler à l’utilisateur. L’objectif n’est pas d’empêcher la transaction ni de la reclasser automatiquement, mais de rendre visible l’écart afin que l’utilisateur puisse comprendre et mieux organiser ses comptes.

Ce modèle évite de fusionner les rôles des objets : le compte reste un support financier, la transaction reste un mouvement observé, la catégorie décrit ce mouvement, et le rôle du compte exprime l’organisation voulue par l’utilisateur.

La relation entre un rôle de compte et les catégories ou sous-catégories compatibles n’est pas figée à ce stade. Gestio doit d’abord exploiter la taxonomie réellement disponible via Powens. Si cette taxonomie permet de couvrir correctement les usages attendus, elle sert directement de base. Si certains cas ne sont pas suffisamment représentés, Gestio pourra ajouter une couche métier d’adaptation sans modifier les catégories sources fournies par Powens.

Cette décision implique qu’il faudra revoir les concepts du glossaire et les calculs encore exprimés en termes de pockets, notamment la qualification vital / plaisir ainsi que les définitions de SB et SPP. Cet impact devra être traité explicitement lors de la consolidation du modèle métier.

## Données incomplètes ou ambiguës

### 13. Que peut-on consulter quand certaines données manquent ?

**À arbitrer.**

Par exemple, les transactions sont disponibles mais pas leurs catégories : souhaite-t-on afficher les informations fiables et rendre indisponibles seulement les analyses concernées, ou bloquer le parcours jusqu’à résolution ?

### 14. Comment traiter un virement dont la nature est incertaine ?

**À arbitrer.**

Si Gestio ne sait pas s’il s’agit d’un transfert entre comptes personnels ou d’un véritable revenu/d’une dépense, faut-il demander une confirmation avant de l’intégrer aux calculs concernés ? Que doit voir l’utilisateur en attendant ?
