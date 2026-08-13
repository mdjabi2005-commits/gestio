# PRD final — Finir Gestio

**PRD actif de Gestio. Émis le 2026-08-12 par le Planificateur, arrêté avec Lamoms au terme de sept rounds de cadrage.**
**Amendé le 2026-08-13** après une revue d'exécutabilité en cinq rounds — treize décisions d'exécution (§11, 15 à 27), aucune des quatorze décisions de cadrage rouverte. Le lot A passe de dix à treize tâches et **deux inversions bloquantes sont corrigées**.
**Amendé une seconde fois le 2026-08-13**, cette fois par confrontation aux annexes jamais relues et au corpus réel — dix décisions de plus (§11, 28 à 37), **sept mesures neuves**. Une assertion d'architecture est tombée, un critère inatteignable est réparé, et le rejeu automatique de l'oracle — éteint depuis toujours — est rallumé. Aucune tâche ne change de place.
**Il remplace le lot annexe et l'absorbe** — #38 et #39 deviennent T31 et T32. Le lot annexe reste dans git.

**Il est le dernier.** Après lui on n'ouvre pas un cycle 4 : soit l'application tient les deux phrases du §1, soit elle ne les tient pas et on sait exactement où.

**Base** : le verdict ROUGE d'Hermès sur T30, la review Copilot de #40, l'inventaire des 18 méthodes, `.lamoms/contraintes.md`, et **sept mesures faites dans le code pendant le cadrage** — elles sont citées à l'endroit où elles servent.

---

## 1. Ce que « fini » veut dire

**Ratifié par Lamoms le 2026-08-12.** Tout le document se mesure contre ces deux phrases.

> **Le 1er de chaque mois, j'ouvre Gestio depuis mon téléphone. Mes comptes portent un solde juste avec sa date. Je sais ce dont je dispose réellement, et je peux dire si une dépense prévue me met en danger d'ici la fin du mois — sans ouvrir un terminal, et sans ouvrir une application bancaire pour vérifier.**
>
> **Et le 8 de chaque mois, date à laquelle les relevés de toutes mes banques sont disponibles, j'importe en une fois les relevés du mois écoulé. Je vois que tout se recoupe et qu'il ne manque rien. Mois après mois, l'application se construit un historique long — et c'est cet historique qui devient l'oracle.**

### Deux mots à lire strictement

**« mes comptes » — aucun nombre n'est écrit dans ce document.** Le six de P28 a déjà bougé deux fois : Revolut a rendu quatre comptes (le compte et ses trois pockets), et l'interface prévoit deux clés de relevé PEA. La base en porte neuf, et **Sumeria n'y est pas encore**. Un critère qui nommerait un chiffre serait satisfait en oubliant le dernier compte ajouté — c'est le mode de panne du projet : un total qui a l'air juste.

**« l'oracle » de la seconde phrase est bien l'oracle du projet.** Ce n'est pas une autre espèce : **l'oracle est le corps des décisions validées à la main**, et le jeu de T27 — 191 paires, 606 décisions — en est **le premier état, figé le 2026-08-10**, construit *hors* de l'application parce qu'elle ne le permettait pas. Il rentre, il est rangé dans la base chiffrée, et il grandit à chaque décision tranchée.

### Quel appareil fait quoi

| | Téléphone | PC (machine serveur) |
|---|---|---|
| Consulter soldes, fraîcheur, mouvements | **oui** — le geste du 1er | oui |
| Relancer la synchro d'une connexion autorisée | **oui** | oui |
| Établir une **nouvelle** connexion bancaire | **non** en MVP | **oui** |
| Importer les relevés du mois | non | **oui** — le geste du 8 |

L'établissement d'une connexion reste sur le PC et **ce n'est pas un choix** : la `redirect_url` du MVP est `https://localhost:3443/`, et `localhost` ne résout que sur la machine serveur (C4). C'est l'URL qui lèvera la contrainte en phase RPi, pas le code. **Un échec sur les deux dernières lignes depuis le téléphone est une limite connue, pas un constat.**

### Ce que la seconde phrase change au projet

Le PDF est la seule mémoire longue : le plancher de l'API avance d'un jour par jour, et une transaction sortie de la fenêtre n'y rentre jamais. **P35 cesse donc d'être une échéance à rattraper une fois — le 2026-10-06 — pour devenir le rituel qui empêche tous les trous suivants.**

### Ce que la première phrase coûte, et Lamoms l'assume

*« Je peux dire si une dépense prévue me met en danger »* n'est calculé par **aucune tâche du lot A**. Le seul qui le porte est **T41**. Trois conséquences liées :

1. **T41 n'est pas optionnelle.** Sans elle, la définition de « fini » est fausse par construction.
2. **Le PRD ne se clôt pas sur le parcours.** T37 prouve tout le reste ; pas ça.
3. C'est **P7** — fermé en son temps sous « impact immédiat d'une dépense, absent du MVP » — que cette phrase rouvre délibérément.

## 2. Le constat qui déclenche ce PRD

**L'inventaire des 18 méthodes est une lecture de code, pas une mesure d'usage.**

- Deux mises en service, le 2026-08-04 et le 2026-08-11, arrêtées toutes deux sur une **porte**, jamais sur un défaut de métier. **On n'a jamais dépassé l'étape 2 en autonomie complète par l'interface.**
- Des 12 étapes de #40, les étapes **3, 4 et 5 n'ont pas échoué : elles n'ont jamais été lancées.** `SyncButton` rend `null` sans `localStorage["gestio.authorization-id"]`.
- Trois méthodes n'ont **jamais été appelées par personne** : `GET /accounts`, `POST /transactions`, `POST /transactions/resolve`. Une était cassée sans qu'on le sache : `POST /auth/logout` est hors `PUBLIC_PATHS`, répond `401` sans session, et `logout().then(refresh)` avale l'échec.
- **Les 606 décisions de qualification n'ont jamais été affichées à l'écran.**
- Les 9 comptes portent `iban IS NULL`, alors que la preuve par IBAN est le deuxième meilleur score du moteur.

On a livré 32 tâches contre un carnet de problèmes. Aucune contre un usage.

## 3. Ce qui change de méthode

**On cesse de planifier depuis `problems.json`.** Le carnet a été remis à zéro le 2026-08-12 ; les 34 entrées closes restent dans git, et les 17 qui servent encore sont dans **`.lamoms/contraintes.md`** — une fiche qu'on lit avant de coder, jamais un backlog. Les 6 problèmes ouverts (P1, P28, P29, P30, P35, P58) sont une **liste de vérification de fin de parcours**.

**On planifie depuis le parcours d'usage.** Chaque tâche nomme l'étape du protocole qu'elle débloque.

**Deux règles nouvelles, et elles sont le vrai changement :**

> **R1 — Une livraison n'est prouvée que par un usage, jamais par un vert.** Une méthode livrée sans appelant n'est pas livrée.

> **R4 — Chaque tâche se termine par une recette de deux minutes, faite par Lamoms sur l'application réelle, avant le verdict — et cette recette remonte le protocole jusqu'à l'étape que la tâche débloque.**

**Pourquoi R4 est indispensable ici** : `web/src/main.jsx` fait 334 lignes et **n'a aucun test** — ni jsdom, ni testing-library. Codex travaille dans un worktree **sans `.env` ni `data/`** : il ne peut structurellement pas faire le geste.

**Et pourquoi la recette doit remonter la chaîne** : le 2026-08-11, ni T18 ni T25 n'étaient cassées. Le formulaire de compte marchait, l'import en lot marchait, les deux étaient VERTES. Mais le formulaire ne demandait pas d'IBAN et le sélecteur n'affichait que les noms — avec quatre Revolut homonymes, l'association devenait impossible. **Chaque tâche tenait sa promesse ; leur jonction, non.** Une recette faible aurait validé les deux.

## 4. L'architecture arrêtée

*Sept rounds de cadrage, sept mesures. Ces décisions ne se rouvrent pas pendant l'exécution.*

### Les deux tables

Deux vraies tables SQLite, dans le **même fichier chiffré**, sous la même clé, dans la même sauvegarde.

| | `transactions` *(existante, inchangée)* | l'oracle *(nouvelle)* |
|---|---|---|
| Contient | tous les mouvements, quelle que soit leur source | **un fait établi à propos d'un mouvement** — jamais une copie |
| Une ligne = | un mouvement | « confirmé par un relevé », ou « sa nature a été tranchée, et c'est celle-ci » |
| Rôle | le plan de travail | la mémoire longue |

**Découpage B, et non par âge.** Découper `transactions` en « fenêtre API récente » et « archive » casserait trois mécanismes éprouvés : l'index unique `(fingerprint, occurrence)` ne s'étend pas sur deux tables ; `GET /balance` sommerait sur deux ; et surtout **l'appariement des virements compare tous les mouvements deux à deux** — deux jambes dans deux tables, la paire n'existe plus, et c'est de là que viennent les 606 décisions. Quatorze chemins de code touchent `transactions` : sous B, aucun ne bouge.

**La distinction « donnée sûre / donnée saisie » existe déjà** dans la colonne `source` (`ENABLE_BANKING`, `PDF_RELEVE`, `MANUEL`). Aucune table n'est nécessaire pour l'obtenir.

### L'identité et la vérité

**Une vérité s'accroche à la ligne de `transactions`, jamais au `fingerprint`.** Mesuré : les deux canaux ne calculent pas l'empreinte de la même façon — le chemin API met le rang **dans** le hachage, le chemin PDF le laisse **à côté** (C11). Le même mouvement réel, vu par l'API puis retrouvé dans un relevé, **n'a donc pas la même empreinte**. C'est la **déduplication** qui porte l'identité entre canaux, par (date, montant) puis Jaccard sur les mots du libellé.

**Présence dans l'oracle = décision de l'utilisateur.** Aucune colonne « décidé par » nulle part.

**Un mouvement qui porte une vérité ne se supprime pas.** Le refus de `DELETE` *est* la preuve qu'il a existé.

