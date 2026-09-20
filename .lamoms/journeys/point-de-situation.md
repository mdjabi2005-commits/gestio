# Template d’une fiche de parcours Lamoms

Une fiche de parcours est l’artefact durable du projet. Elle est créée depuis
ce modèle avant le cadrage, puis complétée au fil des décisions, des sessions
CLI et de la cartographie. Elle distingue le sens du parcours, l’usage
attendu, son flux d’exécution et les traces que le journal devra rendre
lisibles.

`lamoms create journey <journey_id> --project <project_id> --title <titre>` instancie
ce modèle dans le projet avec le statut `draft`.

Pour tout chat de construction d’une application, la fiche est la référence
du parcours utilisateur et la sortie durable de la session. Une session n’est
pas considérée comme terminée tant que ses sections nécessaires ne sont pas
écrites, ou que le blocage et le prochain propriétaire ne sont pas inscrits
dans `progress.rupture`.

Le journal d’exécution réel peut être rattaché à un `cycle_id` généré au début
d’une exécution concrète. Ce champ n’est pas nécessaire au cadrage, au plan ou
au fonctionnement normal d’un journey.
La fiche ne contient donc pas les événements d’une exécution particulière ;
elle décrit les événements et le contexte qui doivent pouvoir être retrouvés.

```yaml
journey_id: point-de-situation
project_id: gestio
title: "Point de situation — suivre ma trajectoire"
journey:
  intent: "Permettre à l'utilisateur de comprendre l'évolution de sa trajectoire financière par rapport à un objectif suivi, puis d'explorer volontairement ce qui contribue aux écarts."
  actor: "Utilisateur de Gestio souhaitant faire le point sur sa trajectoire."
  trigger: "Consultation volontaire depuis l'usage courant ou l'objectif ; entrée par notification hebdomadaire décrite dans le corpus, à réconcilier avant validation du flux."
  expected_outcome: "L'utilisateur comprend sa progression, les limites des observations et les conséquences projetées, et choisit s'il souhaite examiner une pocket ou explorer un ajustement."
  artifact_decision: "La fiche conserve le contrat documentaire du suivi. Les objectifs, affectations, transactions, courbes et arbitrages restent des données métier ; les décisions de cadrage sont conservées dans .lamoms/decisions/."
  scope_in:
    - "Consulter la progression d'un objectif suivi et comparer l'épargne affectée observée à sa référence sur une période explicite."
    - "Présenter les écarts et leurs conséquences temporelles sans jugement, avec les limites des données et projections."
    - "Explorer volontairement les enveloppes, une pocket puis ses transactions pour comprendre les contributions."
    - "Accéder aux arbitrages ou à une simulation sans appliquer automatiquement un ajustement."
  scope_out:
    - "Créer ou évaluer initialement un objectif : cette responsabilité appartient au parcours autonome objectif."
    - "Remplacer le budget libre de l'usage courant par une mesure de trajectoire."
    - "Modifier automatiquement un objectif, une affectation d'épargne ou une enveloppe."
    - "Fixer ici les règles encore ouvertes d'allocation multi-objectifs, de fonds d'urgence ou d'accès sans objectif."

user_flow:
  preconditions:
    - "Disposer d'une situation financière exploitable ; ses lacunes restent visibles."
    - "Pour la lecture d'une trajectoire d'objectif, disposer d'un objectif et d'une référence identifiables. Le comportement sans objectif reste à arbitrer."
  steps:
    - action: "Ouvrir le point de situation."
      visible_result: "La période et l'objectif suivi sont identifiables ; les données indisponibles sont signalées."
      possible_error: "Objectif absent, observations insuffisantes ou données non actualisées ; comportement détaillé à valider."
      state: expected
    - action: "Lire la progression et la comparaison avec la référence."
      visible_result: "L'épargne affectée, les courbes disponibles et une explication de la différence sont présentées avec leur période et leurs limites."
      possible_error: "Une observation ou une référence manquante empêche une comparaison fiable ; elle n'est pas remplacée silencieusement par zéro."
      state: expected
    - action: "Explorer, si nécessaire, les enveloppes puis une pocket et ses transactions."
      visible_result: "La comparaison dépensé/prévu et les mouvements explicatifs permettent de comprendre la contribution de la pocket."
      possible_error: "Classement, affectation ou historique incomplet ; une contribution peut rester non déterminée."
      state: expected
    - action: "Choisir de traiter un arbitrage, d'explorer une simulation ou de quitter."
      visible_result: "L'utilisateur rejoint l'action choisie ; la simple consultation ne modifie pas sa situation de référence."
      possible_error: "Action indisponible ou données insuffisantes ; aucune modification automatique."
      state: expected
  success_result: "L'utilisateur comprend sa progression et ses limites et choisit librement la suite ; cette proposition de flux reste à valider humainement."
  exit_conditions:
    - "Retour à l'usage courant ou à l'objectif sans changement."
    - "Entrée volontaire dans simulation pour explorer un ajustement."

execution_flow:
  - user_action:
    system_action:
    tool_action:
    expected_result:
    expected_trace: []
    state: expected

journal_expectations:
  events:
    - event:
      flow_step_id:
      required_context: []
      expected_result:
      expected_error_or_blocking_state:

artifact_checkpoints:
  - artifact_id:
    artifact_type:
    produced_by:
    consumed_by:
    source_of_truth:
    state: expected
    version_or_ref:

evidence_expectations:
  per_step: true
  mandatory_fields: [nature, source, version]
  steps:
    - flow_step_id:
      scenario: decouverte | usage-installe
      claim:
      expected_result:
      observed_understanding:
      observed_friction:
      observed_result:
      nature:
      source:
      version:
      usage_validation_required:
      executed: true | false
      state: expected

ux_validation:
  status: pending | observed | accepted | correction | rejected
  observed_by:
  observed_at:
  feedback_refs: []
  evidence_refs: []
  validated_by:
  decision:

supporting_tools:
  - tool:
    role:
    input:
    output:
    trace:
    state: expected

dependencies: []
journey_links:
  - "objectif: parcours autonome de création et d'évaluation ; Point de situation consomme l'objectif et sa référence pour le suivi."
  - "usage-courant: entrée volontaire vers le suivi et retour vers la disponibilité à court terme."
  - "simulation: exploration volontaire d'un ajustement depuis le suivi, sans modification automatique de la référence."
  - "premiere-ouverture: construit la situation financière nécessaire en amont ; la création obligatoire d'un objectif à cette étape n'est pas décidée ici."
code_refs: []
evidence_refs: []
status: draft

progress:
  current_section: journey
  completed_sections: []
  section_reviews:
    journey:
      status: pending
      validated_by:
      validated_at:
      decision: "L'autonomie du parcours est acceptée dans point-de-situation-parcours-autonome ; le contenu détaillé proposé reste à réconcilier et valider."
    user_flow:
      status: pending
      validated_by:
      validated_at:
      decision: "Proposition documentaire issue du corpus ; aucune preuve d'exécution ou validation UX."
  rupture:
    section: journey
    reason: "Le découpage autonome est accepté. Restent les arbitrages sur l'accès sans objectif, le suivi multi-objectifs, les règles de capacité et d'urgence, puis la validation des sections de cadrage."
    observed_at: "2026-09-21"
    resume_action: "Maître de projet : arbitrer les points ouverts dans docs/CADRAGE_PORTE_1.md. Cadrage : reprendre sections/get/set --as cadrage sur point-de-situation ; plan : renseigner ensuite execution_flow attendu. Vérifier avec lamoms check journey .lamoms/journeys/point-de-situation.md."
```

