# Fiche de parcours — Simulation

Cette fiche suit le modèle Lamoms `knowledge/templates/JOURNEY_TEMPLATE.md`.

```yaml
journey_id: simulation
project_id: gestio
title: "Simulation — mesurer les conséquences d'un scénario"

journey:
  intent: "Permettre à l'utilisateur d'explorer les conséquences d'un changement hypothétique sur sa situation financière ou sur un objectif, sans modifier immédiatement sa situation réelle."
  actor: "Utilisateur de Gestio disposant déjà d'une situation financière exploitable."
  trigger: "L'utilisateur souhaite tester une hypothèse sur son objectif, sa répartition financière, une dépense future, une nouvelle dépense récurrente ou un imprévu potentiel afin de comprendre ce que cela changerait."
  expected_outcome: "L'utilisateur compare clairement sa situation de référence à un scénario hypothétique, comprend les effets du changement testé sur sa capacité d'épargne, son budget libre, ses objectifs et sa protection, puis décide librement de poursuivre, d'abandonner ou de retenir certaines modifications."
  artifact_decision: "La fiche conserve la définition durable du parcours. Les scénarios, hypothèses temporaires, paramètres simulés et résultats calculés appartiennent à l'état métier de Gestio et ne sont pas dupliqués comme artefacts documentaires parallèles. Lorsqu'une dépense simulée est explicitement retenue par l'utilisateur comme dépense future réelle, elle quitte l'état purement hypothétique et devient un engagement planifié exploitable par usage-courant."
  scope_in:
    - "Partir d'une situation financière de référence déjà construite."
    - "Permettre une simulation d'objectif en faisant varier notamment le montant cible, l'échéance ou la somme déjà affectée."
    - "Permettre de tester des hypothèses de répartition portant sur SB ou SPP et recalculer CP tout en conservant SH comme référence fixe dans ce type de scénario."
    - "Permettre de simuler une dépense ponctuelle future en définissant au minimum son montant et son échéance afin d'en mesurer les conséquences avant de la planifier."
    - "Permettre de simuler l'ajout, la suppression ou la modification d'une dépense récurrente, notamment un abonnement."
    - "Pour une dépense récurrente, montrer son impact mensuel ainsi que son coût cumulé sur une période pertinente, notamment annuel lorsque cela aide à comprendre l'engagement."
    - "Mesurer l'impact d'une dépense simulée sur le budget libre, la capacité d'épargne, les objectifs concernés et, lorsque pertinent, la projection de situation."
    - "Permettre à l'utilisateur de retenir explicitement une dépense simulée comme dépense planifiée lorsque le scénario correspond à un engagement qu'il prévoit réellement."
    - "Comparer explicitement les valeurs de référence et les valeurs simulées ainsi que leurs écarts."
    - "Recalculer les conséquences dépendantes à chaque modification du scénario."
    - "Permettre une simulation d'imprévu financier hypothétique."
    - "Lors d'un imprévu simulé, montrer quelle part du choc peut être absorbée par le fonds d'urgence, quelle part reste à absorber et l'impact sur la situation ou les objectifs."
    - "Permettre de choisir une durée de reconstitution du fonds d'urgence et calculer le montant mensuel correspondant."
    - "Comparer cet effort de reconstitution à la marge disponible après l'effort de l'objectif courant afin de distinguer une échéance inchangée, un décalage temporaire ou une capacité insuffisante."
    - "Distinguer clairement les faits observés, les engagements planifiés, les projections calculées et les possibilités simulées."
    - "Permettre à l'utilisateur de continuer à modifier le scénario, de revenir à la référence, de quitter sans changement ou de retenir explicitement certains changements."
  scope_out:
    - "Modifier automatiquement la situation réelle de l'utilisateur dès qu'un paramètre est changé dans une simulation."
    - "Transformer automatiquement une dépense simulée en dépense planifiée sans validation explicite de l'utilisateur."
    - "Présenter une hypothèse comme un fait observé ou comme un engagement déjà confirmé."
    - "Décider à la place de l'utilisateur quels paramètres doivent être modifiés pour améliorer un objectif."
    - "Considérer le fonds d'urgence comme librement affectable à un objectif hors contexte d'absorption d'un imprévu."
    - "Créer un journey autonome pour l'ajustement, la planification d'une dépense ou l'imprévu réel."
    - "Définir ici les écrans ou l'architecture technique détaillée."

user_flow:
  preconditions:
    - "Une première situation financière exploitable a déjà été construite."
    - "Gestio dispose d'une situation de référence comprenant au minimum les données nécessaires aux calculs concernés par la simulation."
    - "Le fonds d'urgence est identifié séparément des avoirs potentiellement affectables à un objectif lorsqu'il existe."
  steps:
    - action: "L'utilisateur ouvre le parcours Simulation."
      visible_result: "Gestio présente une situation de référence clairement identifiable comme point de comparaison et indique qu'aucune hypothèse ne modifie encore la situation réelle."
      possible_error: "La situation de référence est absente ou trop obsolète pour produire une comparaison fiable ; Gestio doit demander ou proposer son actualisation avant de poursuivre."
      state: expected
    - action: "L'utilisateur choisit ce qu'il souhaite simuler."
      visible_result: "Gestio distingue au minimum une simulation liée à un objectif, une simulation de répartition, une dépense future ponctuelle ou récurrente et une simulation d'imprévu, sans présenter ces scénarios comme des événements réels."
      possible_error: "Le scénario choisi nécessite des données qui ne sont pas disponibles ; Gestio doit rendre cette limite explicite."
      state: expected
    - action: "Dans une simulation d'objectif, l'utilisateur modifie un ou plusieurs paramètres tels que le montant cible, l'échéance ou la somme déjà affectée."
      visible_result: "Gestio recalcule le reste à financer, l'effort ou le délai associé, la part de capacité d'épargne (CP) mobilisée et l'écart éventuel par rapport à la situation de référence."
      possible_error: "Une valeur simulée est incohérente ou inexploitable ; Gestio doit signaler le paramètre concerné sans altérer la référence."
      state: expected
    - action: "Dans une simulation de répartition, l'utilisateur teste une variation de SB ou de SPP."
      visible_result: "Gestio conserve SH comme référence fixe pour ce scénario, recalcule CP à partir de la nouvelle répartition selon `SH = SB + SPP + CP` et montre explicitement le delta entre référence et simulation."
      possible_error: "L'hypothèse produit une répartition incohérente ou négative ; Gestio doit rendre cette incohérence visible et empêcher de présenter le résultat comme exploitable."
      state: expected
    - action: "Dans une simulation de dépense ponctuelle, l'utilisateur indique une dépense envisagée et son échéance."
      visible_result: "Gestio projette la sortie à la date prévue et montre son effet sur le budget libre, la projection de situation, la capacité d'épargne disponible et les objectifs éventuellement concernés, sans enregistrer encore cette dépense comme engagement réel."
      possible_error: "Le montant, l'échéance ou les données nécessaires sont absents ou incohérents ; Gestio doit signaler la limite sans transformer l'hypothèse en engagement."
      state: expected
    - action: "Dans une simulation de dépense récurrente, l'utilisateur ajoute, modifie ou retire une charge récurrente telle qu'un abonnement."
      visible_result: "Gestio montre l'impact récurrent sur la situation de référence, notamment l'effet mensuel sur la capacité d'épargne ou la marge disponible, ainsi que le coût cumulé sur une période pertinente ; pour un abonnement mensuel stable, le coût annuel peut être affiché pour rendre visible l'engagement dans le temps."
      possible_error: "La périodicité, le montant ou la durée ne permettent pas un calcul suffisamment fiable ; Gestio doit distinguer ce qui est connu de ce qui reste hypothétique."
      state: expected
    - action: "Dans une simulation d'imprévu, l'utilisateur introduit un choc financier hypothétique."
      visible_result: "Gestio montre le montant du choc, la part absorbable par le fonds d'urgence, le reste éventuel à absorber et les conséquences projetées sur la situation financière et les objectifs concernés."
      possible_error: "Le fonds d'urgence ou certaines données nécessaires ne sont pas connus ; Gestio doit distinguer clairement ce qui peut être calculé de ce qui reste incertain."
      state: expected
    - action: "L'utilisateur choisit la durée de reconstitution du fonds après le choc."
      visible_result: "Gestio calcule le montant à remettre de côté chaque mois. Si ce montant tient dans la marge après l'effort de l'objectif courant, l'échéance de cet objectif reste inchangée ; s'il dépasse la capacité totale, le scénario est présenté comme insuffisant plutôt que converti en délai aberrant."
      possible_error: "La durée est absente, nulle ou incompatible avec la capacité disponible ; Gestio doit rendre l'insuffisance visible et laisser l'utilisateur modifier l'hypothèse."
      state: expected
    - action: "L'utilisateur consulte la comparaison entre référence et scénario."
      visible_result: "Gestio présente côte à côte ou de manière équivalente les valeurs de référence, les valeurs simulées et les écarts significatifs afin que l'utilisateur comprenne ce qui change réellement dans le scénario."
      possible_error: "Une conséquence dépend de données insuffisamment fiables ; Gestio doit signaler le niveau d'incertitude au lieu de présenter une conclusion certaine."
      state: expected
    - action: "L'utilisateur continue à ajuster son scénario ou revient à la référence."
      visible_result: "Chaque modification du scénario déclenche un nouveau calcul sans écraser la situation réelle ; l'utilisateur peut revenir à l'état de référence à tout moment."
      possible_error: "Un recalcul échoue ou certaines dépendances deviennent indisponibles ; Gestio doit conserver la référence et signaler que le scénario n'a pas pu être recalculé correctement."
      state: expected
    - action: "L'utilisateur décide de la suite à donner au scénario."
      visible_result: "Il peut quitter sans rien changer, poursuivre l'exploration ou retenir explicitement certains changements. Lorsqu'une dépense ponctuelle ou récurrente simulée est confirmée comme engagement futur réel, Gestio la transforme en dépense planifiée afin qu'elle soit ensuite prise en compte dans usage-courant. Gestio ne transforme jamais implicitement une hypothèse en réalité."
      possible_error: "Une modification simulée ne peut pas être adoptée directement parce qu'elle nécessite une action concrète ou des données supplémentaires ; Gestio doit l'indiquer sans prétendre que la situation réelle a changé."
      state: expected
  success_result: "L'utilisateur comprend les conséquences d'un scénario en les comparant à sa situation de référence. Il distingue clairement ce qui est observé, planifié ou hypothétique, voit l'impact sur sa capacité d'épargne, son budget libre, ses objectifs ou son fonds d'urgence, puis décide librement de poursuivre, d'abandonner ou de retenir certaines modifications. Une dépense simulée n'entre dans la situation courante que lorsqu'elle est explicitement retenue comme engagement planifié."
  exit_conditions:
    - "L'utilisateur quitte la simulation sans modifier sa situation ou son objectif de référence."
    - "L'utilisateur continue à modifier le scénario."
    - "L'utilisateur revient à la situation de référence."
    - "L'utilisateur retient explicitement une dépense ponctuelle ou récurrente comme dépense planifiée."
    - "L'utilisateur retient explicitement une autre modification de scénario comme nouvelle référence lorsque cela est permis."
    - "L'utilisateur poursuit vers un autre parcours pertinent après avoir compris les conséquences du scénario."

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
  - "usage-courant: point d'entrée possible vers une simulation volontaire depuis la compréhension de la situation ; reçoit aussi les dépenses explicitement retenues comme engagements planifiés après simulation"
  - "objectif: une simulation peut explorer des variantes d'un objectif sans modifier immédiatement l'objectif de référence"
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
    reason: "Le cadrage utilisateur est écrit et inclut désormais la simulation puis la planification de dépenses ; le flux d'exécution système n'a pas encore été planifié."
    observed_at: "2026-09-14"
    resume_action: "Reprendre simulation.md à execution_flow lors de la phase de planification et décrire le flux système attendu pas à pas."
```

