# PRD final — Finir Gestio

**PRD actif de Gestio. Émis le 2026-08-12 par le Planificateur, arrêté avec Lamoms au terme de sept rounds de cadrage.**
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

Le PDF est la seule mémoire longue : le plancher de l'API avance d'un jour par jour, et une transaction sortie de la fenêtre n'y rentre jamais. **P35 cesse donc d'être une échéance à rattraper une fois — le 2026-09-06 — pour devenir le rituel qui empêche tous les trous suivants.**

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
- La suite est verte : 40 tests, 40 pass, 0 skip avec `GESTIO_PERSONAL_NAMES` ; lint, typecheck, build à 0.

## 6. Les lots

### Lot 0 — Deux actions humaines, datées *(ce ne sont pas des tâches)*

**Télécharger les relevés La Banque Postale de juin, juillet et août 2026 avant le 2026-09-06.** Le corpus s'arrête à `releve_CCP0984209Z024_20260708`. Passé cette date, le trou est **définitif** et aucun code ne le répare. **Il reste 25 jours.** Rien d'autre dans ce PRD n'a de valeur si ce geste n'est pas fait.

**Faire tourner la clé Enable Banking.** Le 2026-08-11, un diagnostic a fait apparaître des fragments de clé PEM dans une sortie de session. Aucun secret n'est dans un fichier versionné, mais la clé donne un accès en lecture aux comptes réels jusqu'au 2027-01-01. Quelques minutes, avant la première opération bancaire du parcours.

**Reporté par Lamoms le 2026-08-12, après la conception de l'application — important, pas prioritaire : vérifier que la clé de récupération BitLocker est dans le compte Microsoft.** Mesuré le même jour : le disque est chiffré — BitLocker 2.0, XTS-AES 128, protection activée, 100 % — avec **TPM + mot de passe numérique** pour protecteurs. Tes relevés en clair et ton `.env` sont donc couverts au repos, malgré des permissions inopérantes sur `/mnt/c`. **Mais `backups/` vit sur ce même disque** : c'est C10 aggravé. Le jour où le TPM change d'état — mise à jour du BIOS, carte mère remplacée — Windows réclame la clé à 48 chiffres, et sans elle **la base et ses trente jours de sauvegardes partent ensemble**. C'est la seule chose qui rend ce chiffrement réversible.

> **Ce que ce chiffrement protège, et ce qu'il ne protège pas.** TPM seul signifie que le disque se déverrouille **tout seul au démarrage**. La couverture est donc : disque sorti de la machine, PC revendu ou perdu. Contre quelqu'un qui ouvre le capot, **la seule barrière est le mot de passe Windows**. Aucun chiffrement de dossier n'y changerait rien — et sur Windows 11 Famille, EFS et BitLocker gérable sont indisponibles de toute façon.

---

### Lot A — Les portes

*Dix tâches, en série : elles touchent toutes `src/server.ts` et `web/src/main.jsx`. Chacune se termine par sa recette (R4), qui remonte le protocole jusqu'à son étape.*

#### T31 — Les corrections T27, plus le libellé qui déborde *(#38 — étapes 7 et 8)*

M1 (un produit Trade Republic inconnu ne fait plus échouer l'import entier), M2 (l'IBAN du PEA vient de son segment), M3 (rattrapage des transactions Nickel importées avant T27, `qualification_label` NULL), F5, F6 — **plus le débordement de libellé mesuré le 2026-08-12** : le parseur colle à un mouvement du texte de la ligne suivante, l'un avalant `TOTAL DES OPÉRATIONS`.

**Elle passe en premier** parce qu'un libellé faux fausse tout ce qui se mesure ensuite — la qualification, les tiers, ta méthode pour les vieilles transactions.