**Deux marques distinctes, jamais confondues** : *confirmé par relevé* (le fait a eu lieu) et *tranché par toi* (voilà ce que c'est). Un relevé prouve qu'un mouvement existe ; il ne dit rien de sa nature. Le geste du 8 pose la première en masse ; la seconde ne se pose qu'une ligne à la fois.

**L'oracle est un compteur et un vérificateur — il ne s'affiche pas.**

### Les libellés

**Les libellés PDF et Enable Banking sont le même texte** — mesuré sur le dump API réel contre le relevé de juin parsé : 16 mouvements appariés, **13/16 identiques après normalisation**, les 10 écarts bruts n'étant que des espaces. Déterminer la nature par le libellé, seule trace qui survit dans un vieux relevé, **tient d'un canal à l'autre**. Les 3 écarts résiduels viennent tous d'un **débordement du parseur PDF** sur la ligne suivante — corrigé dans T31 (C12).

### Par où un compte entre

Deux chemins, et deux seulement : **l'API Enable Banking**, sinon **ses relevés**. **La saisie manuelle d'un solde sort du produit** — un chiffre tapé sans donnée derrière est ce que l'application est censée remplacer.

**Aucun nom de compte, d'établissement ou de produit ne reste dans le code.** Ce qui reste légitimement du code, c'est le parseur d'un format : reconnaître une mise en page ne se devine pas.

**L'IBAN entre tout seul.** Il est déjà dans `details.account_id.iban`, réponse que l'application reçoit depuis T17 et dont elle ne lit que le nom — `src/enable-banking.ts` ne contient pas une occurrence de `iban`. Et l'import écrit déjà `SET iban = COALESCE(?, iban)`. **Case vide → on remplit en silence. Case pleine et valeur différente → on ne remplace pas, et on le dit.**

### Le modèle : un établissement, des comptes, et deux façons de les distinguer

*Assertion de Lamoms du 2026-08-13, **réfutée le jour même par la mesure** — décision 28.* L'assertion disait : chaque compte porte son propre IBAN, et c'est l'IBAN qui les distingue. Elle attendait son contre-exemple ; il était déjà sur le disque.

**Mesuré sur les 25 segments du corpus et sur la sortie brute de `GET /accounts/{uid}/details` du 2026-08-04 :**

| | IBAN | ce qui distingue |
|---|---|---|
| LBP — CCP, Livret A | **distincts**, stables sur les 13 relevés | l'IBAN |
| LBP — Livret Jeune | imprimé 2 relevés sur 13 | l'IBAN une fois posé, le nom imprimé avant |
| Nickel | un compte, un IBAN | l'IBAN |
| Trade Republic — cash, PEA, PEA 2 | **le même pour les trois** | le **nom imprimé**, distinct et stable |
| Revolut — compte principal | un IBAN | l'IBAN |
| Revolut — les 3 pockets | **aucun** | `cash_account_type` (SVGS contre CACC) et `account_id.other.identification`, un UUID par pocket |

**Le modèle devient donc : l'IBAN distingue là où il existe ; le nom établi à l'onboarding distingue partout ailleurs.** Ce qui est indiscernable chez Revolut n'est pas l'identité — l'API donne quatre identifiants stables — mais le **nom** : les quatre comptes portent la même chaîne. C'est un problème d'affichage, pas de clé.

**Deux confirmations tombent avec la mesure** : l'IBAN rendu par l'API **égale** celui imprimé sur le relevé, pour le CCP comme pour Trade Republic. Le rapprochement inter-canaux par IBAN est donc mesuré, plus supposé.

**Aucun index unique sur `iban`**, et la raison change : ce n'est plus une prudence sur un fait non observé, c'est un **fait observé** — trois comptes Trade Republic partagent légitimement un IBAN. Un partage est donc silencieux et attendu ; **ce qui se signale, c'est un IBAN qui change** (case pleine, valeur différente). Un signal qui s'allumerait sur 7 comptes sur 10 à chaque synchro apprendrait à être ignoré — c'est le piège que T42 nomme pour elle-même.

**Rien de tout cela ne rouvre la décision 17** : ce qui ne se mémorise pas, c'est la **correspondance relevé↔compte**, recalculée à chaque import. Les infos du compte — son IBAN, son nom — s'enregistrent, elles, et c'est ce que la décision 19 prévoyait déjà.

**Inconnu, jamais zéro.** Le `COALESCE(..., 0)` de `GET /balance` affiche un compte sans données à `0,00 €` dans un total crédible — c'est P38 mot pour mot. D5 est tranchée.

### Les cas limites, documentés au lieu d'être résolus

Quand plusieurs candidats partagent date et montant et que le libellé ne départage pas, **le système ne devine pas : il demande.** C'est le seul endroit où l'intervention humaine est irréductible, et c'est le bon.

## 5. Ce qui est acquis et ne se rouvre pas

- L'oracle T27 rejoue à l'identique : **191 paires, 606 décisions**.
- La déduplication inter-canaux sur données réelles : 16 doublons PDF/API reconnus.
- La preuve croisée Revolut : le solde de l'API tombe au centime sur la somme des 314 transactions.
- Le modèle à deux niveaux — les pockets Revolut sont entrées comme des comptes.
- L'UI unique tient sur un vrai mobile via Tailscale, certificat Let's Encrypt réel.
- La sauvegarde chiffrée se relit : 609 transactions.
- La suite est verte : 40 tests, lint, typecheck et build à 0 — **mais 39 pass et 1 skip**, mesuré le 2026-08-13 dans le workspace maître, qui porte pourtant `GESTIO_PERSONAL_NAMES` dans son `.env`. `node --test` ne lit pas `.env` ; le rejeu des 606 décisions **ne s'est donc jamais exécuté**, ni ici ni chez Codex. T31 le rallume. *(La formulation précédente — « 40 pass, 0 skip avec `GESTIO_PERSONAL_NAMES` » — décrivait une condition que rien ne remplissait.)*
- Le rejeu, quand il s'exécute, fait plus qu'on ne croyait : il **vérifie le sha256 des 26 documents** du corpus, les reparse tous, contrôle le décompte par document, crée une **base SQLCipher neuve** et y rejoue les 911 mouvements jusqu'aux 191 paires et 606 décisions. Onze secondes. Il ne couvre **pas** `POST /imports/pdf`, la déduplication, la chaîne des soldes ni l'interface — T43b lui ajoute la route.

## 6. Les lots

### Lot 0 — Deux actions humaines, datées *(ce ne sont pas des tâches)*

**Télécharger le relevé La Banque Postale émis le 2026-08-08 — il est disponible maintenant — puis celui du 2026-09-07 dès sa parution.** *(Dates recalculées le 2026-08-13, décision 37 : les précédentes étaient fausses.)*

Le corpus s'arrête au relevé émis le **2026-07-08**, qui couvre la période 2026-06-08 → 2026-07-08 — le fichier existe et il est dans le manifeste de l'oracle. Juin est donc déjà en main. Le plancher de l'API est aujourd'hui vers le 2026-05-15 : **il n'y a aucun trou en ce moment**, et il s'ouvrirait le **2026-10-06** (2026-07-08 + 90 jours), pas le 2026-09-06 — cette date-là avait été calculée par le verdict T30, qui croyait le corpus arrêté un mois plus tôt. Elle demandait par ailleurs un relevé d'août **avant** le 2026-09-06, alors que La Banque Postale l'émet vers le 2026-09-07 : le geste n'existait pas encore.

Le relevé qui manque vraiment est donc celui **émis le 2026-08-08, disponible depuis cinq jours**. Une fois en main, l'échéance dure recule au 2026-11-06. Passé l'échéance, le trou est **définitif** et aucun code ne le répare. Ce qui protège durablement n'est pas une date, c'est le rituel du 8 — c'est ce que dit le §1. *(Nickel est déjà à jour au 2026-08-02.)*

**Faire tourner la clé Enable Banking.** Le 2026-08-11, un diagnostic a fait apparaître des fragments de clé PEM dans une sortie de session. Aucun secret n'est dans un fichier versionné, mais la clé donne un accès en lecture aux comptes réels jusqu'au 2027-01-01. Quelques minutes, avant la première opération bancaire du parcours.

**Reporté par Lamoms le 2026-08-12, après la conception de l'application — important, pas prioritaire : vérifier que la clé de récupération BitLocker est dans le compte Microsoft.** Mesuré le même jour : le disque est chiffré — BitLocker 2.0, XTS-AES 128, protection activée, 100 % — avec **TPM + mot de passe numérique** pour protecteurs. Tes relevés en clair et ton `.env` sont donc couverts au repos, malgré des permissions inopérantes sur `/mnt/c`. **Mais `backups/` vit sur ce même disque** : c'est C10 aggravé. Le jour où le TPM change d'état — mise à jour du BIOS, carte mère remplacée — Windows réclame la clé à 48 chiffres, et sans elle **la base et ses trente jours de sauvegardes partent ensemble**. C'est la seule chose qui rend ce chiffrement réversible.

> **Ce que ce chiffrement protège, et ce qu'il ne protège pas.** TPM seul signifie que le disque se déverrouille **tout seul au démarrage**. La couverture est donc : disque sorti de la machine, PC revendu ou perdu. Contre quelqu'un qui ouvre le capot, **la seule barrière est le mot de passe Windows**. Aucun chiffrement de dossier n'y changerait rien — et sur Windows 11 Famille, EFS et BitLocker gérable sont indisponibles de toute façon.

---

### Lot A — Les portes

*Treize tâches, en série : elles touchent toutes `src/server.ts` et `web/src/main.jsx`. Chacune se termine par sa recette (R4), qui remonte le protocole jusqu'à son étape.*

> **Règle du lot A — la logique va dans le fichier qui est testé.** *Posée le 2026-08-13.*
> `web/src/main.jsx` fait 334 lignes et **n'a aucun test** ; six tâches de ce lot y ajoutent un écran, et il fera le triple à l'arrivée. Entre deux tâches, rien ne détecte une régression sauf la recette de deux minutes — c'est trop peu pour la sixième.
> **Tout ce qui n'est pas de l'affichage va dans `src/ui-logic.ts`, avec son test** : décider si l'onboarding s'affiche, calculer un total, choisir le compte que l'import propose, formater une échéance de consentement, classer des connexions. `main.jsx` ne garde que le JSX et les appels réseau.
> `ui-logic.ts` existe déjà (105 lignes, `ui-logic.test.ts` en face) et porte déjà `groupAccountsByInstitution`, `oldestUpdatedAt`, `reviewGroups`, `transactionNatureLabel`. **Aucune dépendance neuve, aucun fichier neuf, aucun outil de test à installer** : la ligne de code n'est pas ajoutée, elle est déplacée là où elle est couverte.

#### T31 — Les corrections T27, plus le libellé qui déborde *(#38 — étapes 7 et 8)*

M1 (un produit Trade Republic inconnu ne fait plus échouer l'import entier), M2 (l'IBAN du PEA vient de son segment), M3 (rattrapage des transactions Nickel importées avant T27, `qualification_label` NULL), F5, F6 — **plus le débordement de libellé mesuré le 2026-08-12** : le parseur colle à un mouvement du texte de la ligne suivante, l'un avalant `TOTAL DES OPÉRATIONS`.

**Elle passe en premier** parce qu'un libellé faux fausse tout ce qui se mesure ensuite — la qualification, les tiers, ta méthode pour les vieilles transactions.

**Et elle emporte une ligne d'outillage, parce qu'elle est la première** *(décision 29, 2026-08-13)* : `package.json` — le script `test` reçoit **`--env-file=.env`**. Mesuré le 2026-08-13 dans le workspace maître, qui porte pourtant la clé : `40 tests · 39 pass · **1 skipped**`. `dotenv.config()` ne vit que dans `src/index.ts`, l'entrée du serveur ; `node --test` ne lit **jamais** `.env`. Le lien symbolique posé par Copilot (décision 15) reste nécessaire et ne suffit pas : sans cette ligne, le test qui rejoue les 606 décisions se saute en silence chez Codex **comme ici**, et le *Préserve* « l'oracle rejoue à l'identique » des huit tâches qui précèdent T44 ne veut rien dire.

**Critères** — (1) sur le corpus, aucun libellé PDF ne contient `TOTAL DES OPÉRATIONS`, et les 16 mouvements appariés de juin passent à **16/16 identiques après normalisation** (contre 13/16 aujourd'hui) ; (2) `npm test` sort à **40 pass, 0 skip** — le rejeu des 606 décisions s'exécute au lieu de se sauter, et la sortie le montre.

*Recette (réécrite le 2026-08-13)* : importer le relevé du mois — **un fichier, le geste qui a réussi le 2026-08-04** — puis lire à l'écran **combien de mouvements portent `virement_intercompte`, combien `virement_a_verifier`, combien `virement_externe`**. Lire trois libellés ne prouvait rien : T31 existe parce qu'un libellé faux **fausse la qualification**, et c'est la qualification qu'il faut regarder. Ce décompte **n'a jamais été vu** (étape 8) — la recette produit donc en prime la mesure qui manque au lot C. *L'import du lot entier appartient à T43b* : à ce stade les comptes sont encore homonymes et l'association en masse est le mur du 2026-08-11.

*Préserve* : aucune transaction supprimée, aucun `fingerprint` modifié, l'oracle rejoue à l'identique.

#### T33 — L'IBAN entre tout seul *(prérequis de T43a et T43b)*

**Mesuré** : les 9 comptes portent `iban IS NULL`, alors que l'IBAN est dans `details.account_id.iban` — réponse déjà reçue, dont seul le nom est lu — et que l'import PDF l'écrit déjà depuis T27, postérieur au dernier import réel.

**Périmètre** *(étendu le 2026-08-13)* : **`src/db.ts` — la colonne `display_name`, additive, posée par le `addColumn` existant** ; les 9 comptes actuels la reçoivent à `NULL` et continuent d'afficher `name`. Le périmètre précédent nommait trois fichiers pour un travail qui en touche quatre. `src/enable-banking.ts` lit `account_id.iban` ; la synchro le pose comme l'import, sans jamais écraser. `src/server.ts` — `PATCH /accounts/:id` `{ name?, iban?, displayName? }`, IBAN normalisé par `normalizeIban`, divergence signalée et non écrasée. `web/src/main.jsx` — un `display_name` distingue les comptes, le nom de la banque reste affiché en second ; **et le formulaire d'ajout de compte envoie enfin l'IBAN** — `POST /accounts` l'accepte depuis toujours, c'est le formulaire qui ne le demandait pas, et c'est le défaut d'étape 2 du 2026-08-11 que personne ne portait. **Ne pas toucher** le sélecteur d'import : il est réécrit une seule fois, par T43b.

**`display_name` n'est pas un confort** : l'API Revolut rend quatre comptes portant **la même chaîne de nom**. Sans une seconde colonne, aucun écran ne peut les distinguer, et `name` doit rester ce que la banque a dit — c'est ce que le *Préserve* garantit depuis T17.

**Aucun index unique sur `iban`, et ce n'est plus une prudence mais un fait** *(décision 28)*. Trois comptes Trade Republic partagent légitimement un IBAN, mesuré sur les deux relevés ; les trois pockets Revolut n'en ont aucun. Un partage est donc **silencieux et attendu**. **Ce qui se signale, c'est un IBAN qui change** — case pleine, valeur différente. La formulation précédente — « deux comptes de même IBAN sont signalés » — aurait allumé le signal sur 7 comptes sur 10 à chaque synchro.

**Critère** — après une synchro et un ré-import du corpus, **chaque compte atteignable porte son IBAN, sans qu'on ait rien tapé** ; un compte qui n'en a pas n'en invente pas. Un IBAN **modifié** est affiché, pas appliqué ; un IBAN **partagé** ne produit aucun message.

*Recette (réécrite le 2026-08-13, revue le même jour)* : **créer un compte par l'interface en tapant son IBAN** (étape 2), puis synchroniser (étapes 3 à 5), puis **renommer les quatre Revolut par le nouveau `PATCH`** et vérifier qu'ils se distinguent à l'écran. La recette précédente ne testait que la synchro, alors que la tâche touche aussi la saisie — et c'est la saisie qui a bloqué le 2026-08-11. **Elle constate au passage ce que Revolut rend comme IBAN** — aucun verdict ne s'y accroche : la décision 28 tient quelle que soit la réponse, et la question est déjà tranchée par la sortie brute du 2026-08-04 (compte principal avec IBAN, trois pockets sans).

*Préserve* : la synchro n'écrase toujours pas `name` ; aucun `accountId` ne change ; l'oracle rejoue à l'identique.

#### T43a — Le relevé rend les comptes qu'il trouve *(aucun effet visible)*

**Mesuré** : `accountKey` est un matcheur en dur et **saute en silence** ce qu'il ne reconnaît pas. `parseBanquePostale` **exige les trois comptes** — un quatrième produit LBP serait ignoré sans un mot, et fermer le Livret Jeune ferait échouer **tous** les imports. `PdfAccountKey` n'est pas une liste mais une **clé de `Map` et une contrainte de type** qui traverse les trois parseurs.

**Ce que le parseur sait déjà et qu'on jette** : `accountName` extrait le **nom imprimé sur le relevé** (la table en dur n'est qu'un repli) et `ibanFromLines` lit l'IBAN de chaque segment. **Cette tâche n'invente rien : elle arrête de jeter.**

**Périmètre** : `src/pdf-import.ts` **et lui seul**. Le relevé rend ses segments tels qu'il les a trouvés, portant leur nom imprimé et leur IBAN quand il y est ; l'exigence des trois comptes disparaît ; **un segment non reconnu est compté et nommé**, jamais sauté. `accountKey` devient un repli interne. **Ne pas toucher** : le contrat de `src/server.ts`, `web/src/main.jsx`, la reconnaissance de format et la lecture de mise en page — c'est la limite assumée.

**Critères** — (1) un relevé LBP amputé d'un de ses comptes s'importe quand même ; (2) un segment inconnu est nommé au lieu d'être sauté ; (3) les trois formats rendent **exactement les mêmes chiffres** sur le corpus, cités ligne à ligne ; (4) **sur chaque segment de chaque relevé, `ouverture + Σ mouvements = clôture`** — l'écart, s'il existe, est nommé avec son fichier et son compte.

> **Le critère (4) est un plancher mesuré, pas une ambition** *(2026-08-13, décision 34)*. Il tient **aujourd'hui sur 25 segments sur 25**, sans un centime d'écart, et les chaînes se referment aussi d'un relevé au suivant : CCP 381,55 € en juin 2025 + treize relevés = 230,67 € en juillet 2026 ; Livret A 0,04 € → 79,18 € ; Nickel 0,00 € → 1,21 € ; Trade Republic 2,61 € → 957,27 €. C'est la seule vérification qui n'a besoin d'aucun décompte codé en dur, et c'est exactement celle qui attrape la panne de T31 : un parseur qui avale une ligne ou fait déborder un libellé casse l'égalité immédiatement. `verifyTradeRepublicTotals` fait déjà ce geste pour un format ; il s'agit de le généraliser aux trois. **Le relevé porte sa propre ouverture** — il n'est donc jamais nécessaire de remonter à la création du compte pour valider le parsage.

> **Exception à R4, acceptée par Lamoms le 2026-08-13 : cette tâche n'a pas de recette.** Elle ne change rien à l'écran — sa preuve est le corpus, chiffre à chiffre. C'est le prix du découpage, et il est payé une seule fois : la coupure existait déjà dans le code, T43 entière demandait cinq travaux simultanés dans quatre fichiers.

*Préserve* : l'atomicité SQL et le refus sur correspondance ambiguë ne bougent pas ; l'oracle rejoue à l'identique.

#### T43b — L'import se rapproche tout seul, par IBAN *(étape 7)*

**Mesuré** : `pdfAccountKeys` est une liste de **sept clés en dur** dans `web/src/main.jsx`, dupliquée du type backend sans source unique. Et `parsePdfStatement` **reconnaît déjà l'établissement tout seul** — il lit l'en-tête des deux premières pages et choisit son parseur. L'application sait donc de quel établissement vient le relevé sans rien demander ; ce qu'elle demande aujourd'hui, c'est **quel compte à toi correspond à chaque compte du relevé**, sept fois, pour tous les formats à la fois. C'est le mur du 2026-08-11.

**Le mécanisme, arrêté avec Lamoms le 2026-08-13, corrigé le même jour par la mesure.** L'initialisation a établi les comptes de chaque établissement avec leurs infos (T45a/T45b). Le parseur reconnaît l'établissement. Il ne reste qu'à rapprocher les comptes du relevé de ceux qu'on connaît **pour cet établissement-là** — **par IBAN, puis par nom imprimé exact quand l'IBAN ne discrimine pas** (§4, décision 28). Ce qui ne se rapproche par aucune des deux voies est **proposé pré-rempli**, et tu confirmes.

**Pourquoi deux voies et non une** : les trois segments Trade Republic portent **le même IBAN** — mesuré sur les deux relevés. Avec l'IBAN seul, le rapprochement rendrait trois candidats pour chaque segment, la demande se déclencherait, et le critère (1) serait faux **tous les mois, pour toujours**. Leurs noms imprimés, eux, sont distincts et stables.

**Rien n'est mémorisé, et c'est le point** : la **correspondance** se recalcule à chaque import. Aucune table, aucune colonne — au-delà de celle que T33 a déjà posée. Ce qui s'enregistre, ce sont **les infos du compte**, et la décision 19 le prévoyait : **confirmer une correspondance écrit le nom imprimé dans `display_name` s'il est vide**, en silence, jamais par écrasement — la règle de l'IBAN mot pour mot. Sans ce geste, le compte Trade Republic entré par l'API porte le nom de l'API et jamais celui du relevé, et la même question se reposerait chaque mois. Dès le deuxième mois, il se rapproche seul.

L'IBAN du Livret Jeune n'est imprimé que **2 relevés sur 13** — décembre 2025 et janvier 2026, tous deux dans le corpus — mais `SET iban = COALESCE(?, iban)` le pose **définitivement** au premier des deux ; après quoi tous les mois suivants se rapprochent seuls. Les comptes qui n'ont pas d'IBAN du tout (PEA, PEA 2) vivent sur le nom imprimé, qu'ils portent depuis leur naissance en T45b.

**Périmètre** : `src/server.ts` — import en deux temps, **détecter puis associer** ; `PdfAccountKey` sort du contrat public ; le rapprochement par IBAN est **borné aux comptes de l'établissement détecté**. `web/src/main.jsx` — `pdfAccountKeys` disparaît, le formulaire ne montre plus sept listes mais les comptes réellement trouvés dans les fichiers déposés. **Ne pas toucher** `src/pdf-import.ts` : T43a l'a fait.

**Critères** — (1) *(reformulé le 2026-08-13)* un import mensuel ne demande une correspondance que pour un compte **dont ni l'IBAN ni le nom imprimé ne rejoignent un compte connu de cet établissement** ; les autres se rapprochent seuls, Trade Republic compris dès le deuxième import ; (2) un rapprochement qui trouve **plusieurs** candidats demande au lieu de choisir ; (3) `git grep` ne rend aucun nom **désignant un compte réel** dans `web/` ni dans le contrat serveur (voir critère 7 du §8) ; (4) **le rejeu du corpus passe désormais par `POST /imports/pdf`** dans le test, au lieu d'une insertion directe en base — la route, sa correspondance et son atomicité entrent dans ce qui se rejoue à chaque exécution.

**Deux obstacles matériels, mesurés le 2026-08-13, et ils sont dans le périmètre** : les **13 relevés LBP n'ont aucune extension de fichier**, or le champ porte `accept="application/pdf,.pdf"` — il **cache le corpus principal** par défaut. C'est l'observation T25-3 de `ux-observations.md`, classée *faible* et écartée en bloc par le §9 ; elle est aujourd'hui sur le chemin critique. Le filtre part : le format est reconnu côté serveur, le filtre ne protège de rien. Et les **deux PDF Trade Republic se recouvrent** — `statement.pdf` (2025-12-01 → 2026-05-31) est un sous-ensemble de `Relevé de compte.pdf` (2025-09-01 → 2026-06-13). Il est **exclu de la sélection** de la recette, et **il ne se supprime pas** : `src/pdf-import.test.ts` le lit en dur.

*Recette* : **importer le corpus en une fois — 25 fichiers**, 13 LBP + 11 Nickel + `Relevé de compte.pdf`, étape 7 dans sa vraie forme. **Ce n'est pas un confort : c'est le prérequis de T44.** Une décision d'oracle s'accroche à une ligne de `transactions` ; l'oracle porte **911 mouvements** quand la base en portait 609, parce que l'import complet n'a jamais réussi. *(Le 26ᵉ document du corpus est le CSV Revolut : il n'entre par aucune route — voir T44.)*

*Préserve* : les chiffres du corpus, l'atomicité SQL, le refus sur correspondance ambiguë ; réimporter le même lot ne crée rien ; l'oracle rejoue à l'identique.

> **Attention mesurée** : l'IBAN n'est pas toujours sur le relevé. Sur 12 relevés BP, l'IBAN du CCP apparaît 12 fois, celui du Livret A 11 fois, **celui du Livret Jeune 2 fois** — il n'est lu que dans la section d'opérations, absente quand le compte n'a pas bougé. Le compte, lui, est toujours dans le bloc de situation. Le nom imprimé reste donc le repli des comptes peu actifs, le temps qu'un mois porteur d'IBAN passe.

#### D5 — Inconnu n'est plus zéro *(sortie de T45 le 2026-08-13)*

**Mesuré** : `GET /balance` calcule `CASE WHEN a.external_hash IS NOT NULL THEN a.balance_cents ELSE COALESCE(a.balance_cents, SUM(t.amount_cents), 0) END`. Le `, 0` final affiche un compte sans données à **`0,00 €` dans un total crédible** — c'est P38 mot pour mot. Et `unknownBalanceCount` compte `balanceCents === null` : à cause de ce même `COALESCE`, il **ne peut jamais être non nul** pour un compte non synchronisé.

**Pourquoi elle sort de T45.** Trois lignes de SQL, une recette de dix secondes, et un problème ouvert qui se ferme tout de suite au lieu d'attendre la fin de l'onboarding. Rien dans D5 ne dépend de l'onboarding ; c'est l'onboarding qui la consomme.

**Périmètre** : `src/server.ts`, `GET /balance` — le `, 0` disparaît, `totalCents` et `institution.balanceCents` cessent de compter l'inconnu comme un zéro. `web/src/main.jsx` — un solde inconnu s'affiche comme inconnu, jamais comme un montant ; **et la ligne de compte dit d'où vient son chiffre** — *reçu de la banque* · *calculé sur les mouvements connus* · *inconnu*.

**L'origine du solde est déjà dans la requête** *(ajout du 2026-08-13, décision 13 de `ui-reference.md` §7 recueillie ici)* : `external_hash` non nul est exactement ce qui distingue les deux premiers cas, et le `CASE` que D5 modifie le lit déjà. Aucune requête neuve, aucune colonne. **Pourquoi ça compte** : le 2026-08-04, La Banque Postale affichait 4,57 € pour une somme de mouvements de −537,74 €, parce qu'un solde synchronisé n'est pas la somme de ses transactions. Sans le mot qui dit lequel des deux on regarde, l'écart ressemble à un défaut. *L'écart chiffré, lui, est une preuve et non un affichage : il vit dans le critère (4) de T43a et dans la couverture de T42.*

**Critère** — un compte sans aucune donnée n'affiche pas `0,00 €`, le total agrégé ne le compte pas pour zéro, et chaque ligne de compte porte l'origine de son solde. *Recette* : créer un compte sans rien y importer, ouvrir l'écran des soldes, lire ce qui s'affiche à sa ligne, vérifier que le total n'a pas bougé, et lire l'origine sur un compte synchronisé et sur un compte alimenté par relevé. *Préserve* : les huit soldes justes sur neuf du 2026-08-04 ne changent pas d'un centime ; `unknownBalanceCount` reste le nom du décompte.

#### T45a — L'onboarding : déclarer et connecter *(étapes 0 à 1)*

1. *« Chez quelles banques as-tu des comptes, et combien chez chacune ? »* — le nom et un nombre.
2. L'application teste chaque banque contre le catalogue Enable Banking et annonce : **disponible par API, ou non**.
3. Pour les disponibles : connexion, puis elle dit ce qu'elle a trouvé **et ce qui manque** — *« La Banque Postale : 1 compte sur les 3 annoncés. Les livrets ne passent pas par l'API. »*
4. **Et elle fait nommer ce qu'elle ne peut pas distinguer** *(ajouté le 2026-08-13)*. Mesuré sur la sortie brute du 2026-08-04 : Revolut rend **quatre comptes portant la même chaîne de nom**. L'identité ne manque pas — `cash_account_type` sépare le compte (CACC) des pockets (SVGS), et `account_id.other.identification` donne un UUID à chacune — c'est le **nom** qui manque, et lui seul. L'application montre donc les quatre, avec ce qu'elle sait les distinguer, et demande un nom pour chacun : il va dans `display_name` (colonne posée par T33). **C'est le seul endroit du produit où l'utilisateur tape du texte pour un compte, et ce n'est pas un chiffre** — la règle « pas de solde saisi » n'est pas entamée.

**La déclaration ne s'enregistre pas — décision de Lamoms, 2026-08-13.** Le nombre annoncé est une valeur de travail, vivante le temps de la conversation : il sert à dire *« il en manque deux »* pendant l'onboarding, et rien de plus. **Ce qui s'enregistre, ce sont les comptes trouvés et leurs infos.** L'application ne prétend donc jamais, plus tard, savoir ce qui manque : c'est l'utilisateur qui le dit, au moment où il le dit. **Aucune colonne, aucune table.**

**Ce qui déclenche l'onboarding** : les tables des établissements et des comptes sont **vides**. Rien d'autre.

> **Et sa recette se fait sur la base réelle, qu'on vide d'abord** *(décision 36, 2026-08-13 — remplace « sur une copie »)*. C'est le seul moment du PRD où la base repart de zéro, et c'est ici parce que c'est ici que naît l'outil qui la reconstruit proprement. Ce qu'on jette : 9 comptes homonymes sans IBAN, hérités de créations par `curl`. Ce qu'on reconstruit : chaque compte avec son nom, son IBAN quand il existe, son `display_name`.
> **Le coût est réel — trois authentifications fortes** — mais il est déjà dû : la rotation de la clé Enable Banking du lot 0 invalide les sessions de toute façon. **Les deux gestes se font ensemble, une fois.**
> **Conséquence à ne pas découvrir après coup** : le corpus est **réimporté** et Revolut **resynchronisé** entre T45b et T44. L'import complet de T43b n'est donc pas perdu, il est fait deux fois — un geste de sélection de fichiers, déterministe, et la seconde fois sur une base dont les comptes sont enfin nommés. C'est la seule façon d'obtenir la matière de T44 dans un état propre.

**Et l'ajout ordinaire reste accessible en permanence.** Ajouter un établissement, ajouter un compte, connecter une banque : ces trois gestes existent déjà (`ManualSetup`, `BankConnect`) et **ne disparaissent pas**. L'onboarding ne les remplace pas, il les enchaîne le premier jour. Sans cette phrase, un compte arrivant après coup n'aurait plus aucune porte.

**Aucun outil de design, aucune dépendance, aucune CSS neuve.** L'onboarding est une suite de questions, pas un écran à dessiner : il réutilise les styles existants.

**Critère** — partir d'une **base vide**, déclarer ses banques, en connecter une, voir ses comptes apparaître **et pouvoir les distinguer** — sans terminal. *Recette* : c'est le critère, sur la base réelle vidée, dans le même geste que la rotation de clé — étapes 0 à 1. *Préserve* : le déclenchement reste conditionné aux tables vides et à rien d'autre — **aucune livraison ne réinitialise une base d'elle-même**, le vidage est un geste humain ; l'ajout ordinaire reste atteignable après coup ; aucun solde n'est saisi.

#### T45b — L'onboarding : détecter dans les relevés et récapituler *(étape 2)*

5. Pour ce que l'API ne donne pas : *« donne-moi tes relevés »*, et elle en **détecte** les comptes, leurs noms, leurs IBAN, leurs soldes — c'est T43a qui les rend.
6. Récapitulatif, tu **confirmes**. Ce qui manque encore est listé **une fois**, dans la conversation, et n'est pas conservé.

**C'est ici que les comptes non exposés par l'API entrent avec leur nom imprimé et leur IBAN**, donc c'est ici que le rapprochement automatique de T43b devient possible les mois suivants. **Quatre comptes n'ont pas d'autre porte** : le Livret A et le Livret Jeune (acquis A1), et — mesuré le 2026-08-13 sur la sortie brute — le **PEA et le PEA 2 de Trade Republic**, l'API ne rendant qu'un seul compte TR, le compte espèces. Ces quatre-là naissent donc **avec leur nom imprimé dès le premier jour**, et se rapprochent seuls à tous les imports suivants.

**Critère** — un compte que l'API ne donne pas entre **depuis son relevé**, avec son nom imprimé, son IBAN quand il y est, et son solde daté — sans qu'on ait tapé un chiffre. *Recette* : poursuivre T45a en déposant les relevés, confirmer le récapitulatif, et retrouver tous ses comptes avec un solde ou un « inconnu » explicite — étapes 0 à 2 d'un bout à l'autre. **Puis, la reconstruction faite : réimporter le corpus (25 fichiers) et resynchroniser Revolut** — c'est la matière première de T44, et c'est ici qu'elle se refait après le vidage. *Préserve* : aucun solde saisi à la main ; D5 n'est pas annulée — un compte sans donnée reste inconnu, pas zéro.

#### T34 — Les banques connectées se voient, et chacune se relance *(étapes 3 à 6, et le mobile)*

**Mesuré** : trois connexions `AUTHORIZED` en base et l'interface ne les lit jamais. `SyncButton` dépend d'une clé `localStorage` **unique** : une deuxième banque écrase la première, et sur le téléphone la clé n'existe pas, donc **le mobile est en lecture seule sans que rien ne le dise**. `recordBankError` écrase toute erreur non typée en `"SYNC_FAILED"` — un code sans cause, en base depuis le 2026-08-04.

**Périmètre** : `src/server.ts` — `GET /enable-banking/connections` (les données existent, `status/:id` les rend une par une) ; `recordBankError` enregistre la cause réelle. `web/src/main.jsx` — une ligne par connexion, son statut, sa validité de consentement, sa dernière synchro, son erreur, son propre bouton ; `localStorage` cesse d'être la source de vérité.

**Elle prévient avant l'échéance de consentement, pas après.** Mesuré dans le catalogue complet : `maximum_consent_validity` vaut 180 jours pour **2611 banques sur 2632**, et **90 jours pour 19 — toutes des instances de Trade Republic**. Ta connexion TR est donc à re-authentifier **quatre fois par an**, contre deux pour les autres, et le geste du 8 tombera dessus un mois sur trois : la synchro échouera pour consentement expiré au lieu d'une vraie panne. La route rend déjà `consentValidUntil` — il suffit de l'afficher en avance : *« Trade Republic — consentement expire dans 12 jours »*.

**Critère** — les trois connexions apparaissent sur le PC **et** sur le téléphone, relancer l'une n'affecte pas l'autre, et une échéance de consentement proche est annoncée avant d'être subie. *Recette* : connecter deux banques et synchroniser chacune séparément, depuis le téléphone — étapes 3 à 6. **Les deux banques sont nommées : Revolut et une autre** *(précisé le 2026-08-13)*. Ce n'est pas un détail de recette : Revolut n'a aucun relevé, donc **la synchro de T34 est le seul chemin par lequel ses mouvements entrent en base**, et sans eux le second critère de T44 n'est pas mesurable. Même défaut que les deux inversions du §7, attrapé avant qu'il coûte une tâche. *Préserve* : `status/:id` et `sync/:id` gardent leur contrat, le callback ne change pas d'une ligne, aucun jeton n'apparaît dans un message ou un journal. **Hors périmètre** : établir une connexion depuis le téléphone (C4).

#### T44 — L'oracle entre dans la base, et il grandit *(prérequis de T35 — remontée le 2026-08-13)*

**Pourquoi elle passe avant T35.** T35 dit que trancher *« écrit une ligne d'oracle (T44), jamais une colonne sur `transactions` »* : livrée en premier, elle écrirait dans une table qui n'existe pas. Et le retour est vrai aussi — le critère *« le décompte augmente d'un »* suppose le `PATCH` de T35. Chacune portait la preuve de l'autre. **T44 passe devant, et le critère du décompte déménage dans T35.**

**Ses prérequis, et ils sont durs — trois, nommés le 2026-08-13** : une base **onboardée** (T45b), le **corpus réimporté** après le vidage, et une **synchro Revolut** (T34). La base doit contenir les mouvements que l'oracle décrit : l'oracle porte **911 mouvements** sur 10 comptes et 14 mois ; la base en portait **609** à la dernière mesure, parce que l'import complet du corpus n'a **jamais** réussi — l'étape 7 a bloqué deux fois.

> **Un tiers de l'oracle n'entre par aucune route, et c'est mesuré** *(2026-08-13, décision 31)*. Le manifeste porte 26 documents : 13 relevés LBP, 11 Nickel, 1 Trade Republic — et **`REV-2025-09-04`, format `csv`, 250 mouvements**, qui portent **226 des 606 décisions, soit 37 %**. Le CSV n'est pas un canal du produit : aucune route ne l'implémente, et l'essai du 2026-08-04 a versé 121 doublons dans le mauvais compte. La base de vérité a été construite ainsi parce que c'était le plus simple à l'époque ; **Revolut passe désormais par l'API seule, et ça suffit.**
> Conséquence directe : **le critère « 606 sur 606 » était inatteignable par le chemin que ce PRD prescrit.** Il se coupe en deux, et le CSV reste où il est utile — **dans la preuve, jamais dans le produit** : `qualification-oracle.test.ts` porte sa propre fonction de lecture du CSV, qui n'existe que là.

**Et deux travaux étaient cachés dans « elle référence la ligne de transaction »** — ni l'un ni l'autre n'était écrit. **(a) La correspondance des comptes** : l'oracle en connaît 10, la base en portait 9, et l'API Revolut en rend 4 là où l'oracle en compte 3 — aucun des trois décomptes ne se recoupe, et la table de correspondance est **fournie en donnée d'import, jamais devinée**. **(b) L'appariement des mouvements** : l'oracle ne porte ni empreinte ni identifiant applicatif, seulement `account`, `date`, `amount_cents`, `label`. Retrouver la ligne, c'est la déduplication — donc **on réutilise `deduplicateTransactions`, on n'écrit pas un second moteur** (C11 : l'empreinte ne peut pas porter cette identité).

