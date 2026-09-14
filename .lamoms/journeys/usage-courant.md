# Fiche de parcours — Usage courant

Cette fiche suit le modèle Lamoms `knowledge/templates/JOURNEY_TEMPLATE.md`.

```yaml
journey_id: usage-courant
project_id: gestio
title: "Usage courant — où j'en suis ?"
journey:
  intent: "Permettre à l'utilisateur de comprendre où en est sa situation financière à un instant donné, ce qui a changé récemment et si une action mérite d'être envisagée."
  actor: "Utilisateur de Gestio après la construction de sa première situation financière."
  trigger: "Ouverture de Gestio dans l'usage courant ou consultation volontaire de sa situation financière."
  expected_outcome: "L'utilisateur obtient une vue actualisée de sa situation financière sur la période choisie, de son rythme financier, de ses engagements planifiés, de sa capacité d'épargne, de son budget libre, de son fonds d'urgence et des changements significatifs depuis sa dernière consultation, sans être obligé d'agir."
  artifact_decision: "La fiche conserve la définition durable du parcours. Les données financières, classifications de pockets, dépenses planifiées, capacités calculées, budgets libres et changements détectés appartiennent à l'état métier de Gestio et ne sont pas dupliqués comme artefacts documentaires parallèles."
  scope_in:
    - "Actualiser les données financières disponibles."
    - "Permettre une consultation mensuelle ou annuelle de la situation financière."
    - "Afficher l'argent déjà entré et déjà sorti sur la période."
    - "Afficher l'argent encore attendu en entrée et les dépenses encore attendues."
    - "Intégrer aux sorties futures les dépenses ponctuelles ou récurrentes que l'utilisateur a explicitement planifiées, notamment après validation d'une simulation."
    - "Distinguer une dépense observée, une dépense récurrente détectée ou connue, une dépense explicitement planifiée et une simple hypothèse de simulation."
    - "Afficher une projection de fin de période tenant compte, lorsque possible, des engagements futurs connus et planifiés."
    - "Afficher la répartition des dépenses par pockets."
    - "Afficher le rythme financier habituel en distinguant, lorsque possible, revenus et dépenses récurrents fixes, récurrents variables et ponctuels."
    - "Afficher la capacité d'épargne estimée (CP), c'est-à-dire le montant jugé réellement épargnable de façon soutenable."
    - "Afficher le budget libre à l'instant considéré en réservant les sorties déjà engagées ou suffisamment certaines, y compris les dépenses planifiées validées."
    - "Afficher le fonds d'urgence et son rôle de protection."
    - "Mettre en évidence les changements significatifs depuis la dernière consultation."
    - "Proposer, lorsque c'est pertinent, une poursuite volontaire vers objectif ou simulation."
  scope_out:
    - "Afficher les objectifs détaillés dans la vue principale d'usage courant."
    - "Transformer une hypothèse non validée de simulation en dépense future de la situation courante."
    - "Planifier automatiquement une dépense sans décision explicite de l'utilisateur."
    - "Forcer l'utilisateur à agir lorsqu'un changement est détecté."
    - "Décider automatiquement d'un ajustement à appliquer."
    - "Créer, modifier ou évaluer un objectif financier dans ce parcours."
    - "Transformer un imprévu réel en parcours autonome distinct de l'actualisation de la situation ou de la simulation."
    - "Définir ici les écrans ou l'architecture technique détaillée."

user_flow:
  preconditions:
    - "Une première situation financière a déjà été construite dans le parcours premiere-ouverture."
    - "Gestio dispose d'au moins une source de données financière exploitable."
  steps:
    - action: "L'utilisateur ouvre Gestio pour consulter sa situation."
      visible_result: "Gestio actualise les données disponibles et présente la situation courante sans demander d'action obligatoire."
      possible_error: "Certaines données peuvent être indisponibles ou obsolètes ; Gestio doit rendre visible cette limite plutôt que présenter une situation comme entièrement à jour."
      state: expected
    - action: "L'utilisateur choisit une vue mensuelle ou annuelle."
      visible_result: "La situation est présentée sur la période choisie."
      possible_error: "La période peut être partiellement couverte par l'historique disponible ; cette couverture doit être indiquée."
      state: expected
    - action: "L'utilisateur consulte sa situation actuelle."
      visible_result: "Gestio affiche les entrées déjà reçues, les sorties déjà effectuées, les entrées encore attendues, les sorties encore attendues, les dépenses planifiées validées, une projection de fin de période et la répartition des dépenses par pockets."
      possible_error: "Une entrée ou une sortie future peut être inconnue ou incertaine ; Gestio doit distinguer les faits observés, les récurrences connues, les engagements planifiés et les projections."
      state: expected
    - action: "L'utilisateur consulte une dépense future qu'il a planifiée."
      visible_result: "Gestio indique qu'il s'agit d'un engagement planifié, conserve son montant et son échéance ou sa périodicité, et l'intègre aux calculs de situation pertinents. Une dépense ponctuelle reste attachée à son échéance ; une dépense récurrente est prise en compte selon sa périodicité tant qu'elle reste active."
      possible_error: "Une dépense planifiée est devenue obsolète, son échéance est passée sans transaction correspondante ou ses paramètres sont incomplets ; Gestio doit rendre cette incohérence visible et permettre sa réévaluation plutôt que la traiter silencieusement comme un fait."
      state: expected
    - action: "L'utilisateur consulte son rythme financier, sa capacité d'épargne et son budget libre."
      visible_result: "Gestio affiche les revenus, dépenses et épargne habituellement observés, leur variabilité, la capacité d'épargne estimée (CP) et, lorsque calculable, l'argent réellement disponible à l'instant considéré après prise en compte des sorties déjà engagées ou suffisamment certaines, y compris les dépenses planifiées validées."
      possible_error: "Si l'historique ou les engagements futurs sont insuffisamment connus, Gestio rend explicite la limite de fiabilité des valeurs concernées."
      state: expected
    - action: "L'utilisateur consulte son fonds d'urgence."
      visible_result: "Gestio affiche le montant disponible sur les comptes que l'utilisateur a désignés comme fonds d'urgence et le présente comme une réserve de protection distincte des avoirs potentiellement affectables à un objectif."
      possible_error: "Si aucun compte n'est désigné ou si les données sont indisponibles, Gestio l'indique sans inventer de fonds d'urgence."
      state: expected
    - action: "L'utilisateur consulte les changements significatifs depuis sa dernière consultation."
      visible_result: "Gestio explique les variations importantes détectées, par exemple une dérive de dépense, une variation inhabituelle, une évolution notable de capacité d'épargne, un changement du budget libre ou l'effet d'un nouvel engagement planifié."
      possible_error: "S'il n'existe aucun changement significatif, Gestio n'invente pas d'alerte et peut simplement indiquer qu'aucune variation importante n'a été détectée."
      state: expected
    - action: "Lorsqu'un changement s'y prête, l'utilisateur peut choisir de poursuivre vers un autre parcours."
      visible_result: "Gestio peut proposer un lien vers objectif ou simulation lorsque l'utilisateur souhaite transformer son constat en projet, tester une nouvelle dépense ou explorer une autre hypothèse ; l'utilisateur reste libre de ne pas poursuivre."
      possible_error: "Si aucun parcours complémentaire n'est pertinent, aucun lien d'action n'est imposé."
      state: expected
  success_result: "L'utilisateur comprend où il en est sur la période choisie, son rythme financier, les engagements futurs qu'il a réellement planifiés, sa capacité d'épargne, son budget libre, son niveau de protection et ce qui a changé récemment, puis peut soit quitter Gestio, soit poursuivre volontairement vers objectif ou simulation."
  exit_conditions:
    - "L'utilisateur termine sa consultation sans autre action."
    - "L'utilisateur navigue volontairement vers objectif."
    - "L'utilisateur navigue volontairement vers simulation pour tester une nouvelle hypothèse ou réévaluer une dépense future."
    - "L'utilisateur quitte Gestio."

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
  - "premiere-ouverture: précondition nominale ; construit la première situation financière"
  - "objectif: poursuite volontaire pour exprimer et évaluer un projet financier"
  - "simulation: poursuite volontaire pour explorer une hypothèse à partir de la situation de référence ; une dépense explicitement validée dans simulation peut revenir dans usage-courant comme engagement planifié"
code_refs: []
evidence_refs: []
status: draft

progress:
  current_section: execution_flow
  completed_sections:
    - journey
    - user_flow
    - journey_links
  section_reviews:
    journey:
      status: pending
      validated_by:
      validated_at:
      decision:
    user_flow:
      status: pending
      validated_by:
      validated_at:
      decision:
    journey_links:
      status: pending
      validated_by:
      validated_at:
      decision:
  rupture:
    section: execution_flow
    reason: "Le cadrage utilisateur est écrit et intègre désormais les dépenses planifiées validées provenant notamment de simulation ; le flux d'exécution système n'a pas encore été planifié."
    observed_at: "2026-09-14"
    resume_action: "Reprendre usage-courant.md à execution_flow lors de la phase de planification et décrire le flux système attendu pas à pas."
```