**Critère** — sur le corpus, aucun libellé PDF ne contient `TOTAL DES OPÉRATIONS`, et les 16 mouvements appariés de juin passent à **16/16 identiques après normalisation** (contre 13/16 aujourd'hui). *Recette* : importer le relevé de juin et lire trois libellés à l'écran. *Préserve* : aucune transaction supprimée, aucun `fingerprint` modifié, l'oracle rejoue à l'identique.

#### T33 — L'IBAN entre tout seul *(prérequis de T43)*

**Mesuré** : les 9 comptes portent `iban IS NULL`, alors que l'IBAN est dans `details.account_id.iban` — réponse déjà reçue, dont seul le nom est lu — et que l'import PDF l'écrit déjà depuis T27, postérieur au dernier import réel.

**Périmètre** : `src/enable-banking.ts` lit `account_id.iban` ; la synchro le pose comme l'import, sans jamais écraser. `src/server.ts` — `PATCH /accounts/:id` `{ name?, iban?, displayName? }`, IBAN normalisé par `normalizeIban`, **unicité admise**, divergence signalée et non écrasée. `web/src/main.jsx` — un `display_name` distingue les comptes ; le nom de la banque reste affiché en second. **Ne pas toucher** le sélecteur d'import : il est réécrit une seule fois, par T43.

**Critère** — après une synchro et un ré-import du corpus, **chaque compte atteignable porte son IBAN, sans qu'on ait rien tapé**. Un IBAN divergent est affiché, pas appliqué. *Recette* : synchroniser, ouvrir la liste des comptes, distinguer les quatre Revolut. *Préserve* : la synchro n'écrase toujours pas `name` ; aucun `accountId` ne change ; l'oracle rejoue à l'identique.

#### T43 — Le relevé apporte ses comptes ; le code n'en connaît aucun *(étape 7)*

**Mesuré** : `pdfAccountKeys` est une liste de **sept clés en dur** dans `web/src/main.jsx`, dupliquée du type backend sans source unique. `accountKey` est un matcheur en dur et **saute en silence** ce qu'il ne reconnaît pas. `parseBanquePostale` **exige les trois comptes** : un quatrième produit LBP serait ignoré sans un mot, et fermer le Livret Jeune ferait échouer tous les imports.

**Ce que le parseur sait déjà et qu'on jette** : `accountName` extrait le **nom imprimé sur le relevé** (la table en dur n'est qu'un repli) et `ibanFromLines` lit l'IBAN de chaque segment. **Cette tâche n'invente rien : elle arrête de jeter.**

**Périmètre** : `src/pdf-import.ts` — le relevé rend ses segments tels qu'il les a trouvés, identifiés par IBAN sinon par libellé imprimé ; `accountKey` et l'exigence des trois disparaissent ; **un segment non reconnu est compté et nommé**, jamais sauté. `src/server.ts` — import en deux temps, détecter puis associer ; `PdfAccountKey` sort du contrat public ; **la correspondance est mémorisée** d'un mois sur l'autre. `web/src/main.jsx` — `pdfAccountKeys` disparaît. **Ne pas toucher** : la reconnaissance de format et la lecture de mise en page — c'est la limite assumée.

**Critères** — (1) un relevé LBP amputé d'un de ses comptes s'importe quand même ; (2) un segment inconnu est nommé dans le compte rendu ; (3) `git grep` ne rend aucun nom de compte ni d'établissement dans `web/` ni dans le contrat serveur ; (4) le deuxième import mensuel ne redemande **aucune** correspondance. *Recette* : importer le lot du mois avec une seule correspondance — étape 7. *Préserve* : les trois formats rendent **exactement les mêmes chiffres** sur le corpus, cités ligne à ligne ; le refus sur correspondance ambiguë et l'atomicité SQL ne bougent pas.

> **Attention mesurée** : l'IBAN n'est pas toujours sur le relevé. Sur 12 relevés BP, l'IBAN du CCP apparaît 12 fois, celui du Livret A 11 fois, **celui du Livret Jeune 2 fois** — il n'est lu que dans la section d'opérations, absente quand le compte n'a pas bougé. Le compte, lui, est toujours dans le bloc de situation. La correspondance par libellé imprimé n'est donc pas un repli : c'est le chemin principal des comptes peu actifs.

#### T45 — L'onboarding *(étapes 0 à 2)*

**Cinq temps. L'utilisateur n'écrit qu'au premier et au dernier.**

1. *« Chez quelles banques as-tu des comptes, et combien chez chacune ? »* — le nom et un nombre. Pas une liste de comptes à maintenir : un **compteur de complétude**.
2. L'application teste chaque banque contre le catalogue Enable Banking et annonce : **disponible par API, ou non**.
3. Pour les disponibles : connexion, puis elle dit ce qu'elle a trouvé **et ce qui manque** — *« La Banque Postale : 1 compte sur les 3 annoncés. Les livrets ne passent pas par l'API. »*
4. Pour le reste : *« donne-moi tes relevés »*, et elle en **détecte** les comptes, leurs noms, leurs IBAN, leurs soldes.
5. Récapitulatif, tu **confirmes**. Ce qui manque encore est listé **une fois** — et plus jamais, sauf blocage réel.

**Elle emporte D5** : `GET /balance` cesse d'écraser l'inconnu en `0`. Un compte déclaré sans données n'affiche pas `0,00 €` dans un total crédible ; `unknownBalanceCount` est déjà rendu par la route.

**Aucun outil de design, aucune dépendance, aucune CSS neuve.** L'onboarding est une suite de questions, pas un écran à dessiner : il réutilise les styles existants. Une interface générée remplacerait `main.jsx`, le seul fichier qui porte tous les gestes et qui n'a aucun test.

**Critère** — partir d'une **base vide** et arriver à voir ses comptes avec leurs soldes, sans terminal. *Recette* : c'est le critère — étapes 0 à 2, sur une copie. *Préserve* : une base existante n'est pas réinitialisée ; les 9 comptes actuels survivent à la livraison.

#### T34 — Les banques connectées se voient, et chacune se relance *(étapes 3 à 6, et le mobile)*

**Mesuré** : trois connexions `AUTHORIZED` en base et l'interface ne les lit jamais. `SyncButton` dépend d'une clé `localStorage` **unique** : une deuxième banque écrase la première, et sur le téléphone la clé n'existe pas, donc **le mobile est en lecture seule sans que rien ne le dise**. `recordBankError` écrase toute erreur non typée en `"SYNC_FAILED"` — un code sans cause, en base depuis le 2026-08-04.

**Périmètre** : `src/server.ts` — `GET /enable-banking/connections` (les données existent, `status/:id` les rend une par une) ; `recordBankError` enregistre la cause réelle. `web/src/main.jsx` — une ligne par connexion, son statut, sa validité de consentement, sa dernière synchro, son erreur, son propre bouton ; `localStorage` cesse d'être la source de vérité.

**Elle prévient avant l'échéance de consentement, pas après.** Mesuré dans le catalogue complet : `maximum_consent_validity` vaut 180 jours pour **2611 banques sur 2632**, et **90 jours pour 19 — toutes des instances de Trade Republic**. Ta connexion TR est donc à re-authentifier **quatre fois par an**, contre deux pour les autres, et le geste du 8 tombera dessus un mois sur trois : la synchro échouera pour consentement expiré au lieu d'une vraie panne. La route rend déjà `consentValidUntil` — il suffit de l'afficher en avance : *« Trade Republic — consentement expire dans 12 jours »*.

**Critère** — les trois connexions apparaissent sur le PC **et** sur le téléphone, relancer l'une n'affecte pas l'autre, et une échéance de consentement proche est annoncée avant d'être subie. *Recette* : connecter deux banques et synchroniser chacune séparément, depuis le téléphone — étapes 3 à 6. *Préserve* : `status/:id` et `sync/:id` gardent leur contrat, le callback ne change pas d'une ligne, aucun jeton n'apparaît dans un message ou un journal. **Hors périmètre** : établir une connexion depuis le téléphone (C4).

#### T35 — La qualification s'affiche, et elle se conteste *(étape 8)*

**Mesuré** : aucun `PUT`, aucun `PATCH` dans les 18 routes ; les 606 décisions n'ont **aucune méthode** qui permette d'en contester une. Et `requalifyTransactions` réécrit `nature` à chaque import — une correction manuelle serait écrasée au passage suivant.

**Périmètre** : `src/server.ts` — `PATCH /transactions/:id` `{ nature }`, validée contre `transactionNatures` ; trancher **écrit une ligne d'oracle** (T44), jamais une colonne sur `transactions`. `src/qualification.ts` — `requalifyTransactions` consulte l'oracle et n'écrase pas ce qui y figure. `web/src/main.jsx` — un écran de revue qui liste les `virement_a_verifier` et laisse trancher en un geste ; `transactionNatureLabel` existe déjà.

**Critère** — corriger une nature, réimporter le même relevé, relancer une synchro : **la correction survit**, et l'écran dit d'où vient chaque décision. *Recette* : contester une qualification et la voir survivre à un ré-import — étape 8. *Préserve* : toute transaction non tranchée continue d'être requalifiée ; `POST /transactions/resolve` et `DELETE /transactions/:id` gardent leur sémantique de doublon ; l'oracle rejoue à l'identique.

#### T44 — L'oracle entre dans la base, et il grandit *(couplée à T35)*

**Mesuré, et c'est sérieux** : l'oracle vit dans `~/Documents/releves-pdf/oracle/` — trois fichiers JSON **hors du dépôt, hors de la base chiffrée, hors de la sauvegarde** — atteints par un chemin **WSL en dur** (`join("/mnt/c/Users", process.env.USER)`). Et le test **se saute en silence** si le corpus ou `GESTIO_PERSONAL_NAMES` manquent. Sur le Raspberry Pi, `/mnt/c/Users/...` n'existe pas : **l'oracle disparaît sans un mot et les critères « rejoue à l'identique » deviennent vides.** C'est P47 et P52 par une troisième porte, dans la preuve la plus citée du projet.

**Périmètre** : `src/db.ts` — la table d'oracle, additive, chiffrée donc sauvegardée. Elle référence **la ligne de transaction**, jamais l'empreinte (C11). Elle porte deux types de faits — *confirmé par relevé* et *nature tranchée* — avec leur date et leur preuve. Le jeu de T27 y est **importé une fois** comme premier état. `src/server.ts` — `DELETE /transactions/:id` **refuse** un mouvement qui porte une vérité. `src/qualification-oracle.test.ts` — le chemin WSL disparaît, et le test **échoue au lieu de se sauter**, sauf drapeau explicite qui dit pourquoi.

**L'import du premier état conserve la distinction déjà mesurée.** `rapport_T27_consolidation.md` §10 découpe les 606 décisions **par la façon dont elles ont été prises** : **386 validables en bloc sans revue individuelle** — 168 paires certaines par IBAN ou miroir strict, 23 paires fortes, 2 ambiguïtés bijectives — et le reste, dont une dizaine de cas nommément listés et ~29 mouvements « à vérifier » sans contrepartie. **On importe avec cette distinction, pas à plat** : les 386 comme *établies par règle*, le reste comme *tranchées à la main*, avec la raison que le rapport donne déjà. Sans elle on perd l'information la plus précieuse du corpus — **quelle proportion de l'argent demande vraiment une attention humaine**, mesurée sur 911 mouvements et 14 mois.

**Critères** — (1) le décompte d'oracle augmente d'un après une décision tranchée ; (2) la suite devient **rouge** quand la source manque, prouvé en la retirant ; (3) une sauvegarde restaurée dans une base vide rend l'oracle intact ; (4) le premier état importé distingue les 386 établies par règle du reste. *Recette* : trancher une décision, lire le compteur, redémarrer, le relire. *Préserve* : le premier état importé rejoue **exactement** 191 paires et 606 décisions ; aucun libellé ni IBAN ne sort de la base.

#### T38 — La connaissance déclarée entre dans la base chiffrée *(P58)*

`GESTIO_PERSONAL_NAMES` est lue depuis `process.env` en un seul point et de nulle part ailleurs. `scripts/backup.sh` source `.env` pour la clé mais ne sauvegarde que la base : la variable n'est **ni chiffrée ni sauvegardée**. Restaurer sur le RPi rouvre P30 en silence. `application_secrets (name, value, updated_at)` existe déjà, chiffrée et sauvegardée — **on la réutilise, on ne crée pas de table.** `.env` devient une **amorce**, lue une fois si la base est vide.

**Elle emporte `INSTITUTION_ALIASES`** : `src/qualification.ts` porte en dur `"LA BANQUE POSTALE"`, `"NICKEL"`, `"REVOLUT"`, `"TRADE REPUBLIC"` et leurs alias. **Le nom des banques de l'utilisateur est dans le moteur de qualification.** Les établissements sont déjà en base ; un alias est de la connaissance déclarée.

**Critère** — restaurer la sauvegarde dans une base vide sur une autre machine : les noms sont là, la qualification n'est pas dégradée. *Recette* : restaurer sur une copie et lire un virement vers soi. *Préserve* : l'oracle rejoue à l'identique — un écart signifie qu'un alias s'est perdu, pas que la règle a changé ; aucun nom dans un fichier versionné ni dans un journal.

#### T36 — Restaurer, pas seulement sauvegarder *(étape 11)*

On sait relire une sauvegarde — 609 transactions le 2026-08-04. **On n'a jamais restauré.**

**Périmètre** : `scripts/restore.sh`, symétrique de `backup.sh` — `sqlcipher_export()` en sens inverse, **jamais `.backup`**, refus d'écraser une base existante sans confirmation. `package.json` — le script `lint` passe `bash -n` sur les scripts, ajouter le nouveau.

**Critère** — repartir d'une base vide, restaurer, retrouver le solde et le nombre de transactions attendus, chiffres cités. *Recette* : c'est le critère — étape 11. *Préserve* : `backup.sh` et la rotation à 30 jours ne changent pas.

#### T42 — Les trous se voient *(étape 12 — rend vérifiable le geste du 8)*

**Mesuré** : rien ne dit quel mois manque pour quel compte. Le corpus s'est arrêté au relevé du 2026-07-08 sans que l'application le signale — personne ne l'a vu avant que Copilot ne liste le dossier à la main.

**Périmètre** : `src/server.ts` — `GET /coverage`, **lecture seule**, dérivé de ce qui est déjà en base : par compte, premier et dernier mois portant une transaction, mois sans ligne entre les deux, `known_since`, et le décompte des mouvements **jamais confirmés par un relevé**. Aucune table, aucune colonne, aucune écriture. `web/src/main.jsx` — un bloc par compte.

> **Deux pièges, et ils sont la moitié de la tâche.**
> 1. **Un mois sans mouvement sur un Livret A est normal.** La vue distingue « pas de relevé importé » de « relevé importé, aucun mouvement ».
> 2. **Toutes les banques n'ont pas de relevé.** Revolut n'a aucun chemin PDF — l'API rend 3727 jours. Une vue qui attend un relevé par compte et par mois signalerait Revolut en trou **tous les mois**, à tort. La couverture se **déduit** de ce qui est observé : un établissement dont le plus vieux mouvement API est plus récent que son plus vieux relevé a besoin du PDF ; Revolut n'en aura jamais besoin, BP et Trade Republic toujours.
>
> Sans ces deux distinctions, la vue est pire que rien : elle apprend à ignorer un signal.

**Critère** — juillet 2026 apparaît manquant pour La Banque Postale tant que son relevé n'est pas importé, et cesse de l'être une fois importé. *Recette* : importer le lot du mois et voir la couverture se refermer. *Préserve* : `GET /balance` ne change pas d'un octet ; aucune écriture n'est introduite.

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
Lot 0   relevés BP juin→août  +  rotation de la clé        ← humain, avant le 2026-09-06
   │
Lot A   T31 ▸ T33 ▸ T43 ▸ T45 ▸ T34 ▸ T35 ▸ T44 ▸ T38 ▸ T36 ▸ T42
   │     en série — toutes touchent server.ts et main.jsx
   │     chacune se termine par sa recette, qui remonte le protocole jusqu'à son étape
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

**T31 en premier** : un libellé faux fausse tout ce qui se mesure ensuite. **T33 avant T43** : la correspondance par IBAN rend l'association possible sans liste. **T45 après T33 et T43** : l'onboarding les consomme. **T44 avec T35** : une décision tranchée doit avoir un endroit où aller. **T42 en dernier du lot** : la couverture n'a de sens qu'une fois les comptes, les IBAN et l'oracle en place.

## 8. Critères d'acceptation du PRD entier

Chaque critère dit aussi **ce qu'il préserve**, sans quoi une régression le satisfait.

1. **Ce que T37 prouve du §1** : chaque compte déclaré comparé un par un, aucun terminal ouvert ; le lot du mois importé en une fois sur le PC ; la couverture sans trou. **Aucun critère ne nomme un nombre de comptes.** *Préserve* : les huit soldes justes sur neuf du 2026-08-04 ne régressent pas.
2. **Ce que T37 ne peut pas prouver, et qui attend T41** : *« si une dépense me met en danger »*. Et *« sans ouvrir une application bancaire »* ne se prouve pas en une fois — le parcours exige précisément de l'ouvrir ; l'exigence est tenue après **trois mois consécutifs sans écart**.
3. **Chaque tâche porte sa recette (R4), et cette recette remonte le protocole jusqu'à son étape.** Un verdict qui ne la cite pas n'est pas un verdict.
4. **L'oracle rejoue à l'identique** — 191 paires, 606 décisions — sur tout le PRD. **À partir de T44, une suite qui ne peut pas le rejouer est ROUGE, jamais verte**, et le chiffre devient un plancher : l'oracle grandit, il ne rétrécit jamais.
5. **Les 18 méthodes ont un état connu**, chacune avec le geste qui l'a exercée. Une méthode sans appelant est branchée ou supprimée. *(`POST /transactions` n'est plus candidate à la suppression : T48 lui donne son usage, la saisie des dépenses en espèces.)*
6. **Les 606 décisions ont un consommateur visible** — T47. Une qualification qui ne change rien à l'écran n'est pas livrée.
7. **Aucun nom de compte, d'établissement ou de produit dans le code.** `git grep` le prouve sur `web/` et sur le contrat de `src/server.ts`.
8. **Sur tout le PRD** : `npm test` vert avec un **décompte non nul** — jamais un vert nu — lint, typecheck et build à 0.
9. **Les 6 problèmes ouverts sont cochés ou explicitement laissés ouverts avec leur raison.**