**Mesuré, et c'est sérieux** : l'oracle vit dans `~/Documents/releves-pdf/oracle/` — trois fichiers JSON **hors du dépôt, hors de la base chiffrée, hors de la sauvegarde**. Le repli du chemin est **WSL en dur** (`join("/mnt/c/Users", process.env.USER)`) ; la surcharge `GESTIO_T27_ORACLE_REPO` existe déjà, c'est le repli qui ne survivra pas au Raspberry Pi. Mais **la cause réelle du saut silencieux est ailleurs** : le test se saute sur `GESTIO_PERSONAL_NAMES`, absente de tout worktree — donc chez Codex, `npm test` a toujours été vert **sans avoir rejoué une seule décision**. C'est P47 et P52 par une troisième porte, dans la preuve la plus citée du projet.

**Périmètre** : `src/db.ts` — la table d'oracle, additive, chiffrée donc sauvegardée. Elle référence **la ligne de transaction**, jamais l'empreinte (C11). Elle porte deux types de faits — *confirmé par relevé* et *nature tranchée* — avec leur date et leur preuve. Le jeu de T27 y est **importé une fois** comme premier état. `src/server.ts` — `DELETE /transactions/:id` **refuse** un mouvement qui porte une vérité. `src/qualification-oracle.test.ts` — le repli WSL disparaît, et le test **échoue au lieu de se sauter**. **Aucun drapeau d'échappement** *(supprimé le 2026-08-13)* : le worktree reçoit désormais `.env` et le corpus est atteignable par chemin absolu, donc il n'existe plus de cas légitime où sauter — et un drapeau serait précisément le mécanisme qui refabrique un vert vide.

