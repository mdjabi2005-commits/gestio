# PRD (2) — Gestio, cycle de remise en état

**Émis le** 2026-08-04 par le Planificateur.
**Base** : la mise en service réelle du 2026-08-04 (`.lamoms/mise-en-service.md`) et les 26 problèmes actifs du carnet.
**Ne remplace pas** `.lamoms/prd.md` (cycle MVP, T1–T12, livré) — il en prolonge les exigences sans les rouvrir.

---

## 1. Problème réel de ce cycle

Les douze tâches du MVP ont toutes été livrées en VERT. **L'application a ensuite été lancée pour de vrai, avec les vraies banques de Lamoms, et sept défauts sont apparus qu'aucun verdict n'avait attrapés.**

Ils ont un trait commun, et c'est lui le problème de ce cycle : **ils produisent un chiffre ou un écran qui a l'air juste et ne l'est pas.** Un compte qui n'a jamais chargé s'affiche à 0,00 € dans un total présenté comme certain. Un CSV entre dans le mauvais compte sans objection. Un import crée 898 € de mouvements qui n'existent pas. Quatre comptes portent le même nom. Le mode hors connexion annonce une promesse qu'il ne tient pas.

C'est exactement le mode de panne que le PRD (1) nommait comme intolérable, et que la Core Feature — « savoir sa situation financière à tout moment » — ne supporte pas.

## 2. Ce que la mise en service a prouvé — à ne pas re-tester

Ce cycle **ne rouvre pas** ces acquis. Ils bornent le périmètre.

- **Huit soldes sur neuf sont justes**, vérifiés par Lamoms contre ses applications bancaires.
- **Preuve croisée sur Revolut** : le solde rendu par `GET /accounts/{uid}/balances` tombe **au centime** sur la somme des 314 transactions ingérées. Deux sources indépendantes, aucune perte, aucun doublon.
- **La déduplication inter-canaux tient** : 16 doublons PDF/API reconnus sur données réelles à La Banque Postale.
- **Le modèle à deux niveaux tient** : les pockets Revolut sont entrés comme des comptes sans rien changer (P28).
- **P33 confirmé en direct** : quatre pages vides avec `continued:true`, le code ne s'y est pas arrêté.
- **La sauvegarde est chiffrée et se relit** avec la clé — 609 transactions relues (critère de T8 tenu sur données réelles).
- **L'UI unique tient sur un vrai mobile** — écran identique via Tailscale, certificat Let's Encrypt réel.

## 3. Objectif et résultats attendus

**Objectif** : qu'aucun écran de Gestio n'affirme ce qu'il ignore.

À la fin de ce cycle :
1. Un compte dont la donnée n'a pas chargé **le dit**, et le total le dit aussi. Aucun zéro affirmé à la place d'un inconnu.
2. Trade Republic **synchronise** — ses 43+ transactions et son solde entrent en base.
3. Chaque compte porte **un nom qui le distingue**, sans que Lamoms ait rien à saisir.
4. Un import **refuse** ce qu'il ne peut pas placer avec certitude, et ne crée jamais de mouvement fantôme.
5. Les trois routes sans porte deviennent atteignables — une première installation ne dépend plus de `curl`.
6. Le mode hors connexion **fonctionne dès la première visite**, ou dit clairement qu'il n'est pas encore prêt.

## 4. Périmètre — couverture des 26 problèmes actifs

### 4.1 Inclus — les huit qui demandent du code

| # | Ce qui entre au périmètre |
|---|---|
| **P38** | La chaîne qui rend un échec invisible **et** la cause Trade Republic qui la déclenche |
| **P44** | Le `balance_type` hors liste, sélectionné en silence |
| **P41** | L'import CSV qui n'exige aucune cohérence entre la banque du fichier et le compte cible |
| **P42** | Les 121 doublons non détectés et les 898 € de mouvements fantômes — trois causes |
| **P39** | Les comptes nommés d'après le titulaire |
| **P25** | Les 43 lignes sans libellé, conséquence à l'écran (la contrainte, elle, reste) |
| **P40** | Les trois routes sans porte dans l'interface |
| **P43** | Le mode hors connexion qui échoue au premier usage |

### 4.2 Contraintes à respecter — **pas** des tâches

Ces onze entrées ne se « corrigent » pas. Elles encadrent ce qui sera écrit, et tout plan qui les viole est faux.