## Le nom du fichier est le `journey_id`

Une fiche s’appelle `<journey_id>.md`. **Son statut fixe son emplacement.**

```text
status ≠ validated  →  <projet>/.lamoms/journeys/<journey_id>.md
status = validated  →  knowledge/projects/<project_id>/journeys/<journey_id>.md
```

La bibliothèque publiée est indexée directement par `project_id`. Ce chemin ne
sert pas à nommer les agents (`<projet>-<role>`).

Jamais aux deux. `lamoms promote journey` **déplace**, il ne copie pas ; `lamoms reopen journey`
fait le trajet inverse et redescend le statut — sans lui, valider serait une
porte à sens unique et un parcours validé qui doit changer n’aurait plus
d’endroit où être édité.

Deux exemplaires du même fait divergent toujours, et rien ne dit lequel a
raison (`concepts/ARTIFACT.md`). C’est aussi ce qui rend une bibliothèque
distante tenable : un exemplaire, un seul endroit où écrire, rien à
synchroniser.

`lamoms check journey` refuse les deux fautes : une fiche `validated` restée dans son
projet, une fiche non validée posée dans la bibliothèque.

Le `project_id` est porté par le chemin publié et déclaré dans la fiche pour
relier celle-ci au projet. Le dépôt local porte le même nom que ce
`project_id`.

