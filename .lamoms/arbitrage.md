# Arbitrages temporaires — Gestio

> Fichier de travail temporaire destiné à centraliser les questions d’arbitrage avant intégration dans les artefacts métier définitifs.

## Fonds d’urgence et répartition de l’épargne

### 1. Comment déterminer le minimum du fonds d’urgence ?

**Décision retenue**

Le minimum du fonds d’urgence est défini à partir des dépenses vitales mensuelles de l’utilisateur, et non à partir d’une règle universelle fondée sur le revenu.

Gestio calcule et présente des niveaux de couverture exprimés en mois de dépenses vitales, par exemple 1, 3 ou 6 mois. L’utilisateur choisit ensuite le niveau de sécurité qu’il souhaite retenir et peut l’ajuster.

Formule de référence :

`fonds d’urgence cible = nombre de mois de couverture choisi × dépenses vitales mensuelles`

Le lien avec le modèle Gestio se fait naturellement via le **SB**, puisqu’il représente les montants affectés aux pockets qualifiées comme vitales.

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

**À arbitrer.**

Est-ce que Gestio commence par importer les données, puis échange avec l’utilisateur sur sa situation ? Ou conserve-t-on les questions préalables sur sa perception de son épargne et ses intentions ?

### 7. Quelle réponse doit dominer l’écran quotidien ?

**À arbitrer.**

« Combien puis-je encore dépenser ? » ou « Où en est ma situation financière ? » Les deux peuvent exister, mais laquelle doit être comprise en premier ?

## Point de situation

### 8. Que montre ce parcours avant l’existence d’objectifs personnels ?

**À arbitrer.**

Pendant la constitution du fonds d’urgence, doit-il déjà permettre de suivre le fonds et l’évolution de la situation, ou devient-il accessible seulement après cette étape ?

### 9. Comment suivre plusieurs objectifs ?

**À arbitrer.**

Veut-on d’abord une vue d’ensemble de tous les objectifs et de leurs progressions, puis le détail de chacun, ou un suivi centré sur un objectif sélectionné ?

### 10. Le rendez-vous hebdomadaire fait-il partie de la première version ?

**À arbitrer.**

Le corpus prévoit une notification hebdomadaire, avec un jour choisi par l’utilisateur. Est-ce à conserver dès le départ, ou le point de situation reste-t-il uniquement consulté à l’initiative de l’utilisateur ?

## Simulation et organisation des dépenses

### 11. Quelles simulations doivent être disponibles dès la première version ?

**À arbitrer.**

Possibilités actuellement présentes dans les documents :

- changer l’effort mensuel ou le montant d’un objectif ;
- modifier la répartition entre les pockets de dépenses ;
- envisager une dépense ponctuelle ;
- ajouter, modifier ou supprimer une dépense récurrente ;
- mesurer l’effet d’un imprévu sur le fonds d’urgence et sa reconstitution.

### 12. Comment l’utilisateur organise-t-il ses pockets de dépenses ?

**À arbitrer.**

Gestio propose-t-il une organisation initiale à partir des catégories disponibles, que l’utilisateur ajuste, ou l’utilisateur construit-il lui-même ses pockets ? Doit-il pouvoir regrouper plusieurs catégories dans une même pocket ?

## Données incomplètes ou ambiguës

### 13. Que peut-on consulter quand certaines données manquent ?

**À arbitrer.**

Par exemple, les transactions sont disponibles mais pas leurs catégories : souhaite-t-on afficher les informations fiables et rendre indisponibles seulement les analyses concernées, ou bloquer le parcours jusqu’à résolution ?

### 14. Comment traiter un virement dont la nature est incertaine ?

**À arbitrer.**

Si Gestio ne sait pas s’il s’agit d’un transfert entre comptes personnels ou d’un véritable revenu/d’une dépense, faut-il demander une confirmation avant de l’intégrer aux calculs concernés ? Que doit voir l’utilisateur en attendant ?
