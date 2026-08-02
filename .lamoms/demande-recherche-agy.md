# Demande de recherche AGY — fenêtre d'historique et limites d'appel Enable Banking

**Émetteur** : Claude (planificateur) · **Date** : 2026-08-01 · **Destinataire** : AGY
**Objet** : fermer P23 et P24, et lever deux inconnues qui conditionnent le dimensionnement de T6.

---

## Pourquoi cette demande

Le MVP doit rapatrier l'historique bancaire au bon moment. La documentation Enable Banking annonce que **l'historique complet n'est disponible qu'environ une heure après l'autorisation initiale**, et qu'au-delà beaucoup de banques retombent à 90 jours. Nous ne savons pas si cette fenêtre existe sur La Banque Postale, ni ce qu'elle rend.

L'enjeu n'est pas théorique : **la réponse peut retirer une grande partie de la tâche T6** (import PDF pour l'état des lieux ancien). Si l'API rend un an ou trois dans la fenêtre, l'import perd son volume. Si elle rend 90 jours même dans la fenêtre, T6 garde tout son sens.

**Contrainte de méthode** : ce document applique les règles de P21. Aucune conclusion « retenue sans réserve ». Chaque réponse doit distinguer **ce qui est sourcé**, **ce qui est mesuré** et **ce qui est supposé**. Une sous-réponse qui contredit une autre doit être signalée, pas arbitrée en silence.

---

## Phase 1 — Documentation seule. Aucun appel, aucun risque.

À faire en premier. Ces réponses conditionnent la suite et ne coûtent rien.

### Q1.1 — L'énumération `TransactionsFetchStrategy`

`strategy` est un paramètre documenté de `GET /accounts/{account_id}/transactions`, de type `TransactionsFetchStrategy`. La FAQ nomme la valeur `longest`, mais la page de référence ne liste pas l'énumération.

- **Attendu** : la liste exhaustive des valeurs admises, avec la valeur par défaut, prise sur la **spécification OpenAPI** ou le schéma de l'API — pas sur la FAQ.
- **Pourquoi** : le critère de T4 impose `strategy=longest` sur la première récupération. Si la valeur exacte diffère, Codex écrit un appel invalide.
- **Réponse acceptable** : la valeur citée depuis la spec, avec le lien. À défaut, dire explicitement qu'elle n'est pas publiée.

### Q1.2 — Sémantique exacte de la fenêtre d'une heure

La FAQ dit que la fenêtre borne **la période de données disponibles, pas le nombre de requêtes**.

- Le délai est-il documenté ailleurs plus précisément qu'« environ une heure » ?
- Court-il depuis `POST /auth`, depuis `POST /sessions`, ou depuis l'authentification chez la banque ?
- Une **nouvelle autorisation** rouvre-t-elle une nouvelle fenêtre ? *(Hypothèse de Claude, jamais vérifiée — la FAQ parle d'« autorisation initiale ».)*

### Q1.3 — Limites d'appel et régimes

La FAQ mentionne `429 / ASPSP_RATE_LIMIT_EXCEEDED`, une limite fréquente de **4 récupérations par jour quand le PSU n'est pas en ligne**, et une reprise conseillée après 6 heures.

**Déjà mesuré le 2026-08-01 par Claude — appel `GET /aspsps` en lecture seule. Ne pas le refaire.**

Le catalogue expose un champ `required_psu_headers`. Deux en-têtes y apparaissent, `psu-ip-address` et `psu-user-agent` — c'est le signal standard DSP2 de présence du PSU : une requête portant l'adresse IP du client est déclenchée par lui, en direct ; sans elle, c'est une récupération en arrière-plan.

Répartition sur les 2632 banques du catalogue :

| `required_psu_headers` | Banques |
|---|---|
| `null` — aucun requis | 2260 |
| `["psu-ip-address"]` | 272 |
| `["psu-ip-address", "psu-user-agent"]` | 70 |
| `["psu-user-agent"]` | 29 |

**Les trois banques du périmètre — La Banque Postale, Revolut, Trade Republic — sont toutes à `null`.**

La question n'est donc PAS « comment ça marche en général », elle est devenue :

- **Qu'est-ce qui déclenche le régime « PSU absent » chez une banque qui n'exige AUCUN en-tête PSU ?** Trois lectures possibles, à départager — (a) ces banques ne distinguent pas les deux régimes et le quota de 4/jour ne s'y applique pas ; (b) elles le distinguent par un autre mécanisme, par exemple la fraîcheur de la session ; (c) Enable Banking renseigne ces en-têtes de façon transparente et « non requis » signifie seulement que l'application n'a pas à les fournir. *(Claude penche pour (c) — Enable Banking est l'intermédiaire, c'est lui qui parle à la banque — mais sans aucune preuve.)*
- Une application PEUT-ELLE fournir ces en-têtes alors qu'ils ne sont pas requis, et cela change-t-il le régime appliqué ?
- Combien de temps le statut « en ligne » dure-t-il après le SCA ?
- La limite de 4/jour est-elle par compte, par session, ou par application ?
- **Pourquoi** : le MVP doit savoir à quelle cadence il peut resynchroniser sans se faire bloquer. Une app qui rafraîchit à chaque ouverture d'écran épuiserait un quota de 4/jour en une matinée, et afficherait ensuite un solde figé sans le dire. Si la réponse est (a), la contrainte disparaît pour nous ; si c'est (c), il faut savoir ce qu'Enable Banking envoie et quand.

### Q1.4 — Pagination

- Existe-t-il une taille de page maximale documentée, ou un paramètre pour l'influencer ?
- Le comportement « liste vide **avec** clé de continuation » est-il documenté ailleurs que dans la FAQ ?
- Une récupération interrompue est-elle **reprenable** — une `continuation_key` reste-t-elle valide après un délai, un redémarrage, une nouvelle session ?
- **Pourquoi** : si les clés expirent, une aspiration profonde interrompue doit repartir de zéro, et la fenêtre est perdue.

---

## Phase 2 — Session existante, lecture seule. Aucun SCA.

À ne commencer qu'après la phase 1. La session du lab est valide jusqu'au **2027-01-01** — ces appels ne consomment aucune autorisation nouvelle.

⚠️ **Attention au quota** : ces lectures se font hors présence du PSU au sens réglementaire. Elles comptent probablement dans les 4/jour. **Grouper les appels, ne pas boucler à l'aveugle.** En cas de `429`, arrêter et attendre 6 heures — la FAQ est formelle, il n'y a pas de contournement.

### Q2.1 — Stabilité de `entry_reference` (ferme P24)

Mesuré : `entry_reference` vaut toujours `booking_date` + un rang dans la journée (`2026-07-20.0` à `.4`), et `transaction_id` est `null` sur 43/43. Nous en **inférons** que le rang se décale quand un mouvement s'ajoute sur une date déjà connue — ce n'est **pas mesuré**.

- **Protocole** : relire la même période que le jeu du lab (2026-05-03 → 2026-07-30) et comparer, mouvement par mouvement, les `entry_reference` obtenus à ceux de `enable_banking_transactions_reelles.json`.
- **Réponse** : identiques, ou décalés — avec le détail des écarts.
- **Enjeu** : si les rangs sont stables sur une période close, dire aussi ce que ça ne prouve pas — la stabilité d'une période encore ouverte à de nouvelles écritures.

### Q2.2 — Pagination observée

Sur ce même appel, relever la taille des pages renvoyées, le nombre de pages, et si une page vide accompagnée d'une clé de continuation apparaît.

### Q2.3 — Profondeur en régime courant

Appeler avec `strategy=longest` **hors fenêtre** (la session est ancienne). Relever la date de la transaction la plus ancienne obtenue.

- **Enjeu** : établir le plancher. Si `longest` rend déjà plus de 90 jours hors fenêtre, la fenêtre n'est pas le facteur déterminant et P23 change de nature.

---

## Phase 3 — Nouvelle autorisation. Un seul essai.

⚠️ **Ne pas lancer avant que les phases 1 et 2 soient rendues et lues.** Cette phase demande une **authentification forte de Lamoms sur son compte réel**, et la fenêtre ne s'ouvre qu'une fois. Un script bogué la brûle, et il faudra refaire un SCA pour retenter.

**Autorisation explicite de Lamoms requise avant exécution.**

### Préparation obligatoire

1. Script écrit, relu, et **testé à blanc** sur la session existante — même code, même chemin d'écriture, seule l'autorisation change.
2. Écriture **page par page** sur le disque, jamais d'accumulation en mémoire.
3. Journal horodaté de chaque appel : heure, paramètres, code HTTP, nombre de transactions, présence d'une clé de continuation.
4. `redirect_url` = `https://localhost:3443/`. **Ne pas reprendre** `http://localhost:3000/callback`, présente dans l'ancien script du lab et non enregistrée (P18) — l'échec surviendrait après le SCA, donc trop tard.
5. Application : le `kid` vérifié actif est `93fca3d0-...`. Un `403` signifie mauvaise application, pas mauvais code.

### Q3.1 — La fenêtre existe-t-elle sur La Banque Postale ?

Immédiatement après `POST /sessions`, appeler `GET /accounts/{uid}/transactions?strategy=longest` et paginer jusqu'à l'épuisement des clés.

- **Mesurer** : date de la transaction la plus ancienne, nombre total rapatrié, nombre de pages, durée totale, heure de fin.
- **Réponse attendue** : la profondeur réelle, en jours, comparée aux 90 jours annoncés par Data Insights.

### Q3.2 — Que devient cette profondeur passé le délai ?

Deux heures plus tard, rejouer exactement le même appel sur la même session.

- **Réponse** : la profondeur a-t-elle diminué ? Si oui, de combien, et à quelle valeur se stabilise-t-elle ?
- C'est cette comparaison, et elle seule, qui démontre l'existence de la fenêtre.

---

## Ce qu'il ne faut pas faire

- **Ne pas fabriquer de jeu de données** pour combler une réponse manquante. P11 est né de là — un fichier dérivé d'un PDF présenté comme une lecture d'API. Une absence de mesure se dit, elle ne se comble pas.
- **Ne pas conclure d'un `find` vide ou d'un appel sans résultat** que la chose n'existe pas, sans avoir vérifié la méthode de recherche. J'ai commis cette faute le 2026-08-01 sur les relevés PDF (P27), et elle a coûté une fausse alerte bloquante.
- **Ne pas généraliser une observation faite sur une banque.** Les 90 jours étaient donnés pour une propriété de l'API ; ils valent pour La Banque Postale et Trade Republic, pas pour Revolut qui rend 3727 jours (P22).
- **Ne pas répondre à une question voisine.** Si une question reste sans réponse, le dire.

## Forme du rapport attendu

Une réponse par question, dans l'ordre. Pour chacune :

| | |
|---|---|
| **Statut** | sourcé · mesuré · non trouvé |
| **Réponse** | courte et directe |
| **Preuve** | lien vers la source, ou sortie de commande / script |
| **Limite** | ce que cette réponse ne dit pas |

Les scripts et sorties vont dans `.lamoms/lab/agy/`, avec le script qui a produit chaque mesure — c'est la réserve laissée ouverte par P11, une donnée dont la production n'est pas rejouable n'est pas une preuve.

## Ce que ce rapport débloque

| Réponse | Effet |
|---|---|
| Q1.1 | lève la réserve du critère `strategy=longest` de T4 |
| Q1.3 | fixe la cadence de resynchronisation du MVP |
| Q1.4 + Q2.2 | décident si l'aspiration profonde doit être reprenable |
| Q2.1 | ferme P24 — ou confirme que la clé de contenu est le seul chemin |
| Q3.1 + Q3.2 | **dimensionnent T6** — c'est la réponse la plus attendue |