**Le vocabulaire des natures s'unifie ; on ne pose aucune couche de traduction** *(décision 30, 2026-08-13)*. Mesuré : l'oracle écrit `virement_interne` (382), `externe_probable` (127), `virement_a_verifier` (97) ; `src/schema.ts` connaît `virement_intercompte`, `virement_externe`, `virement_a_verifier`. Deux mots sur trois diffèrent — recopiés tels quels, ils sortiraient de l'énumération, le `PATCH` de T35 les rejetterait et la recette de T31 ne les compterait jamais. **Le code fait foi, comme pour F2 et F3** : le renommage se fait **dans l'artefact d'oracle** (`virement_interne → virement_intercompte`, `externe_probable → virement_externe`), pas dans le schéma — les 606 décisions et les 191 paires ne bougent pas d'un chiffre, la base ne migre pas, l'application ne change pas d'une ligne. Rien ne se perd : la nuance « probable » est déjà portée par `confidence`, dont le décompte `probable = 127` égale exactement celui d'`externe_probable`. **La garde qui rend l'unification vraie au lieu d'espérée : le test échoue si l'oracle porte une nature absente de `transactionNatures`.**

**Le classement des décisions se recopie ; il ne se reconstruit pas** *(mesuré le 2026-08-13 dans `expected-final.json`)*. Chaque décision porte déjà un champ `confidence` : **`certaine` 336, `forte` 46, `probable` 127, `faible` 97** — et `certaine + forte = 382`, exactement les virements internes adossés aux 191 paires (168 certaines + 23 fortes). **On importe ces quatre niveaux tels quels.** Le « 386 » du §10 de `rapport_T27_consolidation.md` ajoute 4 décisions venues de 2 ambiguïtés bijectives, décrites en prose et introuvables mécaniquement : viser 386 obligerait Codex à bricoler. Le « 386 contre le reste » redevient **un décompte qu'on lit**, jamais une donnée qu'on stocke — et l'information reste entière : quelle proportion de l'argent demande vraiment une attention humaine, sur 911 mouvements et 14 mois.