Consequence utile : une mention `demarrer-cadrage` dans un texte, dans
`journey_links` ou dans `dependencies` designe a la fois le parcours et son
fichier. Il n’y a pas de regle de transformation a connaitre.

## Qui remplit quoi

Une fiche n’a pas un auteur, elle en a plusieurs. Elle est ouverte avant le
cadrage puis **complétée section par section, chacune par le maillon dont c’est
le métier** : elle n’est complète qu’après être passée par les outils concernés.
C’est pourquoi `progress.section_reviews` porte un `validated_by` et un
`handoff_id` par section — chaque section a été confirmée par quelqu’un, à un
passage identifiable.

Deux colonnes, et il faut les lire comme telles. Le **rôle** est ce que
`lamoms set journey --as` accepte : il est durable et ne bouge pas quand les outils
changent. L'**outil** est qui tient ce rôle aujourd'hui : il bouge, et il se
réattribue dans `methods/CHAINE_OUTILS.md`, jamais ici. `lamoms sections journey`
affiche les deux.

| Section | Rôle (`--as`) | Outil aujourd'hui |
|---|---|---|
| `journey` | `cadrage`, avec le maître de projet | ChatGPT + maître de projet |
| `user_flow` | `cadrage`, avec le maître de projet | ChatGPT + maître de projet |
| `execution_flow` | `plan` pour les lignes `expected`, `implementation` pour les `observed` | ChatGPT, puis Codex |
| `journal_expectations` | `plan` | ChatGPT |
| `artifact_checkpoints` | `plan` | ChatGPT |
| `evidence_expectations` | `plan` pour les preuves attendues ; `reviewT` pour ce qui est constaté | ChatGPT, puis ChatGPT Work |
| `supporting_tools` | `implementation` pour ce qui est constaté, `plan` pour les dépendances imposées | ChatGPT |
| `dependencies` | `plan` | ChatGPT |
| `journey_links` | `cadrage` | ChatGPT |
| `code_refs` | `implementation` | Codex |
| `evidence_refs` | `lamoms` | Codex |
| `ux_validation` | `humain` — le public ou un validateur autorisé, jamais un agent | ChatGPT Work fournit les observations, puis le maître de projet valide |
| `status`, `progress`, `rupture` | `lamoms` et le maître de projet | maître de projet |

## Sortie obligatoire de chaque session

À la fin d’un chat de construction, le rôle qui vient de travailler complète
ses sections avant de répondre :

- **Cadrage ChatGPT** : `journey`, `user_flow`, `journey_links`.
- **Plan ChatGPT** : `execution_flow` attendu, `journal_expectations`,
  `artifact_checkpoints`, `evidence_expectations` attendues,
  `supporting_tools` et `dependencies`.
- **Implémentation Codex** : `execution_flow` constaté, `supporting_tools`
  constatés, `code_refs` et `evidence_refs`.
- **Test UX ChatGPT Work** : `evidence_expectations` constatées avec le rôle
  `reviewT` ; il ne valide pas `ux_validation`.
- **Maître de projet** : `ux_validation`, `status`, `progress` et la décision
  finale.

Si une section ne peut pas être complétée, la session doit inscrire la raison
et le prochain propriétaire dans `progress.rupture`. Une réponse seule dans le
chat ne constitue pas une sortie durable.

**Renommés le 2026-09-06.** Ces rôles s'appelaient `hermes-public`,
`hermes-project`, `agy` et `claude` : des noms d'**outils** dans une table qui
se déclare faite de **rôles**. Une mise en veille laissait donc croire qu'une
section n'avait plus de propriétaire.