| # | Ce qu'elle impose |
|---|---|
| **P2** | Enable Banking est le canal principal, en production, depuis le départ |
| **P5** | Deux mouvements distincts de même montant le même jour restent **deux** mouvements |
| **P11** | Une preuve du lab n'est pas une validation sur données réelles — le dire |
| **P12** / **P18** | L'authentification forte se termine **sur la machine serveur** ; `https://localhost:3443/` est la seule URL de redirection du MVP. Jamais de SCA depuis le mobile |
| **P13** | Le backend fait foi, le mobile est un client |
| **P16** | PC éteint, le mobile doit encore afficher le dernier solde connu **avec sa date** — c'est P43 qui la met en défaut |
| **P21** | Un rapport de recherche se lit comme une donnée, jamais comme une conclusion |
| **P22** | La fenêtre d'historique est une propriété **de chaque banque**, jamais une constante codée en dur |
| **P25** | Sans libellé, l'arbitrage par Jaccard est structurellement inapplicable |
| **P33** | Quatre récupérations par jour hors présence du PSU ; une page vide avec clé de continuation **ne signifie pas la fin** |

### 4.3 Acquis mobilisés

- **P31** — signature de libellé des virements Livret A → CCP. Connu, non exploité dans ce cycle.
- **P32** — le relevé PDF de La Banque Postale porte le Livret A **et** le Livret Jeune. Un relevé manquant coûte trois comptes.

### 4.4 Hors périmètre — et pourquoi, explicitement