**Critères** *(1 et 2 refondus le 2026-08-13)* — (1) le premier état attache **380 décisions sur 380** — celles nées des relevés : 246 La Banque Postale, 44 Nickel, 90 Trade Republic — et **191 paires sur 191** ; **un seul non attaché est ROUGE** ; (2) **le taux d'attachement des 226 décisions Revolut est mesuré et écrit** — un nombre, pas une porte : elles s'appuient sur des lignes venues de l'API quand l'oracle les a lues dans un CSV, et ce chiffre n'existe nulle part aujourd'hui ; (3) les quatre niveaux de `confidence` sont en base à l'identique — 336 / 46 / 127 / 97 ; (4) **aucune nature hors `transactionNatures` n'entre en base**, et le test échoue si l'artefact en porte une ; (5) la suite devient **rouge** quand la source manque, prouvé en la retirant, **et il n'existe aucun moyen de la rendre verte sans la source** ; (6) `DELETE /transactions/:id` refuse un mouvement qui porte une vérité, et dit pourquoi.

> **Pourquoi le critère (2) mesure au lieu de barrer.** Apparier un oracle né d'un CSV à des lignes nées de l'API, c'est exactement la difficulté que R3 interdit d'esquiver et que C11 dit que l'empreinte ne peut pas porter. Sous un critère tout-ou-rien, T44 serait ROUGE par construction et bloquerait T35, T36, T38 et T42 derrière elle. Mesuré, le chiffre devient utile : haut, la recette de T35 le durcit ; bas, on l'apprend **avant** qu'il soit un verdict.

*Recette* : sur la base reconstruite (T45b), corpus réimporté et Revolut resynchronisé, lancer l'import du premier état, **lire les deux compteurs** — les 380 attachées, et le taux Revolut —, redémarrer l'application, les relire ; puis tenter de supprimer un mouvement qui porte une vérité et lire le refus. *Préserve* : le rejeu du test rend **exactement** 191 paires et 606 décisions — ce nombre-là ne bouge pas ; aucun libellé ni IBAN ne sort de la base ; aucune transaction n'est modifiée par l'import de l'oracle.

#### T35 — La qualification s'affiche, et elle se conteste *(étape 8 — après T44)*

**Mesuré** : aucun `PUT`, aucun `PATCH` dans les 18 routes ; les 606 décisions n'ont **aucune méthode** qui permette d'en contester une. Et `requalifyTransactions` réécrit `nature` à chaque import — une correction manuelle serait écrasée au passage suivant.

**Périmètre** : `src/server.ts` — `PATCH /transactions/:id` `{ nature }`, validée contre `transactionNatures` ; trancher **écrit une ligne dans la table d'oracle livrée par T44**, jamais une colonne sur `transactions`. `src/qualification.ts` — `requalifyTransactions` consulte l'oracle et n'écrase pas ce qui y figure. `web/src/main.jsx` — un écran de revue qui liste les `virement_a_verifier` et laisse trancher en un geste ; `transactionNatureLabel` existe déjà.

