# Template d’une fiche de parcours Lamoms

```yaml
journey_id: usage-courant
project_id: gestio
title: "Usage courant — où j'en suis ?"
journey:
  intent: "Permettre à l'utilisateur de comprendre où en est sa situation financière à un instant donné, ce qui a changé récemment et si une action mérite d'être envisagée."
  actor: "Utilisateur de Gestio après la construction de sa première situation financière."
  trigger: "Ouverture de Gestio dans l'usage courant ou consultation volontaire de sa situation financière."
  expected_outcome: "L'utilisateur obtient une vue actualisée de sa situation financière sur la période choisie, de son rythme financier, de sa capacité financière, de son fonds d'urgence et des changements significatifs depuis sa dernière consultation, sans être obligé d'agir."
  artifact_decision: "La fiche conserve la définition durable du parcours. Les données financières, classifications de pockets, capacités calculées et changements détectés appartiennent à l'état métier de Gestio et ne sont pas dupliqués comme artefacts documentaires parallèles."
  scope_in:
    - "Actualiser les données financières disponibles."
    - "Permettre une consultation mensuelle ou annuelle de la situation financière."
    - "Afficher l'argent déjà entré et déjà sorti sur la période."
    - "Afficher l'argent encore attendu en entrée et les dépenses encore attendues."
    - "Afficher une projection de fin de période."
    - "Afficher la répartition des dépenses par pockets."
    - "Afficher le rythme financier habituel : revenus, dépenses et épargne observés, ainsi que leur variabilité."
    - "Afficher la capacité financière estimée, c'est-à-dire le montant jugé réellement épargnable de façon soutenable."
    - "Afficher le fonds d'urgence et son rôle de protection."
    - "Mettre en évidence les changements significatifs depuis la dernière consultation."
    - "Proposer, lorsque c'est pertinent, un lien vers un parcours d'ajustement ou de traitement d'un imprévu réel."
  scope_out:
    - "Afficher les objectifs détaillés dans la vue principale d'usage courant."
    - "Forcer l'utilisateur à agir lorsqu'un changement est détecté."
    - "Décider automatiquement d'un ajustement à appliquer."
    - "Créer, modifier ou évaluer un objectif financier dans ce parcours."
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
      visible_result: "Gestio affiche les entrées déjà reçues, les sorties déjà effectuées, les entrées encore attendues, les sorties encore attendues, une projection de fin de période et la répartition des dépenses par pockets."
      possible_error: "Une entrée ou une sortie future peut être inconnue ou incertaine ; Gestio doit distinguer les faits observés des projections."
      state: expected
    - action: "L'utilisateur consulte son rythme financier et sa capacité financière."
      visible_result: "Gestio affiche les revenus, dépenses et épargne habituellement observés, leur variabilité, puis la capacité financière estimée comme réellement épargnable de façon soutenable."
      possible_error: "Si l'historique est insuffisant ou atypique, Gestio rend explicite la limite de fiabilité de l'analyse."
      state: expected
    - action: "L'utilisateur consulte son fonds d'urgence."
      visible_result: "Gestio affiche le montant disponible sur les comptes que l'utilisateur a désignés comme fonds d'urgence et le présente comme une réserve de protection distincte de l'argent librement mobilisable pour les objectifs."
      possible_error: "Si aucun compte n'est désigné ou si les données sont indisponibles, Gestio l'indique sans inventer de fonds d'urgence."
      state: expected
    - action: "L'utilisateur consulte les changements significatifs depuis sa dernière consultation."
      visible_result: "Gestio explique les variations importantes détectées, par exemple une dérive de dépense, une variation inhabituelle ou une évolution notable de capacité financière."
      possible_error: "S'il n'existe aucun changement significatif, Gestio n'invente pas d'alerte et peut simplement indiquer qu'aucune variation importante n'a été détectée."
      state: expected
    - action: "Lorsqu'un changement s'y prête, l'utilisateur peut choisir de poursuivre vers une action proposée."
      visible_result: "Gestio propose un lien vers ajustement ou imprevu-reel lorsque le changement détecté correspond à l'un de ces besoins ; l'utilisateur reste libre de ne pas poursuivre."
      possible_error: "Si aucun parcours complémentaire n'est pertinent, aucun lien d'action n'est imposé."
      state: expected
  success_result: "L'utilisateur comprend où il en est sur la période choisie, son rythme financier, sa capacité financière, son niveau de protection et ce qui a changé récemment, puis peut soit quitter Gestio, soit poursuivre volontairement vers un autre parcours pertinent."
  exit_conditions:
    - "L'utilisateur termine sa consultation sans autre action."
    - "L'utilisateur suit un lien vers ajustement."
    - "L'utilisateur suit un lien vers imprevu-reel."
    - "L'utilisateur navigue volontairement vers un autre parcours, notamment objectif ou simulation."

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
  - "premiere-ouverture"
  - "objectif"
  - "simulation"
  - "ajustement"
  - "imprevu-reel"
code_refs: []
evidence_refs: []
status: draft

progress:
  current_section: journey
  completed_sections: []
  section_reviews:
    journey:
      status: pending | accepted | correction
      validated_by:
      validated_at:
      decision:
  rupture:
    section:
    reason:
    observed_at:
    resume_action:
```
