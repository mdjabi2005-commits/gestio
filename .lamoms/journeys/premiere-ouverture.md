# Fiche de parcours — Première ouverture

Cette fiche suit le modèle Lamoms `knowledge/templates/JOURNEY_TEMPLATE.md`.

```yaml
journey_id: premiere-ouverture
project_id: gestio
title: "Première ouverture — construire ma situation"

journey:
  intent: "Permettre à Gestio de passer d'un utilisateur dont il ne connaît encore rien à une première représentation suffisamment fiable de sa situation financière pour commencer à l'accompagner."
  actor: "Utilisateur de Gestio lors de sa première utilisation"
  trigger: "Première ouverture de Gestio, avant qu'une situation financière de référence ait été construite."
  expected_outcome: "L'utilisateur obtient une première situation financière exploitable, comprenant sa situation sur la période choisie, son rythme financier et une estimation de sa capacité d'épargne, puis peut entrer dans l'usage courant."
  artifact_decision: "La fiche conserve la définition durable du parcours. Les choix personnels de l'utilisateur (pockets, qualification vital/plaisir et comptes constituant le fonds d'urgence) appartiennent à l'état métier de Gestio et ne doivent pas être dupliqués comme artefacts documentaires parallèles."
  scope_in:
    - "Apporter les données financières nécessaires à une première analyse."
    - "Construire l'historique disponible et rendre explicite sa profondeur."
    - "Viser au moins 12 mois d'historique pour une situation de référence stable, sans bloquer l'analyse lorsqu'une profondeur moindre est disponible."
    - "Proposer un système initial de pockets que l'utilisateur peut personnaliser."
    - "Permettre à l'utilisateur de définir la nature vital/plaisir au niveau des pockets."
    - "Classer les transactions dans les pockets et permettre la correction par l'utilisateur."
    - "Permettre à l'utilisateur d'indiquer quels comptes d'épargne constituent son fonds d'urgence."
    - "Analyser le rythme financier observé, notamment les revenus et dépenses récurrents fixes, récurrents variables et ponctuels."
    - "Calculer une première capacité d'épargne (CP)."
    - "Afficher une première situation financière sur une vue mensuelle ou annuelle."
  scope_out:
    - "Créer obligatoirement un objectif financier."
    - "Décider à la place de l'utilisateur quelles dépenses sont vitales ou plaisir."
    - "Décider automatiquement quels comptes constituent le fonds d'urgence."
    - "Définir à ce stade l'algorithme technique de classement automatique des transactions dans les pockets."
    - "Définir les écrans ou l'architecture technique détaillée."

user_flow:
  preconditions:
    - "L'utilisateur ouvre Gestio pour la première fois ou aucune situation financière de référence n'a encore été construite."
    - "L'utilisateur peut fournir ou connecter au moins une source de données financières exploitable."
  steps:
    - action: "L'utilisateur démarre la première ouverture et apporte ses données financières."
      visible_result: "Gestio présente les comptes, soldes et l'historique qu'il a pu récupérer, ainsi que la profondeur d'historique disponible."
      possible_error: "Une source est indisponible, un compte ne remonte pas ou l'historique est partiel. Gestio doit rendre cette limite visible plutôt que prétendre disposer d'une situation complète."
      state: expected
    - action: "L'utilisateur consulte le niveau de recul disponible."
      visible_result: "Gestio indique si les 12 mois d'historique visés pour une situation de référence stable sont disponibles. Avec moins d'historique, une première analyse reste possible mais ses limites sont explicites."
      possible_error: "L'historique est trop faible pour certaines conclusions ; Gestio doit identifier les résultats concernés."
      state: expected
    - action: "L'utilisateur découvre le système de pockets proposé par Gestio."
      visible_result: "Gestio propose une structure initiale de pockets et un premier classement des transactions lorsqu'il est possible de le faire."
      possible_error: "Le classement proposé est incomplet ou incorrect ; cela ne doit pas empêcher l'utilisateur de poursuivre."
      state: expected
    - action: "L'utilisateur personnalise les pockets pour qu'ils correspondent à sa réalité."
      visible_result: "L'utilisateur peut adapter la structure proposée, notamment en renommant, ajoutant, supprimant ou regroupant des pockets selon les possibilités retenues par le produit."
      possible_error: "Une modification rend certaines transactions non classées ; Gestio doit les signaler afin qu'elles puissent être réaffectées."
      state: expected
    - action: "L'utilisateur qualifie ses pockets en vital ou plaisir."
      visible_result: "Chaque pocket concerné porte le sens donné par l'utilisateur. Gestio ne déduit pas cette qualification à sa place."
      possible_error: "Certains pockets restent non qualifiés ; Gestio doit rendre cette absence explicite et limiter les analyses qui en dépendent."
      state: expected
    - action: "L'utilisateur vérifie et corrige si nécessaire le classement des transactions dans les pockets."
      visible_result: "Le classement reflète suffisamment la réalité de l'utilisateur pour que Gestio puisse analyser ses finances sans demander une qualification transaction par transaction comme fonctionnement nominal."
      possible_error: "Certaines transactions restent ambiguës ou non classées ; elles sont signalées sans bloquer l'ensemble du parcours lorsqu'une analyse utile reste possible."
      state: expected
    - action: "L'utilisateur indique quels comptes d'épargne constituent son fonds d'urgence."
      visible_result: "Gestio distingue les comptes réservés au fonds d'urgence des autres avoirs potentiellement affectables à un objectif. Le rôle est attribué au niveau du compte, pas d'un montant arbitraire dans un compte."
      possible_error: "Aucun compte n'est désigné ; Gestio doit traiter cela comme l'absence déclarée de fonds d'urgence, et non en inventer un."
      state: expected
    - action: "L'utilisateur demande ou atteint la première synthèse de sa situation."
      visible_result: "Gestio affiche la situation actuelle sur la période choisie, mensuelle ou annuelle : argent déjà entré et sorti, argent encore attendu à entrer ou sortir lorsque cette information peut être projetée, et répartition des dépenses par pockets."
      possible_error: "Certaines entrées ou sorties futures ne peuvent pas être estimées ; elles doivent être présentées comme inconnues ou avec le niveau d'incertitude approprié."
      state: expected
    - action: "L'utilisateur consulte son rythme financier."
      visible_result: "Gestio affiche ce qui est habituellement gagné, dépensé et épargné par mois à partir de l'historique disponible, en distinguant les flux récurrents fixes, récurrents variables et ponctuels lorsque cette distinction est exploitable."
      possible_error: "Le recul disponible est insuffisant ou atypique ; Gestio doit signaler que le rythme calculé est moins représentatif."
      state: expected
    - action: "L'utilisateur consulte sa capacité d'épargne."
      visible_result: "Gestio affiche une estimation de la somme pouvant être épargnée de manière soutenable par mois (CP), distincte de l'épargne effectivement observée dans l'historique."
      possible_error: "La capacité d'épargne ne peut pas être estimée de façon suffisamment fiable ; Gestio doit expliquer quelles données ou qualifications manquent."
      state: expected
  success_result: "Une première situation financière exploitable est construite. L'utilisateur comprend où il en est sur une vue mensuelle ou annuelle, son rythme financier historique, sa capacité d'épargne estimée, la répartition de ses dépenses par pockets et la protection apportée par son fonds d'urgence. Il peut ensuite entrer dans l'usage courant sans être obligé de créer un objectif."
  exit_conditions:
    - "La première situation financière a été construite et l'utilisateur passe à l'usage courant."
    - "L'utilisateur interrompt le parcours avant d'avoir fourni assez de données ou de qualifications pour produire une première situation exploitable."
    - "Les données disponibles permettent seulement une analyse partielle ; Gestio peut poursuivre si cette limite est explicitement rendue visible."

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
  - "usage-courant: sortie nominale après construction de la première situation financière"
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
    resume_action: "Reprendre premiere-ouverture.md à execution_flow lors de la phase de planification et décrire le flux système attendu pas à pas."
```

## Notes de cadrage

- La **situation actuelle** est consultable, pour la première version, sur une période **mensuelle ou annuelle**. Des vues trimestrielles ou semestrielles pourront être envisagées plus tard sans être requises par ce parcours.
- Le **rythme financier** correspond à ce qui est habituellement gagné, dépensé et épargné par mois à partir de l'historique, en distinguant les comportements récurrents fixes, récurrents variables et ponctuels lorsque les données le permettent.
- La **capacité d'épargne (CP)** correspond à une estimation de ce qui peut être épargné de manière soutenable chaque mois. Elle est distincte de l'épargne effectivement observée.
- Gestio propose son propre système initial de **pockets**, que l'utilisateur peut personnaliser. La qualification **vital / plaisir** appartient à l'utilisateur.
- Le mécanisme technique de classement automatique des transactions dans les pockets reste volontairement non défini à ce stade. Il devra être conçu à partir des données réellement fournies par les API et validé avec une approche test-first/TDD.
- Le **fonds d'urgence** est constitué des comptes d'épargne explicitement désignés par l'utilisateur.