**Critères** — (1) corriger une nature, réimporter le même relevé, relancer une synchro : **la correction survit**, et l'écran dit d'où vient chaque décision ; (2) **le décompte d'oracle augmente d'un après une décision tranchée** *(critère venu de T44, qui n'avait pas le geste pour le prouver)*. *Recette* : contester une qualification, lire le compteur monter, puis la voir survivre à un ré-import — étape 8. *Préserve* : toute transaction non tranchée continue d'être requalifiée ; `POST /transactions/resolve` et `DELETE /transactions/:id` gardent leur sémantique de doublon ; l'oracle rejoue à l'identique et **ne rétrécit jamais**.

#### T36 — Restaurer, pas seulement sauvegarder *(étape 11 — remontée devant T38 le 2026-08-13)*

On sait relire une sauvegarde — 609 transactions le 2026-08-04. **On n'a jamais restauré.**

**Pourquoi elle passe devant T38.** Le critère de T38 est *« restaurer la sauvegarde dans une base vide »*, et sa recette repose entièrement sur une restauration. Livrée avant T36, elle n'aurait aucun outil pour le faire — la même inversion que T35 devant T44, découverte dans la même revue.

**Périmètre** : `scripts/restore.sh`, symétrique de `backup.sh` — `sqlcipher_export()` en sens inverse, **jamais `.backup`**, refus d'écraser une base existante sans confirmation. `package.json` — le script `lint` passe `bash -n` sur les scripts, ajouter le nouveau.

**Critères** — (1) repartir d'une base vide, restaurer, retrouver le solde et le nombre de transactions attendus, chiffres cités ; (2) **l'oracle ressort intact de la restauration** — 606 décisions, 191 paires *(critère venu de T44, qui n'avait pas encore l'outil pour restaurer)*. *Recette* : c'est le critère — étape 11. *Préserve* : `backup.sh` et la rotation à 30 jours ne changent pas.

#### T38 — La connaissance déclarée entre dans la base chiffrée *(P58)*

`GESTIO_PERSONAL_NAMES` est lue depuis `process.env` en un seul point et de nulle part ailleurs. `scripts/backup.sh` source `.env` pour la clé mais ne sauvegarde que la base : la variable n'est **ni chiffrée ni sauvegardée**. Restaurer sur le RPi rouvre P30 en silence. `application_secrets (name, value, updated_at)` existe déjà, chiffrée et sauvegardée — **on la réutilise, on ne crée pas de table.** `.env` devient une **amorce**, lue une fois si la base est vide.

**Elle emporte `INSTITUTION_ALIASES`** : `src/qualification.ts` porte en dur `"LA BANQUE POSTALE"`, `"NICKEL"`, `"REVOLUT"`, `"TRADE REPUBLIC"` et leurs alias. **Le nom des banques de l'utilisateur est dans le moteur de qualification.** Les établissements sont déjà en base ; un alias est de la connaissance déclarée.

**Critère** — restaurer la sauvegarde dans une base vide sur une autre machine : les noms sont là, la qualification n'est pas dégradée.

*Recette (réécrite le 2026-08-13)* : **compter les mouvements par `nature` avant**, restaurer sur une copie, **recompter après**, et citer les deux chiffres. Lire un seul virement, c'était tirer au sort : T38 déplace les noms de personnes et de banques, et un alias perdu fait basculer des **centaines** de mouvements — le §10 chiffre déjà cette mitigation, la recette la fait.

*Préserve* : l'oracle rejoue à l'identique — un écart signifie qu'un alias s'est perdu, pas que la règle a changé ; aucun nom dans un fichier versionné ni dans un journal.

#### T42 — Les trous se voient *(étape 12 — rend vérifiable le geste du 8)*

**Mesuré** : rien ne dit quel mois manque pour quel compte. Le corpus s'est arrêté au relevé du 2026-07-08 sans que l'application le signale — personne ne l'a vu avant que Copilot ne liste le dossier à la main.

**Périmètre** : `src/server.ts` — `GET /coverage`, **lecture seule**, dérivé de ce qui est déjà en base : par compte, premier et dernier mois portant une transaction, mois sans ligne entre les deux, `known_since`, et le décompte des mouvements **jamais confirmés par un relevé**. Aucune table, aucune colonne, aucune écriture. `web/src/main.jsx` — un bloc par compte.

> **Deux pièges, et ils sont la moitié de la tâche.**
> 1. **Un mois sans mouvement sur un Livret A est normal** — et c'est mesuré, pas supposé : sur les 13 relevés du corpus, le **Livret Jeune porte zéro mouvement dans 11**, avec un solde inchangé, et le Livret A en porte zéro dans 1. Le cas n'est pas une exception à prévoir, c'est le régime ordinaire de ces comptes. La vue distingue « pas de relevé importé » de « relevé importé, aucun mouvement ».
> 2. **Toutes les banques n'ont pas de relevé.** Revolut n'a aucun chemin PDF — l'API rend 3727 jours. Une vue qui attend un relevé par compte et par mois signalerait Revolut en trou **tous les mois**, à tort. La couverture se **déduit** de ce qui est observé : un établissement dont le plus vieux mouvement API est plus récent que son plus vieux relevé a besoin du PDF ; Revolut n'en aura jamais besoin, BP et Trade Republic toujours.
>
> Sans ces deux distinctions, la vue est pire que rien : elle apprend à ignorer un signal.

**Critère** — juillet 2026 apparaît manquant pour La Banque Postale tant que son relevé n'est pas importé, et cesse de l'être une fois importé. *Recette* : importer le lot du mois et voir la couverture se refermer. *Préserve* : `GET /balance` **n'est pas modifiée par cette tâche** — et surtout, **D5 n'est pas annulée** : un compte sans données reste inconnu, il ne redevient pas zéro. *(Formulation corrigée le 2026-08-13 : « ne change pas d'un octet » aurait fait croire à Codex qu'il devait défaire D5, livrée neuf tâches plus tôt.)* Aucune écriture n'est introduite.

---

### Lot B — Le parcours

#### T37 — Mise en service n°3, étapes 0 à 12 *(aucune ligne de code)*

**Le protocole fait foi et vit dans `.lamoms/mise-en-service.md`**, fusionné le 2026-08-12 : les 8 étapes du 2026-08-04 et les 12 de #40 vivaient dans deux fichiers et divergeaient — c'est ce genre de contradiction qui a valu le ROUGE à #41.

**Un seul parcours**, décidé par Lamoms : la mesure se fait à chaque tâche (R4), pas à chaque parcours. Celui-ci est une **confirmation**, pas une découverte.

**Règle inchangée : on ne corrige rien en cours de route.** Un blocage dur arrête le parcours et devient la tâche suivante. C'est **Lamoms** qui le fait, pas un agent.

C'est ici que **P28 se ferme** — chaque compte déclaré porte un solde, comparé un par un à son application bancaire, montant attendu et montant affiché. **Le parcours commence par établir la liste des comptes ; il ne la reprend d'aucun document.** Il note aussi par quel chemin **Sumeria** entrerait — API, relevé ou saisie.

**Critère** — le parcours atteint l'étape 12, ou nomme son blocage dur. Chaque étape porte un fait chiffré, et les 18 méthodes ont un état. *Préserve* : aucune correction, aucun arbitrage rendu en cours de route ; si le parcours part de la base réelle, l'empreinte de `data/gestio.db` est relevée avant et après.

---

### Lot C — Ce que le parcours aura mesuré

*Périmètre fermé par les constats de T37.*

#### T39 — Le tiers reconnu une fois est reconnu toujours

Corriger un mouvement corrige un mouvement : le même virement du même tiers repose la même question le mois suivant. Quand tu tranches (T35), l'application **propose** de retenir la règle ; elle ne l'écrit que sur un geste explicite. Une règle se liste et se supprime, et sa suppression rend les mouvements au jugement du moteur.

**Son déclencheur est concret** : un **IBAN inconnu** apparaît dans un libellé → l'application demande à qui il est et si elle peut le retenir, pour que les virements suivants vers cet IBAN se qualifient seuls.

*Préserve* : refuser une proposition n'écrit rien ; aucune règle n'apparaît sans confirmation ; l'écran dit toujours d'où vient une décision.

#### T47 — Les dépenses réelles, sur une période

**C'est le consommateur manquant des 606 décisions, et Lamoms l'avait déjà arbitré.** `ui-reference.md` §6, le 2026-08-11 : *« un virement interne est un mouvement réel pour chacun des deux comptes ; l'exclure fausserait les soldes par compte… **L'exclusion a sa place dans les dépenses / le bilan, pas dans `GET /balance`** »*.

**Sans cette tâche, tout le cycle 2 n'a produit aucun effet observable.** T27 a coûté trois livraisons pour qualifier les virements internes ; P30 dit que **44 % des débits** sont des virements internes comptés comme des dépenses ; et ils le sont toujours, parce qu'**aucun écran ne montre de dépenses**. C'est aussi ce sur quoi T41 s'appuie : *« si une dépense me met en danger »* suppose qu'on sache ce qu'est une dépense.

**Comment une dépense se définit — en négatif, et c'est mesuré.** La majorité des vraies dépenses portent `nature = NULL` : `qualifyAlone` ne rend quelque chose que pour les virements, retraits et dépôts, donc un achat par carte ressort sans nature. On ne peut pas définir les dépenses par une nature positive. **Dépenses = toutes les sorties, moins `virement_intercompte`.**

**Les « à vérifier » ne sont ni dedans ni dehors : le total affiche une fourchette** — *« 1 240 € dépensés, plus 180 € incertains sur 12 mouvements à vérifier »*. Un chiffre unique mentirait dans un sens ou dans l'autre, et la fourchette est ce qui donne envie d'aller trancher.

**Périmètre** : `src/server.ts` — `GET /transactions` accepte `?from=&to=` (ISO), validés, `400` hors format. `web/src/main.jsx` — l'écran `quoi`, **pas un quatrième écran** : deux `<input type="date">` natifs, un total, et la fourchette des incertains. Aucune dépendance.

> **Contrainte établie le 2026-08-13, avant même l'écriture de la tâche : le total se calcule en SQL, côté serveur.** `GET /transactions` ne rend que **100 mouvements** par appel (500 au maximum) — c'est notre propre limite, dans notre propre code, sans rapport avec Enable Banking. Un écran qui demanderait les mouvements du mois et les **additionnerait dans le navigateur** afficherait, dès qu'un mois dépasse 100 lignes, un total calculé sur les 100 premières : **un chiffre parfaitement crédible et faux, sans aucun message**. Les 911 mouvements sur 14 mois font ~65 par mois — ça passerait tous les tests et casserait sur un mois chargé, une année entière, ou plusieurs comptes. C'est le mode de panne nommé au §1, mot pour mot. Le total, la fourchette des incertains et l'exclusion des `virement_intercompte` sont donc calculés par **une requête d'agrégation**, jamais par une addition dans la page ; monter le plafond ne serait qu'un report.

**Critère** — sur un mois donné, le total exclut les virements internes et affiche séparément les incertains. *Recette* : lire un mois et retrouver le chiffre à la main sur trois mouvements. *Préserve* : sans `from`/`to`, la réponse de `GET /transactions` est **identique à aujourd'hui** — mêmes bornes, même tri — et un test le prouve ; `GET /balance` n'exclut toujours rien, les deux jambes d'un virement interne s'y annulant.

#### T48 — Le compte Espèces

**Un retrait n'est pas une dépense** — l'argent quitte le compte mais reste à toi. Décision de Lamoms : un **compte virtuel Espèces**. Le retrait devient un virement vers lui, donc `virement_intercompte`, donc **exclu des dépenses par le mécanisme existant**, sans règle spéciale. La dépense réelle est saisie quand tu payes en liquide.

**La jambe miroir est créée par l'application, pas saisie.** `qualifyTransactions` apparie deux jambes existantes ; un retrait n'en a qu'une. L'application voit un `retrait_especes`, écrit le crédit correspondant sur le compte Espèces, et la paire se qualifie seule. Le montant et la date sont déjà là — les faire saisir serait absurde.

**La saisie manuelle revient ici, et c'est l'exception que la règle appelait.** Elle avait été sortie du produit — « un chiffre tapé sans donnée derrière ». L'espèce est le seul cas où **aucun canal n'existe** : ni API, ni relevé. Elle **sauve `POST /transactions`**, l'une des trois méthodes jamais appelées, que le critère 5 condamnait à la suppression.

**Le solde Espèces entre dans le total agrégé, et il porte sa réserve.** C'est de l'argent que tu as ; le laisser dehors ferait un total qui sous-estime. Mais c'est **le seul chiffre faux par construction** — juste tant que tu saisis tout. La ligne dit d'où il vient : *« Espèces — 40 € · dernier ajout il y a 12 jours »*. Une fraîcheur ancienne sur ce compte veut dire « tu as oublié de saisir », et c'est le seul signal honnête possible.

**Le champ libellé de la saisie permet de noter où tu as payé** — gratuit, et ça couvre l'essentiel du besoin de preuve. **Le ticket de caisse vient plus tard**, et il ira **dans la base** : c'est le seul contenu du projet à la fois irremplaçable — un relevé se retélécharge, un ticket non — et absent de toute autre source. Avec une limite de taille par ticket, sinon la sauvegarde quotidienne enfle sans qu'on s'en aperçoive.

**Critère** — retirer 50 € au distributeur, importer le relevé : le retrait n'apparaît pas dans les dépenses, le compte Espèces monte de 50 €, et saisir un achat de 12 € le fait descendre et entre dans les dépenses. *Recette* : c'est le critère, sur un retrait réel. *Préserve* : `GET /balance` continue de sommer tous les comptes ; aucun compte existant n'est modifié ; l'oracle rejoue à l'identique.

#### T46 — Les récurrences déclarées

**C'est l'utilisateur qui crée la récurrence ; l'application ne fait que détecter ses occurrences.** Tu désignes un mouvement réel — *« celui-ci revient tous les mois »* — et l'application **apprend sa fenêtre** à mesure qu'elle en voit d'autres, puis l'affiche : *« vu le 29, le 30, le 7 — j'attends entre le 27 et le 8 »*.

**La fenêtre est apprise, jamais déclarée**, et une tolérance fixe ne marche pas : le virement du CROUS tombe le 29, 30 ou 31 du mois précédent, **parfois le 7** — neuf jours à cheval sur un changement de mois. Ce cas ne se validera qu'en usage réel, et c'est assumé.

**Elle se déclenche depuis T47** : tu désignes un mouvement récurrent **là où tu le vois**, dans la vue des dépenses. Pas un écran de plus.

Elle alimente T41 : sans récurrences, « me met en danger » n'a rien à soustraire.

---

### Lot D — Les agents Hermès spécialisés

*Ils sont au périmètre, leurs tâches ne s'écrivent qu'après T37. Aucun des deux ne remplace le parcours : R1 dit qu'une livraison est prouvée par un usage, et un agent n'est pas un usage.*

#### T41 — Le gestionnaire financier *(obligatoire — il porte le §1)*

**Il se coupe en deux, et c'est ce qui le rend tenable :**

1. **Le calcul du danger est déterministe et ne touche aucun modèle.** Solde disponible, moins les échéances récurrentes de T46 d'ici la fin du mois. **Cette moitié tourne sur le Raspberry Pi** — si le calcul vivait dans le modèle, la promesse du §1 mourrait au portage.
2. **Le modèle ne juge que le résidu** : les libellés ambigus que le moteur et les tiers confirmés n'ont pas su trancher. Du texte court, une poignée par mois. La latence est sans importance.

**Il propose, il n'écrit jamais.** L'écriture reste `PATCH /transactions/:id` et la confirmation d'une règle — un geste humain. Si Hermès est absent ou échoue, l'application reste **entièrement fonctionnelle**, et un test le prouve.

**Le provider est tranché : modèle local.** Aucun libellé ne quitte la machine — ce qui **referme T26 C1**, en suspens depuis le 2026-08-09. T41 crée **son propre profil** ; `hermesgestio` tourne sur `nous` en cloud et n'est pas réutilisé.

**Ce que la machine porte, mesuré le 2026-08-12** : Ryzen 7 7730U, 8 cœurs, iGPU inexploitable — **CPU seul** — et **WSL ne voit que 7,4 Go, 5,5 Go disponibles**. Budget : **un 4B quantisé en Q4**, ~2,5 à 3 Go. Gemma 3 4B y entre ; un 12B non.

**Trois faits à établir avant la première ligne** : ollama **n'est pas installé** ; l'allocation WSL **se relève** par `.wslconfig` si l'hôte a 16 Go ; et le modèle se choisit **sur pièce**, sur une vingtaine de libellés réels — celui qui tranche juste, pas celui qui a la meilleure fiche.

*Préserve* : les 606 décisions et l'oracle ne dépendent d'aucun appel à Hermès.

#### T40 — L'agent qui éprouve *(conditionnel — seulement si T37 se bloque une troisième fois)*

Un profil Hermès dédié qui exerce les 18 méthodes en une passe. **Deux contraintes dures** : il travaille sur une **copie** de la base fabriquée par `sqlcipher_export()`, jamais sur `data/gestio.db` ; et **il ne lit jamais un libellé — il compte**, ce qui rend la question du provider sans objet pour lui.

**Pourquoi conditionnel** : il fait gagner du temps sur le parcours, pas de la certitude. Il devient justifié le jour où le temps de Lamoms est la ressource rare — c'est-à-dire à un troisième parcours bloqué.

---

### Lot E — Le nettoyage

#### T32 — Nettoyage T27 *(#39 — à tout moment, aucune dépendance)*

F1 `excludedProducts` résiduel, F4 variable de boucle nommée `number`.

**F2 et F3 sont tranchés : le code fait foi, le plan se corrige.** Tolérance d'appariement à **4 jours**, échelle de scores **120/110/100/90/80/60/50** — ce sont les documents qui s'alignent. **L'oracle n'est pas rejoué.**

*Préserve* : cette tâche ne touche que du texte. Un diff qui contient `src/qualification.ts` est hors périmètre.

## 7. Ordre

```
Lot 0   relevé BP du 2026-08-08  +  rotation de la clé     ← humain, avant le 2026-10-06
   │
Lot A   T31 ▸ T33 ▸ T43a ▸ T43b ▸ D5 ▸ T45a ▸ T45b ▸ T34 ▸ T44 ▸ T35 ▸ T36 ▸ T38 ▸ T42
   │     treize tâches en série — toutes touchent server.ts et main.jsx
   │     chacune se termine par sa recette, qui remonte le protocole jusqu'à son étape
   │     la logique va dans ui-logic.ts, qui est testé ; main.jsx ne garde que l'affichage
   ↓
Lot B   T37 — mise en service, étapes 0 à 12, un seul parcours
   ↓
Lot C   T39 tiers confirmés ▸ T47 dépenses + période ▸ T48 compte Espèces ▸ T46 récurrences
   │     les tiers d'abord (ils réduisent la fourchette d'incertains), les dépenses ensuite
   │     (elles rendent les 606 décisions enfin visibles), les récurrences se désignent dedans
   ↓
Lot D   T41 gestionnaire (obligatoire)  ·  T40 agent qui éprouve (si T37 bloque)

Lot E   T32 — à tout moment
```

**T31 en premier** : un libellé faux fausse tout ce qui se mesure ensuite. **T33 avant T43a/T43b** : la correspondance par IBAN rend l'association possible sans liste — et sans mémoire. **T43a avant T43b** : le parseur doit rendre ses comptes avant que l'import sache les rapprocher. **D5 avant T45a** : l'onboarding la consomme, elle ne dépend de rien. **T45a/T45b après T43b** : l'onboarding détecte les comptes dans les relevés, ce que T43a rend possible. **T42 en dernier du lot** : la couverture n'a de sens qu'une fois les comptes, les IBAN et l'oracle en place.

**Deux inversions corrigées le 2026-08-13, et elles étaient bloquantes** — c'est le même défaut deux fois : une tâche placée avant l'outil dont sa preuve dépend.
- **T44 avant T35** : T35 écrit une ligne d'oracle ; dans l'ordre précédent, la table n'existait pas encore. Le critère « le décompte augmente d'un » part avec T35, qui seule possède le geste.
- **T36 avant T38** : le critère et la recette de T38 sont une **restauration**, et `restore.sh` est livré par T36. Le critère « l'oracle ressort intact d'une restauration » quitte T44 pour T36, qui seule possède l'outil.

**Et le corpus complet entre à T43b, pas plus tard** : c'est la matière première de T44 — 911 mouvements dans l'oracle contre 609 en base, parce que l'import complet n'a jamais réussi.

**Un geste humain s'intercale, et aucune tâche ne bouge** *(décision 36, 2026-08-13)* :

```
… ▸ T45a ▸ T45b ▸ [ vidage de la base réelle + rotation de la clé + 3 ré-authentifications
   │              corpus réimporté (25 fichiers) + Revolut resynchronisé ]  ← humain, une fois
   ↓
T34 ▸ T44 ▸ …
```

C'est le seul moment où la base repart de zéro, et il est ici parce que c'est ici que naît l'outil qui la reconstruit. Les trois authentifications fortes sont dues de toute façon — la rotation de clé du lot 0 invalide les sessions. Ce qui se jette : 9 comptes homonymes sans IBAN. Ce qui se gagne : la matière de T44 dans un état propre, et `display_name` posé par l'onboarding au lieu d'être tapé à la main.

## 8. Critères d'acceptation du PRD entier

Chaque critère dit aussi **ce qu'il préserve**, sans quoi une régression le satisfait.

1. **Ce que T37 prouve du §1** : chaque compte déclaré comparé un par un, aucun terminal ouvert ; le lot du mois importé en une fois sur le PC ; la couverture sans trou. **Aucun critère ne nomme un nombre de comptes.** *Préserve* : les huit soldes justes sur neuf du 2026-08-04 ne régressent pas.
2. **Ce que T37 ne peut pas prouver, et qui attend T41** : *« si une dépense me met en danger »*. Et *« sans ouvrir une application bancaire »* ne se prouve pas en une fois — le parcours exige précisément de l'ouvrir ; l'exigence est tenue après **trois mois consécutifs sans écart**.
3. **Chaque tâche porte sa recette (R4), et cette recette remonte le protocole jusqu'à son étape.** Un verdict qui ne la cite pas n'est pas un verdict.
4. **Trois compteurs, trois noms — le mot « oracle » cessait d'en désigner un seul** *(refondu le 2026-08-13, décision 32)*. Confondus, ils produisent le mode de panne du §1 : un total qui a l'air juste.
   - **Le rejeu** — 191 paires, **606 décisions**, rejouées en mémoire par `qualification-oracle.test.ts` dans une base neuve, chemin CSV compris. Invariant, sur tout le PRD, et c'est la porte dure : ROUGE si la source manque, ROUGE si le test se saute. C'est ce que vise chaque *Préserve* qui dit « l'oracle rejoue à l'identique ».
   - **L'attachement** — **380 sur 380** strict à T44, plus le taux Revolut mesuré.
   - **Le corps** — le décompte de lignes dans la table d'oracle. Il démarre à l'attachement et **monte d'un à chaque décision tranchée** (T35). Plancher : il grandit, il ne rétrécit jamais.
5. **Les 18 méthodes ont un état connu**, chacune avec le geste qui l'a exercée. Une méthode sans appelant est branchée ou supprimée. *(`POST /transactions` n'est plus candidate à la suppression : T48 lui donne son usage, la saisie des dépenses en espèces.)*
6. **Les 606 décisions ont un consommateur visible** — T47. Une qualification qui ne change rien à l'écran n'est pas livrée.
7. **Aucun nom d'établissement, de compte ou de produit ne sert de *donnée* dans `web/` ni dans le contrat de `src/server.ts`** — ni valeur par défaut, ni liste, ni clé. `git grep` le prouve. *(Reformulé le 2026-08-13 : la version précédente était **infaisable**. Elle exigeait qu'aucun nom n'apparaisse, alors que le §9 garde délibérément `accountTypes = ["BANK","LIVRET_A","OTHER"]` et que le menu de type affiche « Livret A ». Un critère qu'aucune livraison ne peut satisfaire aurait laissé Codex casser un sélecteur hors périmètre pour l'atteindre.)*
   **La distinction qui fait foi** : « Livret A » comme **libellé d'un type technique** ne désigne aucun compte réel — c'est du vocabulaire, il reste. « La Banque Postale » **pré-remplie dans un champ** désigne la banque de l'utilisateur, dans un dépôt public — elle part.
   **Les trois cas de `web/src/main.jsx` ont chacun leur propriétaire** : `pdfAccountKeys` → **T43b** ; le `defaultValue` du formulaire de connexion → **T45a** ; le libellé du sélecteur de type → **il reste**, et ce critère le dit.