Les valeurs acceptées viennent maintenant de `methods/CHAINE_OUTILS.md`, **et de
nulle part ailleurs** : c'est la seule liste de rôles du système, et aucune autre
fiche n'en énumère une concurrente. Minuscules, sauf `reviewT` et `reviewCode`.
`implementation` s'écrit sans accent parce que c'est un identifiant tapé en ligne
de commande.

`humain` et `lamoms` ne sont pas des rôles d'agent et n'ont pas à figurer dans
cette liste : l'un est le maître de projet, l'autre les traces du runtime.

Une section vide n’est pas une fiche incomplète par négligence : c’est un
maillon qui n’est pas encore passé. `progress.rupture` désigne le premier
endroit où la chaîne s’est arrêtée, et le parcours y reprend sans réécrire ce
qui précède.

`journey`, `user_flow` et `ux_validation` sont les trois sections qu’aucun agent
ne peut clore seul : elles engagent le public et le besoin, et demandent la
confirmation du maître de projet.

`execution_flow` et `supporting_tools` n’ont pas un producteur mais deux, et le
`state` de chaque ligne dit lequel : ce qui est **visé** relève du plan, ce qui
est **constaté** relève de l’implémentation et de son observation réelle. Une
ligne sans `state` n’a donc pas de producteur identifiable : c’est le premier
symptôme d’une section à reprendre.

## Règles de lecture

- `journey` répond à **pourquoi**, **pour qui** et **quel résultat**.
- `artifact_decision` précise quels artefacts durables le parcours doit
  conserver et s’il faut éviter un doublon runtime ou une conservation parallèle
  par un outil. La fiche elle-même reste l’artefact durable du projet ; les
  chemins et traces d’exécution restent dans les sections dédiées.
- `user_flow` répond à **comment l’utilisateur agit** et ce qu’il voit.
- `execution_flow` répond à **comment le système réalise l’action**. C’est une
  séquence : elle suit le `user_flow` pas à pas et dit, pour chaque action de
  l’utilisateur, les actions système et outil, le résultat attendu et les
  traces que le passage doit laisser. Elle ne redit ni pourquoi (`journey`)
  ni ce que l’utilisateur voit (`user_flow`).

  Son `state` n’est pas décoratif : `observed` veut dire que le système fait
  déjà cela et que quelqu’un l’a vu ; `expected` veut dire que c’est la cible et
  que rien ne prouve encore que ça marche. Sans ce champ, une cible se lit comme
  un constat — et un parcours se déclare exécutable alors qu’il n’a jamais
  tourné.
- `journal_expectations` répond à **ce que l’exécution devra rendre traçable**.
- `artifact_checkpoints` décrit les artefacts attendus ou observés entre les
  étapes. Il indique qui les produit, qui les consomme, quelle est leur source
  de vérité et où en est leur état. Un checkpoint n’est pas automatiquement
  une preuve de réussite.
- `evidence_expectations` relie chaque étape validable du user-flow à une preuve
  dédiée. ChatGPT Work y ajoute, avec le rôle `reviewT`, le scénario joué,
  l’exécution réelle, la compréhension observée, les frictions et le résultat.
  La nature, la source et la version restent obligatoires ; la preuve ne vaut
  pas automatiquement verdict de réussite.
- `ux_validation` conserve la décision finale, après les observations de
  ChatGPT Work et le feedback du public ou d’un validateur humain autorisé.
  ChatGPT Work ne peut pas le déclarer accepté ou validé.
- `supporting_tools` est l’inventaire de **ce dont le parcours dépend pour
  tourner** : interface et backend Lamoms, outils et agents, tmux, WSL, Git,
  GitHub, CodeBurn, le journal, et le maître de projet lui-même quand sa
  décision conditionne la suite. Pour chacun : son rôle, ce qu’il reçoit, ce
  qu’il produit, la trace qu’il laisse et son `state`.

  Ce n’est pas un doublon d’`execution_flow`. L’un est une séquence, l’autre une
  liste de dépendances : `execution_flow` répond à « dans quel ordre »,
  `supporting_tools` à « qu’est-ce qui arrête le parcours si c’est absent ». Une
  CLI y a donc toute sa place — son indisponibilité arrête le parcours aussi
  sûrement qu’un tmux manquant.

  Le nom d’un outil est **le rôle, jamais la CLI qui le tient** : `reviewCode`,
  pas « OpenCode ou Copilot » ; `Claude`, pas « CLI Claude ». Même règle que le
  nomenclature des rôles dans
  [`../../methods/CHAINE_OUTILS.md`](../../methods/CHAINE_OUTILS.md) —
  changer de provider ne doit renommer aucune fiche. Un nom écrit deux façons
  différentes fait deux outils pour qui regroupe.

  Il ne remplace ni `code_refs` ni `journal_expectations`.
