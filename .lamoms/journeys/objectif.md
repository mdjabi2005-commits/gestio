# Fiche de parcours — Objectif

Cette fiche suit le modèle Lamoms `knowledge/templates/JOURNEY_TEMPLATE.md`.

```yaml
journey_id: objectif
project_id: gestio
title: "Objectif — comprendre ce que mon projet implique"

journey:
  intent: "Permettre à l'utilisateur d'exprimer un objectif financier et de le confronter à sa situation financière réelle afin de comprendre ce qu'il implique avant de décider de le poursuivre."
  actor: "Utilisateur de Gestio disposant déjà d'une situation financière exploitable."
  trigger: "L'utilisateur souhaite créer ou consulter un objectif financier depuis Gestio, notamment après l'usage courant."
  expected_outcome: "L'utilisateur comprend le montant restant à financer, l'effort mensuel ou le délai correspondant à sa situation actuelle, l'écart éventuel avec sa capacité d'épargne et les suites possibles sans que Gestio décide à sa place."
  artifact_decision: "La fiche conserve la définition durable du parcours. Les objectifs personnels, les avoirs affectés, les paramètres choisis, les calculs de trajectoire et leur état courant appartiennent à l'état métier de Gestio et ne sont pas dupliqués comme artefacts documentaires parallèles."
  scope_in:
    - "Permettre à l'utilisateur de définir ce qu'il souhaite financer et son montant cible."
    - "Présenter les avoirs potentiellement affectables à l'objectif, notamment comptes d'épargne, portefeuille crypto ou autres supports pertinents, en excluant le fonds d'urgence."
    - "Permettre à l'utilisateur de choisir quelle part de ces avoirs il affecte déjà à l'objectif."
    - "Calculer le montant restant à financer après prise en compte de la somme déjà affectée."
    - "Permettre à l'utilisateur d'indiquer une échéance souhaitée sans la rendre obligatoire."
    - "Sans échéance, estimer un délai réaliste à partir de la capacité d'épargne actuelle (CP)."
    - "Avec échéance, calculer l'effort mensuel nécessaire et le comparer à la capacité d'épargne actuelle."
    - "Rendre explicite l'écart lorsque l'effort nécessaire dépasse la capacité d'épargne actuelle."
    - "Rendre explicite la part de capacité d'épargne restant disponible lorsque l'objectif n'en consomme qu'une partie."
    - "Permettre d'enregistrer un objectif même lorsqu'il n'est pas compatible avec la capacité d'épargne actuelle."
    - "Proposer une poursuite volontaire vers simulation lorsque l'utilisateur souhaite explorer d'autres paramètres ou des possibilités d'ajustement sans modifier immédiatement la référence."
  scope_out:
    - "Modifier automatiquement les pockets vitales ou plaisir pour rendre l'objectif compatible."
    - "Décider à la place de l'utilisateur quels avoirs doivent être liquidés ou affectés à l'objectif."
    - "Utiliser le fonds d'urgence comme somme librement affectable à un objectif."
    - "Considérer un objectif incompatible avec les paramètres actuels comme impossible ou interdit."
    - "Simuler dans ce parcours plusieurs variantes de montant, échéance, effort, somme initiale, SB ou SPP sans modifier l'objectif de référence."
    - "Définir ici les écrans ou l'architecture technique détaillée."

user_flow:
  preconditions:
    - "Une première situation financière exploitable a déjà été construite."
    - "Gestio dispose d'une capacité d'épargne actuelle issue de la situation et du rythme financier de l'utilisateur."
    - "Le fonds d'urgence est identifié séparément des avoirs potentiellement affectables à un objectif lorsqu'il existe."
  steps:
    - action: "L'utilisateur ouvre le parcours Objectif et décrit ce qu'il souhaite financer."
      visible_result: "Gestio lui permet de définir son objectif et son montant cible sans lui demander de déterminer lui-même l'effort mensuel nécessaire."
      possible_error: "Le montant cible est absent ou inexploitable ; Gestio doit demander une valeur exploitable avant de pouvoir évaluer l'objectif."
      state: expected
    - action: "L'utilisateur consulte les avoirs déjà disponibles susceptibles de contribuer à l'objectif."
      visible_result: "Gestio présente les comptes d'épargne, portefeuilles crypto et autres avoirs pertinents qu'il connaît comme potentiellement affectables, tout en excluant explicitement les comptes réservés au fonds d'urgence."
      possible_error: "Certains avoirs sont inconnus, indisponibles ou leur valorisation n'est pas suffisamment fiable ; Gestio doit rendre cette limite visible."
      state: expected
    - action: "L'utilisateur choisit les avoirs ou montants qu'il souhaite effectivement affecter dès maintenant à cet objectif."
      visible_result: "Gestio distingue les avoirs potentiellement affectables de la somme réellement affectée à l'objectif par décision de l'utilisateur."
      possible_error: "Une somme sélectionnée dépasse l'avoir disponible ou repose sur une valorisation devenue obsolète ; Gestio doit signaler l'écart et empêcher de présenter cette affectation comme acquise."
      state: expected
    - action: "L'utilisateur consulte le reste à financer."
      visible_result: "Gestio calcule le montant cible diminué de la somme déjà affectée à l'objectif et présente clairement le montant restant à financer."
      possible_error: "La somme affectée dépasse le montant cible ; Gestio doit signaler que l'objectif est déjà couvert ou demander à l'utilisateur de revoir l'affectation plutôt que produire un reste négatif sans explication."
      state: expected
    - action: "L'utilisateur choisit s'il souhaite fixer une échéance."
      visible_result: "L'échéance reste facultative : l'utilisateur peut soit indiquer une date ou une durée souhaitée, soit laisser Gestio estimer le délai correspondant à sa situation actuelle."
      possible_error: "L'échéance indiquée est incohérente ou déjà dépassée ; Gestio doit demander une échéance exploitable avant de calculer l'effort associé."
      state: expected
    - action: "Si aucune échéance n'est fixée, l'utilisateur demande à Gestio ce que sa situation actuelle permet."
      visible_result: "Gestio estime un délai réaliste à partir du montant restant à financer et de la capacité d'épargne actuelle (CP), en distinguant cette projection des faits observés."
      possible_error: "La capacité d'épargne est nulle, négative ou insuffisamment fiable ; Gestio doit expliquer pourquoi aucun délai fiable ne peut être proposé avec la situation actuelle."
      state: expected
    - action: "Si une échéance est fixée, l'utilisateur demande à Gestio ce qu'elle implique."
      visible_result: "Gestio calcule l'effort mensuel nécessaire pour financer le reste sur la durée choisie et le compare à la capacité d'épargne actuelle."
      possible_error: "Les données nécessaires au calcul sont insuffisantes ou incertaines ; Gestio doit rendre cette limite explicite au lieu de présenter une conclusion certaine."
      state: expected
    - action: "L'utilisateur consulte le résultat de l'évaluation de son objectif."
      visible_result: "Gestio indique si l'effort demandé tient dans la capacité d'épargne actuelle, la mobilise entièrement ou la dépasse. En cas de dépassement, Gestio quantifie l'écart ; en cas de capacité restante, il indique la part encore disponible."
      possible_error: "Une variation récente de la situation rend la capacité de référence obsolète ; Gestio doit signaler qu'une actualisation de la situation est nécessaire."
      state: expected
    - action: "L'utilisateur décide de la suite à donner à son objectif."
      visible_result: "Il peut conserver l'objectif tel quel, y compris lorsqu'un écart existe, modifier directement l'objectif de référence, explorer une simulation ou quitter le parcours. Gestio ne choisit pas à sa place."
      possible_error: "Aucun scénario complémentaire n'est pertinent ou disponible ; l'objectif peut néanmoins être conservé avec son état d'évaluation courant."
      state: expected
  success_result: "L'utilisateur dispose d'un objectif exprimé et évalué par rapport à sa situation financière réelle. Il comprend ce qu'il reste à financer, le délai ou l'effort mensuel associé, la part de capacité d'épargne mobilisée et l'écart éventuel. Il peut décider de conserver l'objectif, de le modifier ou de poursuivre volontairement vers simulation."
  exit_conditions:
    - "L'utilisateur enregistre ou conserve l'objectif tel qu'évalué."
    - "L'utilisateur modifie directement les paramètres de l'objectif de référence."
    - "L'utilisateur poursuit vers simulation pour explorer des hypothèses sans modifier immédiatement l'objectif de référence."
    - "L'utilisateur quitte le parcours sans enregistrer l'objectif."

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
  - "usage-courant: point d'entrée volontaire vers la création ou la consultation d'un objectif"
  - "simulation: permet d'explorer des variantes et possibilités d'ajustement sans modifier immédiatement l'objectif ou la situation de référence"
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
    reason: "Le cadrage utilisateur est écrit ; le flux d'exécution système n'a pas encore été planifié."
    observed_at: "2026-09-10"
    resume_action: "Reprendre objectif.md à execution_flow lors de la phase de planification et décrire le flux système attendu pas à pas."
```

## Notes de cadrage

- La relation entre les grandeurs financières est `SH = SB + SPP + CP`, avec `SH` considéré comme fixé par la situation observée et `CP` comme la part restante après `SB` et `SPP`.
- Le parcours Objectif utilise la capacité d'épargne actuelle comme référence ; il ne modifie pas lui-même `SB` ou `SPP` pour rendre un objectif compatible.
- Les **avoirs potentiellement affectables à un objectif** peuvent inclure des comptes d'épargne, portefeuilles crypto ou autres supports pertinents, mais le fonds d'urgence en est exclu.
- Un avoir potentiellement affectable n'est pas automatiquement affecté à l'objectif : l'utilisateur choisit ce qu'il souhaite réellement y consacrer.
- Un objectif peut être conservé même si son effort nécessaire dépasse la capacité d'épargne actuelle. L'écart devient une information à comprendre, pas une interdiction.
- Les ajustements de `SB` ou `SPP` sont explorés comme des possibilités dans le parcours `simulation`, pas comme un journey autonome.