8. **Sur tout le PRD** : `npm test` vert avec un décompte non nul **et zéro skip** — jamais un vert nu, jamais un vert amputé — lint, typecheck et build à 0. *(Renforcé le 2026-08-13 : mesuré le même jour, le workspace maître sortait `40 tests · 39 pass · 1 skipped`, le test sauté étant précisément le rejeu des 606 décisions. Un décompte non nul ne suffit pas ; T31 livre la correction.)*
9. **Les 6 problèmes ouverts sont cochés ou explicitement laissés ouverts avec leur raison.**

**Le critère d'arrêt, sans lequel « le dernier PRD » n'est qu'un titre** : n'entre dans ce PRD que le constat de T37 qui **rend fausse l'une des deux phrases du §1**. Tout le reste va au registre.

## 9. Ce qui n'entre pas

- **Les tâches du lot C et D écrites avant T37.** Ce qui est au §6 est leur cadrage, pas leur plan.
- **Les 14 observations de `ux-observations.md`**, gravité faible — **sauf une, entrée le 2026-08-13**. T25-3 (« le sélecteur de fichiers masque par défaut les relevés La Banque Postale sans extension ») était classée *faible* et réputée jamais rencontrée ; elle l'a été deux fois, sans être reconnue, et elle est désormais sur le chemin critique : le champ porte `accept="application/pdf,.pdf"` et les 13 relevés LBP n'ont **aucune extension**. Elle entre dans **T43b**. Les treize autres restent dehors. T21 C2 est absorbée par T40 ; T26 C1 est refermée par le modèle local.
  *La leçon dépasse le cas* : une observation classée faible parce qu'« aucune rencontrée en usage réel » l'a été dans un projet qui n'a jamais dépassé l'étape 2. L'absence d'usage ne prouve pas l'absence de défaut — c'est R1 retourné contre le registre lui-même.