## Notes de cadrage

- La relation entre les grandeurs financières est `SH = SB + SPP + CP`. Dans une simulation de répartition, `SH` reste la référence fixe et les variations de `SB` ou `SPP` entraînent un recalcul de `CP`.
- Une simulation est toujours distincte de la situation réelle : modifier un paramètre ne suffit jamais à transformer l'hypothèse en nouvelle réalité.
- Une dépense ponctuelle peut être simulée avec un montant et une échéance afin d'en mesurer l'impact avant décision.
- Une dépense récurrente peut être ajoutée, modifiée ou supprimée dans un scénario. Son impact mensuel permet de comprendre sa soutenabilité ; son coût cumulé, notamment annuel pour un abonnement stable, permet de comprendre l'engagement dans le temps.
- Une dépense simulée ne devient une dépense planifiée que lorsque l'utilisateur la retient explicitement comme engagement futur réel. À partir de ce moment, elle doit pouvoir être prise en compte par usage-courant dans les sorties futures connues et le budget libre.
- La simulation d'objectif explore notamment montant, échéance et somme déjà affectée ; la simulation d'imprévu mesure l'absorption du choc par le fonds d'urgence puis son impact résiduel.
- Pour une reconstitution d'urgence, le montant mensuel simulé correspond au choc réparti sur la durée choisie. La comparaison se fait avec la CP totale et avec la marge après l'effort de l'objectif courant : une reconstitution couverte par la marge ne décale pas l'objectif ; une reconstitution supérieure à la CP rend le scénario insuffisant.
- Le résultat essentiel du parcours est la comparaison entre référence et scénario, pas seulement l'affichage d'une nouvelle valeur calculée.
- La planification d'une dépense, l'ajustement et l'imprévu ne sont pas des parcours autonomes : ils sont traités comme possibilités ou situations à l'intérieur des quatre journeys de la refondation.