| # | Raison |
|---|---|
| **P1** | C'est le problème racine du projet, pas une tâche. Huit soldes justes sur neuf l'adressent déjà en partie ; ce cycle le sert entièrement |
| **P28** | Se referme **tout seul** dès que Trade Republic synchronise — donc avec P38. Aucune tâche propre |
| **P29** | Requalifié par Lamoms le 2026-08-04 : la moitié « où » est **livrée** (solde par compte à l'écran). La moitié « référence et écart » n'est pas demandée. En veille |
| **P30** | Mis en veille par Lamoms : « les virements internes on ne les importe pas encore ». Non observable aujourd'hui, donc rien à corriger. Ne fausse pas le solde |
| **P35** | Remédiation **manuelle**, tranchée le 2026-08-04. Rendez-vous du **2026-08-08** pour les quatre relevés manquants (2 BP, 2 Nickel). Aucune ligne de code, aucun mécanisme de rappel — risque de récidive assumé |
| **P37** | Sauvegarde sur support secondaire : post-MVP, déjà tranché |
| **P22** *(mesure)* | La profondeur d'historique de Trade Republic tombera **gratuitement** à la première synchro réussie. Ne pas commander de spike |

## 5. Ce que Lamoms doit pouvoir faire à la fin

1. **Ouvrir l'app et croire le total.** S'il manque une donnée, l'écran le dit avant qu'il ait à le deviner.
2. **Voir quel compte est lequel** — « Assurance » et « Abonnement feu vert », pas quatre fois son propre nom.
3. **Installer sur une machine neuve sans terminal** : créer un établissement, créer un compte, importer un relevé, tout depuis l'interface.
4. **Importer un fichier sans risque** : s'il se trompe de compte, l'app refuse ; si le fichier contient plusieurs comptes, elle demande où va quoi.
5. **Consulter son solde dans le métro**, PC éteint, avec la date de fraîcheur — ou lire une phrase honnête si ce n'est pas encore possible.

## 6. Exigences fonctionnelles observables

### 6.1 Un inconnu ne devient jamais un zéro *(P38, P44)*

- Un compte dont `balance_cents` est `NULL` **et** qui porte un identifiant externe (compte synchronisé) n'affiche pas `0,00 €`. La règle « solde = somme des transactions » reste **juste pour un compte manuel** et fausse pour un compte API jamais chargé ; les deux cas doivent être distingués.
- Le **total agrégé** signale qu'il est incomplet dès qu'un compte de son périmètre n'a pas de solde connu.
- La **fraîcheur agrégée** compte les comptes jamais synchronisés. Un compte sans date n'est pas « à jour », il est « jamais chargé ».
- Une connexion bancaire dont la synchronisation a **totalement** échoué ne reste pas affichée comme autorisée.
- Toute erreur de synchronisation journalise **son message** — aujourd'hui aucun des quatre sites ne le fait, et c'est ce trou qui a coûté une demi-journée d'archéologie pour un message que le code connaissait dès la première seconde.
- Un `balance_type` **hors de la liste de priorités** n'est pas sélectionné en silence quand plusieurs soldes sont candidats.

### 6.2 Trade Republic entre en base *(P38, cause)*

Deux gardes rejettent, empilés, et la banque n'a **rien** refusé :

- `remittance_information: null` est traité comme **absent**, pas comme malformé. C'est un **bug franc** : le code teste `!== undefined` alors que JSON rend `null`. Aucune décision à prendre.
- Un montant à plus de deux décimales est accepté **à condition que tout ce qui dépasse le centième soit zéro**, et refusé sinon. C'est une **strictesse délibérée** qu'on assouplit sans jamais perdre la garantie « pas de chiffre faux silencieusement ». Mesuré : 0 montant sur 43 porte un chiffre non nul sous le centime.
- Un montant **signé** est accepté ; `signedAmountCents` applique déjà `Math.abs()` avant l'indicateur, donc aucune double négation n'est possible.
- **Contrôle exigé** : après ces assouplissements, les 43 transactions réelles capturées passent — toutes.

### 6.3 Un import ne place rien qu'il ne puisse justifier *(P41, P42)*

- Un fichier CSV dont la banque ne correspond pas à l'établissement du compte cible est **refusé**, comme un format inconnu l'est déjà (`csv_format_unrecognized`).
- Un fichier dont les lignes **ne peuvent pas être attribuées avec certitude** au compte cible ne les y verse pas en silence. *(Corrigé le 2026-08-04, après mesure sur le fichier réel : le CSV Revolut mélange quatre comptes et n'expose aucun identifiant de pocket — sa seule colonne candidate, `Produit`, ne prend que trois valeurs et la colonne `Solde` ne se referme sur aucune. La correspondance compte par compte du chemin PDF (`accountIds`) **n'est donc pas transposable** au CSV, contrairement à ce que cette ligne supposait. Le comportement retenu fait l'objet d'un arbitrage de Lamoms — voir `.lamoms/tasks-2.md`, T15.)*
- La déduplication reste valable quand les deux sources emploient des **vocabulaires différents** (anglais côté API Revolut, français côté CSV) : l'arbitrage par mots ne peut pas être le seul recours.
- Un rapprochement **incertain** pose `needs_review`. Mesuré le 2026-08-04 : 43 paires bi-sources, **zéro** drapeau posé — ce qui contredit la conception de P25.
- **Idempotence, inchangée** : réimporter le même fichier deux fois ne change ni le solde ni le nombre de transactions.

### 6.4 Chaque compte porte un nom qui le distingue *(P39)*

- Le nom vient de la donnée de la banque quand elle en fournit une **utile** — `details` porte le nom du pocket chez Revolut (« Assurance », « Auto entreprise déclaration paiement », « Abonnement feu vert »).
- Quand la banque ne rend que le **titulaire**, le nom se dérive du type de compte. Couverture mesurée : **9 comptes sur 9, zéro saisie**.
- **Aucun nom saisi à la main n'entre au périmètre** : l'upsert de synchro réécrit `name` à chaque passage, donc une saisie serait effacée silencieusement. C'est la raison de ne pas construire cette fonctionnalité, pas un travail à faire.
- ⚠️ **Ne pas inverser la priorité `name` → `product`** : `product` vaut `null` chez La Banque Postale et sur les quatre comptes Revolut. L'inversion casserait deux banques pour en réparer une.

### 6.5 Une transaction sans libellé reste lisible *(P25)*

- Les 43 transactions Trade Republic arriveront **toutes** sans libellé et sans référence externe (mesuré, plus seulement inféré). L'écran ne doit pas rendre 43 lignes vides.
- Deux transactions de même date, même montant et même sens restent **deux lignes distinctes** (P5). Le cas est déjà présent : deux débits de 20,00 € le 2026-05-20.

### 6.6 Une première installation ne dépend pas du terminal *(P40)*

- Créer un **établissement**, créer un **compte**, importer un **relevé PDF** : les trois routes existent et doivent avoir une porte dans l'interface.
- Conséquence directe mesurée : sur une installation neuve, le seul chemin vers un premier compte est une banque API. Un utilisateur qui n'a que Nickel et un Livret A **ne peut pas franchir l'accueil**.

### 6.7 Le hors connexion tient sa promesse, ou se tait *(P43, P16)*

- Réseau coupé, l'application affiche le **dernier solde connu avec sa date de fraîcheur** — c'est la contrainte fondatrice P16 et la promesse de T7.
- Cela doit valoir **dès la première visite en ligne**, sans exiger de l'utilisateur trois passages qu'aucun écran ne lui annonce.
- Si la coque n'est pas encore prête, l'écran le **dit** plutôt que d'échouer en « site inaccessible ».
- Contrainte d'implémentation à respecter : Vite hache le nom des fichiers produits, donc la liste des ressources à mettre en cache n'existe qu'au moment de la construction.

## 7. Critères d'acceptation

Tous démontrables par commande, diff ou test — aucun ne repose sur une impression d'écran.

1. Un compte synchronisé sans solde connu **n'affiche pas** `0,00 €`, et le total agrégé indique qu'il est incomplet.
2. La fraîcheur agrégée d'un ensemble contenant un compte jamais synchronisé **ne renvoie pas** une date « à jour ».
3. Une synchronisation en échec total **ne laisse pas** la connexion affichée comme autorisée.
4. Le message d'erreur (`error.message`) apparaît dans le journal des quatre sites de synchronisation.
5. Les **43 transactions réelles** de `.lamoms/lab/agy/tr_transactions_raw.json` sont ingérées sans exception, et le solde de `tr_balances_raw.json` donne 47 centimes en EUR.
6. Un montant portant un chiffre **non nul** au-delà du centième est toujours **refusé**.
7. Un CSV Revolut visant un compte La Banque Postale est **refusé** — reproduction exacte de l'incident du 2026-08-04.
8. Un import multi-comptes sans correspondance explicite est **refusé**.
9. Le CSV Revolut réel (254 lignes) réimporté sur le compte #5 déjà peuplé par l'API **n'ajoute aucune transaction** et ne modifie pas le solde de 2,25 €.
10. Les quatre comptes Revolut portent **quatre noms distincts** à l'écran, sans aucune saisie.
11. Sur une base vide, un établissement, un compte et un relevé PDF s'ajoutent **entièrement depuis l'interface**.
12. Première visite en ligne, puis réseau coupé : la page se charge et affiche le dernier solde connu **avec sa date**.
13. Aucune régression sur l'acquis du §2 — en particulier : la somme des 314 transactions Revolut tombe toujours au centime sur le solde de l'API.

## 8. Ordre imposé par les faits

Cet ordre n'est pas une préférence — chaque étape rend la suivante observable ou moins risquée.

1. **P38 + P44** — d'abord, pour deux raisons. (a) **C'est une horloge de perte de données** : Trade Republic a une fenêtre glissante de 90 jours, sa synchro est cassée, et la capture du 2026-08-04 porte un `continuation_key` non nul — de l'historique est disponible et personne ne le descend ; chaque jour d'attente en efface une journée, définitivement. (b) Journaliser `error.message` est ce qui rend toutes les pannes suivantes lisibles en une seconde.
2. **P41 + P42** — ensemble. Même chemin de code, même relecture ; l'import cesse de corrompre avant qu'on lui ajoute une porte.
3. **P39 + P25** — ensemble. Les deux portent sur ce que l'écran rend d'une donnée pauvre.
4. **P40** — les portes, une fois que ce qu'elles ouvrent ne corrompt plus rien.
5. **P43** — le hors connexion, qui ne dépend d'aucun des précédents.

## 9. Décisions structurantes de ce cycle

Prises par Lamoms, ou déduites de mesures — jamais choisies seul par le Planificateur.

- **Tester avant de corriger.** Décidé par Lamoms le 2026-08-04 : « le mieux c'est de tester l'app pour voir si elle fonctionne avant de régler les problèmes un par un ». Les sept défauts de ce PRD viennent de là et d'aucune supposition.
- **Aucun nommage manuel des comptes.** La dérivation couvre 9 comptes sur 9 ; l'upsert de synchro effacerait toute saisie. On ne construit pas ce qui n'a pas lieu d'être.
- **P35 en remédiation manuelle**, sans mécanisme de rappel, risque de récidive assumé. Rendez-vous du **2026-08-08** — première date où les quatre relevés manquants existent simultanément.
- **`tasks.yaml` est retiré**, GitHub (milestones, issues, commentaires) est la source de vérité du suivi. Ne pas le restaurer.
- **Assouplir une validation ne se fait que sans perte.** Les six décimales de Trade Republic sont du remplissage — mesuré, 0 sur 43. Un chiffre réellement sous le centime reste refusé.

## 10. Contraintes, risques et questions ouvertes

- **Aucune question ouverte bloquante.** Les huit problèmes du §4.1 ont leur cause mesurée et leur correctif tranché.
- **Risque assumé, P35** : les relevés manquants sont une action manuelle datée. S'ils ne sont pas récupérés, un trou d'historique s'ouvrira sans que rien ne le signale — pour Nickel il est **déjà ouvert** depuis fin mai, faute d'API.
- **Non mesuré, sans blocage** : les `balance_type` rendus par La Banque Postale et Revolut n'ont jamais été capturés. Ils tomberont en observant les synchros — ne pas commander de recherche.
- **Non mesuré, sans blocage** : la profondeur d'historique réelle de Trade Republic. Tombera avec P38.
- **Limite de l'environnement** : `/mnt/c` a corrompu `node_modules` de façon asynchrone le 2026-08-04 (82 paquets sur 134 vidés). Ce n'est pas un défaut du projet. Si cela récidive, sortir le projet vers le système de fichiers natif WSL — décision de Lamoms.