- **La sauvegarde hors machine** (C10) et **le portage Raspberry Pi** — post-MVP ; la portabilité est préservée par construction.
- **L'unification des deux mécanismes de `fingerprint`** (C11) — documentée, pas corrigée : elle coûterait le recalcul de 609 lignes pour aucun gain, l'oracle s'accrochant à la ligne de transaction.
- **`accountTypes = ["BANK","LIVRET_A","OTHER"]` et `IBAN_LENGTHS = { DE, FR }`** — résidus de la même famille, laissés faute d'un problème réel qui les nomme. À rouvrir si T37 croise un compte étranger.

## 10. Risques

- **Le lot 0 n'est pas fait à temps.** Seul risque irréversible : le 2026-10-06, le trou est définitif.
- **Treize tâches avant de mesurer.** C'est le motif que R1 condamne, et Lamoms l'assume : la parade est R4, dont la recette remonte la chaîne — un défaut de jonction coûte une tâche, pas treize. *(Le découpage du 2026-08-13 en ajoute trois : trois recettes de plus, six minutes, contre trois tâches qui demandaient cinq travaux simultanés.)*
- **T37 se bloque encore.** Ce serait le troisième ; c'est le cas qui fait revenir T40.
- **Le geste du 8 ne se prend pas.** Un rituel mensuel dépend d'une discipline humaine ; T42 le rend visible, il ne le rend pas automatique. Assumé, à rouvrir si le parcours montre que voir ne suffit pas.
- **T38 déplace la connaissance et casse la qualification en silence.** Mitigé par le rejeu de l'oracle et le décompte par `nature` avant/après sur la base réelle.
- **Le modèle local ne suffit pas.** Il ne juge que le résidu et le calcul du danger ne dépend pas de lui — mais si un 4B se révèle trop faible sur des libellés français, la moitié « proposition » de T41 tombe, sans emporter la moitié qui compte.

## 11. Les décisions de Lamoms

**Rendues le 2026-08-12, au terme de sept rounds :**

1. **La définition de « fini »** — §1, ratifiée, complétée du geste du 8 et du partage téléphone/PC.
2. **La réduction du carnet** — `.lamoms/contraintes.md` porte les 17 entrées qui servent encore.
3. **F2 et F3** — le code fait foi, le plan se corrige. L'oracle n'est pas rejoué.
4. **Par où un compte entre** — API, sinon relevés. La saisie manuelle d'un solde sort du produit. Aucun nom dans le code.
5. **T41 est obligatoire**, le PRD ne se clôt pas sur T37.
6. **R4** — une recette par tâche, qui remonte le protocole.
7. **Deux tables, découpage B** — une vérité s'accroche à la ligne de transaction ; présence dans l'oracle = décision ; un mouvement qui porte une vérité ne se supprime pas ; l'oracle ne s'affiche pas.
8. **Le provider — modèle local**, 4B quantisé. Referme T26 C1.
9. **Un seul parcours**, la mesure se faisant à chaque tâche.
10. **Les cas limites se documentent au lieu de se résoudre** — et le système demande au lieu de deviner.
11. **Les dépenses ont enfin un écran** (T47), dans `quoi` et pas dans une quatrième page. Définies **en négatif** — toutes les sorties moins les virements internes — parce que la plupart des achats n'ont aucune nature. Les incertains s'affichent en **fourchette**, jamais fondus dans le total.
12. **Un retrait n'est pas une dépense** : il devient un virement vers un **compte Espèces** virtuel, dont l'application crée la jambe miroir automatiquement. **La saisie manuelle revient pour ce seul compte** — c'est le seul cas où aucun canal n'existe — et elle sauve `POST /transactions`. Le solde Espèces entre dans le total, en portant sa réserve : c'est le seul chiffre faux par construction.
13. **Les tickets de caisse viendront dans la base**, plus tard, avec une limite de taille. C'est le seul contenu à la fois irremplaçable et absent de toute autre source — un relevé se retélécharge, un ticket non.
14. **Le projet sortira de `/mnt/c` vers le système de fichiers WSL, après T44** — quand les chemins en dur auront été nettoyés. Ça règle `chmod` inopérant et la corruption asynchrone de `node_modules` du 2026-08-04. Avant T44, c'est une journée de chemins cassés au milieu du lot A.

**Établi le 2026-08-12, et ce n'est pas une décision mais un fait** : le disque est chiffré — BitLocker 2.0, XTS-AES 128, protection activée, TPM + mot de passe numérique. **Le chiffrement par dossier n'existe pas sur Windows 11 Famille** (EFS et BitLocker gérable sont des fonctions Pro), et il n'apporterait rien de plus contre le seul scénario couvert : la machine perdue ou volée.

**Rendues le 2026-08-13, au terme de la revue d'exécutabilité du PRD** *(session `/grilling`, cinq rounds, aucune des quatorze décisions ci-dessus rouverte)* :

15. **Un worktree sans `.env` n'est pas prêt à coder.** Copilot y pose un lien symbolique à la création. Mesuré : sans lui, le test qui rejoue les 606 décisions **se saute en silence** et `npm test` ressort vert — la panne que R1 condamne, dans l'outillage lui-même. La base reste locale au worktree (`GESTIO_DB_PATH` absent ⇒ chemin relatif), donc les données réelles ne sont jamais touchées.
16. **`AGENTS.md` est corrigé avant T31.** Il contredisait le PRD sur trois points — Livret A « par saisie manuelle », « saisie manuelle fallback », « import CSV » — et c'est le premier document que Codex lit. *Exception accordée par Lamoms au Planificateur pour cette correction.*
17. **T43 se coupe en deux, et la correspondance ne se mémorise pas.** Le parseur reconnaît déjà l'établissement seul ; l'IBAN identifie le compte dans cet établissement ; le rapprochement se **recalcule** à chaque import. Aucune table, aucune colonne. Un compte non rapproché est **proposé pré-rempli**.
18. **Le modèle : un établissement, des comptes, un IBAN propre par compte.** Assertion de Lamoms — mais **aucun index unique** tant qu'elle n'est pas observée ; la recette de T33 la vérifie.
19. **T45 se coupe en deux et D5 en sort.** **La déclaration ne s'enregistre pas** : ce qui s'enregistre, ce sont les comptes trouvés. L'application ne prétend jamais savoir ce qui manque — c'est l'utilisateur qui le dit. L'onboarding se déclenche **tant que les tables établissements/comptes sont vides**, et **l'ajout ordinaire reste accessible en permanence** : c'est par là qu'un compte arrivé après coup entre. *(Sumeria entre normalement par l'onboarding ; l'ajouter après sert à éprouver l'application.)*
20. **T44 passe devant T35, et T36 devant T38.** Deux fois le même défaut : une tâche placée avant l'outil dont sa preuve dépend. Les critères concernés changent de tâche.
21. **T43b importe tout le corpus.** C'est la matière première de T44 : 911 mouvements dans l'oracle contre 609 en base, l'import complet n'ayant jamais réussi.
22. **T44 recopie le champ `confidence` existant** — quatre niveaux, 336/46/127/97 — au lieu de reconstruire les « 386 », dont 4 ne vivent que dans une phrase en prose. Le « 386 contre le reste » devient un décompte qu'on lit.
23. **Le drapeau d'échappement de T44 est supprimé.** Ou le test tourne, ou la suite est rouge. C'était la seule ligne du PRD permettant de refabriquer un vert vide.
24. **Le critère 7 est reformulé** — il vise les noms qui **désignent les comptes de l'utilisateur**, pas le vocabulaire technique. La version précédente était infaisable.
25. **Règle du lot A : la logique va dans `ui-logic.ts`, qui est testé** ; `main.jsx` ne garde que l'affichage. Six tâches réécrivent le seul fichier sans test.
26. **Trois recettes réécrites** — T31, T33, T38 — parce qu'elles s'arrêtaient à l'écran livré au lieu de remonter la chaîne, ce que R4 exige précisément.
27. **T47 : le total des dépenses se calcule en SQL.** `GET /transactions` rend 100 lignes par appel ; une addition dans le navigateur produirait un total crédible et faux dès qu'un mois dépasse 100 mouvements.

**Rendues le 2026-08-13, au terme de la revue de confrontation aux annexes et au corpus réel** *(session `/grilling`, cinq rounds, sept mesures neuves ; aucune des vingt-sept décisions ci-dessus rouverte, cinq amendées)* :

28. **Le modèle : l'IBAN distingue là où il existe, le nom établi à l'onboarding partout ailleurs.** *Amende la 18.* L'assertion « un IBAN propre par compte » attendait son contre-exemple ; il était sur le disque. Les trois segments Trade Republic partagent un IBAN, les trois pockets Revolut n'en ont aucun. Toujours aucun index unique — mais un partage est désormais **silencieux et attendu**, et ce qui se signale est un IBAN qui **change**.
29. **`npm test` charge `.env`, et « 0 skip » devient un critère du PRD.** Mesuré : le workspace maître lui-même sortait 39 pass / 1 skip, le test sauté étant le rejeu des 606 décisions. La décision 15 (lien symbolique) reste nécessaire et ne suffisait pas. Livrée par T31, avant tout le reste.
30. **Le vocabulaire des natures s'unifie dans l'artefact d'oracle — le code fait foi**, comme pour F2/F3. Pas de couche de traduction. Garde : le test échoue sur toute nature hors `transactionNatures`.
31. **T44 : 380 sur 380 strict, l'attachement Revolut se mesure.** 226 des 606 décisions viennent d'un CSV que le produit n'implémente pas ; le CSV reste dans la preuve, jamais dans le produit. *Amende la 21.*
32. **Le « 606 » se décompose en trois compteurs nommés** — le rejeu, l'attachement, le corps. *Amende le critère 4 du §8.*
33. **Confirmer une correspondance écrit le nom imprimé sur le compte** (`display_name`, si vide, jamais par écrasement). Toujours **aucune table de correspondance** : la décision 17 tient à la lettre.
34. **L'identité arithmétique du relevé devient un garde-fou permanent** — `ouverture + Σ = clôture`, plancher mesuré à 25 segments sur 25. Portée par T43a.
35. **Le rejeu depuis zéro est automatique ; la recette reste humaine et courte.** Les deux, pas l'un ou l'autre : une recette de deux minutes ne voit ni un test qui se saute ni un tiers d'oracle sans canal. *Précise R1 et R4.*
36. **La base réelle se vide une fois, à T45a**, dans le même geste que la rotation de la clé et les trois ré-authentifications. Corpus réimporté et Revolut resynchronisé avant T44. Aucune tâche ne change de place.
37. **Lot 0 : les dates sont recalculées sur le corpus réel.** Le relevé qui manque est celui émis le 2026-08-08, disponible depuis cinq jours ; l'échéance dure est le 2026-10-06, pas le 2026-09-06. La date précédente venait d'un corpus cru arrêté un mois plus tôt, et exigeait un relevé d'août la veille du jour où la banque l'émet.

**Plus aucune décision ouverte.** Ce qui reste à établir relève du fait : le chemin de Sumeria, le sort de `GET /accounts`, le modèle local exact, et le taux d'attachement Revolut — tous établis par le parcours ou par la mesure. *(L'assertion « un IBAN par compte » a quitté cette liste : elle est établie, et fausse.)*