**Le critère d'arrêt, sans lequel « le dernier PRD » n'est qu'un titre** : n'entre dans ce PRD que le constat de T37 qui **rend fausse l'une des deux phrases du §1**. Tout le reste va au registre.

## 9. Ce qui n'entre pas

- **Les tâches du lot C et D écrites avant T37.** Ce qui est au §6 est leur cadrage, pas leur plan.
- **Les 14 observations de `ux-observations.md`**, gravité faible : aucune rencontrée en usage réel. T21 C2 est absorbée par T40 ; T26 C1 est refermée par le modèle local.
- **La sauvegarde hors machine** (C10) et **le portage Raspberry Pi** — post-MVP ; la portabilité est préservée par construction.
- **L'unification des deux mécanismes de `fingerprint`** (C11) — documentée, pas corrigée : elle coûterait le recalcul de 609 lignes pour aucun gain, l'oracle s'accrochant à la ligne de transaction.
- **`accountTypes = ["BANK","LIVRET_A","OTHER"]` et `IBAN_LENGTHS = { DE, FR }`** — résidus de la même famille, laissés faute d'un problème réel qui les nomme. À rouvrir si T37 croise un compte étranger.

## 10. Risques

- **Le lot 0 n'est pas fait à temps.** Seul risque irréversible : le 2026-09-06, le trou est définitif.
- **Dix tâches avant de mesurer.** C'est le motif que R1 condamne, et Lamoms l'assume : la parade est R4, dont la recette remonte la chaîne — un défaut de jonction coûte une tâche, pas dix.
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

**Plus aucune décision ouverte.** Ce qui reste à établir relève du fait : le chemin de Sumeria, le sort de `GET /accounts`, et le modèle exact — tous établis par le parcours ou par la mesure.