- `code_refs` décrivent l’implémentation retrouvée ; ils ne prouvent pas son
  bon fonctionnement.
- `evidence_refs` pointent vers des traces candidates ou vérifiées ; une trace
  technique ne vaut pas validation d’usage.
- `status` décrit l’état global de la fiche, pas le succès d’une exécution :
  `draft` (brouillon incomplet), `proposed` (parcours décrit mais non validé),
  `mapped` (parcours relié aux flux, artefacts et références), `tested`
  (parcours exécuté et vérifié techniquement), puis `validated` (parcours
  validé par l’humain ou le public).

  Deux valeurs supplémentaires ne sont pas de l’avancement mais une sortie
  de route : `abandoned` (le parcours ne sera pas fait) et `superseded`
  (un autre parcours le remplace — lequel se dit dans `journey_links`).
  Elles existent parce qu’un parcours arrêté laissé en `draft` se lit comme
  du travail en attente, et revient dans le tableau à chaque relecture.

  **« Bloqué » n’est pas un statut.** Un blocage a une raison et un point
  de reprise, pas seulement une couleur : c’est `progress.rupture` qui le
  porte. Un statut `blocked` dirait qu’il y a un problème sans dire lequel,
  et il faudrait le remettre à jour une deuxième fois quand il se dénoue.
- `progress` décrit l’avancement documentaire et le point de reprise ; il ne
  remplace pas `status` et ne prouve pas l’exécution du parcours.
- `rupture` désigne la première section absente, contradictoire, incomplète ou
  non confirmée. Le parcours reprend à cette section sans réécrire les
  sections précédentes conservées.

## Modifier une fiche

`bin/lamoms` édite une **section à la fois**, dans le texte du bloc, sans
resérialiser le reste : le fichier ressort octet pour octet en dehors de la
section visée.

```sh
lamoms sections journey <fiche>                  # sections et propriétaire
lamoms get journey <fiche> <section>             # lire avant d'écrire
lamoms set journey <fiche> <section> --as <rôle> # texte sur stdin
lamoms check journey --all                       # vérifier toutes les fiches
```

`--as` refuse une section qui n'appartient pas au rôle — c'est le tableau
« Qui remplit quoi » ci-dessus, appliqué. Une écriture qui rendrait le bloc
illisible est refusée avant d'atteindre le fichier : une fiche ne peut pas
être cassée par un agent qui remplit sa part.

`check` vérifie le YAML, les 17 sections, les doublons de section, l'énumération
des `state`, les outils nommés d'après leur CLI, et les étapes
d'`execution_flow` sans `state`.

## Lister les parcours

La fiche est la source de vérité ; la liste est calculée à chaque appel et ne
crée aucun fichier de suivi.

```sh
lamoms list journey
lamoms list journey --project gestio-core
lamoms list journey --status tested
```

La commande scanne les fiches **en cours** dans `<projet>/.lamoms/journeys/`
autant que celles promues dans la bibliothèque.

**Ce qu'un agent met à jour en repartant**, et rien d'autre : sa section, par
`lamoms set journey --as <rôle>`, puis `progress.rupture` — la première section qui
reste en panne, pourquoi, et l'action concrète qui la débloque. Un
`resume_action` du genre « continuer le backend » ne survit pas à deux
semaines d'absence ; il doit nommer le fichier, le symptôme et la commande
qui vérifie.

**Ce qu'aucun agent ne met à jour** : `status`, et `ux_validation` — ils
engagent le besoin, pas le code. `bin/lamoms` refuse déjà les deux par
`--as`.