## Notes de cadrage

- La **situation actuelle** est consultable, pour la première version, sur une période **mensuelle ou annuelle**.
- Le **rythme financier** décrit les revenus, dépenses et épargne habituels dans le temps et distingue lorsque possible les comportements récurrents fixes, récurrents variables et ponctuels.
- Une **dépense planifiée** est un engagement futur explicitement retenu par l'utilisateur. Elle peut être ponctuelle avec une échéance ou récurrente avec une périodicité. Elle est distincte d'une simple hypothèse de simulation.
- Lorsqu'une dépense testée dans `simulation` est explicitement validée comme engagement futur réel, elle devient une dépense planifiée et entre dans `usage-courant`.
- Les dépenses planifiées validées participent aux sorties futures connues, aux projections pertinentes et au calcul du **budget libre**.
- La **capacité d'épargne (CP)** est structurelle et mensuelle ; le **budget libre** décrit l'argent réellement disponible à un instant donné après réservation des sorties déjà engagées ou suffisamment certaines, y compris les dépenses planifiées validées.
- Le **fonds d'urgence** reste une réserve de protection séparée des avoirs potentiellement affectables à un objectif.
- Les seuls parcours complémentaires de la refondation sont `objectif` et `simulation` ; la planification d'une dépense, l'ajustement et l'imprévu restent des capacités ou situations traitées à l'intérieur de ces parcours, pas des journeys autonomes.
