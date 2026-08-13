# Contraintes, règles et acquis — la fiche de conception

**Extraite le 2026-08-12 de `.lamoms/problems.json` (55 entrées), juste avant sa remise à zéro.**
Les 34 entrées closes sont dans git et n'ont plus d'usage. Les 6 problèmes encore ouverts sont la liste de vérification du PRD final, pas une source de tâches. Ce qui reste ici est **la forme du monde** : on ne cherche pas à la résoudre, on conçoit avec.

> **Ce fichier se lit avant de coder, jamais pour y piocher une tâche.** Une entrée d'ici n'engendre pas d'issue. Si l'une d'elles redevient un problème — quelque chose ne va pas et il faut une décision — elle sort de cette fiche et devient une entrée du carnet.

---

## RÈGLES — ce qu'on se donne après s'être trompé

### R1 — Une livraison n'est prouvée que par un usage, jamais par un vert
*Posée le 2026-08-12 par Lamoms, après le verdict ROUGE sur T30.*

**Ce qui l'a produite** : 32 tâches livrées, toutes vertes. Deux mises en service, aucune terminée. Trois méthodes n'ont jamais été appelées par personne (`GET /accounts`, `POST /transactions`, `POST /transactions/resolve`), une était cassée sans qu'aucun test ne le dise (`POST /auth/logout`, 401 silencieux), et les 606 décisions de qualification n'ont jamais été affichées à l'écran. Les agents se sont concentrés sur livrer du code au point d'oublier de vérifier qu'il fonctionne en situation.

**Comment elle s'applique** : tout critère d'acceptation nomme **le geste d'usage** qui le prouve, pas seulement la commande qui passe. « `npm test` est vert » n'est jamais un critère à lui seul. Une méthode livrée sans appelant n'est pas livrée. *(Prolonge P47 et P52 : un vert nu ne prouve rien — désormais un vert non nul ne suffit pas non plus.)*

### R4 — Chaque tâche se termine par une recette de deux minutes, faite par Lamoms sur l'application réelle
*Posée le 2026-08-12, parce que R1 sans exécuteur n'est qu'une intention.*

**Ce qui l'a produite** : R1 exige un geste d'usage, mais personne n'était en mesure de le faire. `web/src/main.jsx` fait 334 lignes et **n'a aucun test** — ni jsdom, ni testing-library. Codex travaille dans un worktree **sans `.env` ni `data/`** : il ne peut structurellement pas ouvrir l'application. Résultat mesuré : seize tâches livrées vertes de T13 à T28, et deux mises en service qui n'ont jamais dépassé l'étape 2.

**Comment elle s'applique** : avant le verdict, Lamoms ouvre l'application réelle et fait **le geste, l'écran, le chiffre**. Hermès cite ce qui a été fait. **Une tâche sans recette n'est pas VERTE**, quel que soit l'état de la suite de tests.

**Et la recette remonte le protocole jusqu'à l'étape que la tâche débloque — elle ne teste jamais le seul écran livré.** C'est le cœur de la règle, pas un détail : une recette éprouve une tâche, un parcours éprouve la **jonction** entre les tâches, et c'est la jonction qui casse.

*Le cas qui l'a prouvé* : le 2026-08-11, le parcours meurt à l'étape 7. Ni T18 ni T25 n'étaient cassées — le formulaire de création de compte marchait, l'import en lot marchait, les deux étaient VERTES. Mais le formulaire ne demandait pas d'IBAN et le sélecteur d'import n'affichait que les noms ; avec quatre comptes Revolut homonymes, l'association devenait impossible. **Chaque tâche tenait sa promesse ; leur jonction, non.** Une recette faible aurait validé les deux.

| Recette faible — à éviter | Recette qui remonte la chaîne |
|---|---|
| « le formulaire s'envoie » | partir d'une **base vide** et arriver à voir ses comptes (étapes 0 à 2) |
| « le bouton s'affiche » | connecter **deux** banques et synchroniser chacune séparément (étapes 3 à 6) |
| « l'import passe » | importer **le lot du mois** avec une seule correspondance (étape 7) |
| « je peux cliquer » | contester une qualification et la voir **survivre à un ré-import** (étape 8) |

Chaque recette rejoue donc tout ce qui précède. La chaîne est éprouvée en continu au lieu de l'être en bloc à la fin, et le parcours final devient une confirmation au lieu d'une découverte. Deux minutes de plus par tâche — c'est le seul arbitrage que cette règle demande.

### R2 — Un rapport ne se ratifie pas sans confronter ses sous-réponses entre elles *(ex-P21, cause racine de P20)*
Le rapport d'architecture d'AGY se contredisait **à l'intérieur d'une seule question** : benchmark et sauvegarde rédigés sur une base en clair, chiffrement sur une base entièrement chiffrée. Ratifié « sans réserve », le contresens est devenu un critère d'acceptation contraignant, Copilot a bloqué et Codex a dû démontrer l'impossibilité. Coût : un aller-retour complet de la chaîne. **Un rapport se relit entre ses propres sections avant d'en faire un critère.**

### R3 — Une preuve de lab n'est une preuve que si elle éprouve la difficulté réelle *(ex-P11)*
Le « 34/34 réconciliées, 100 % de couverture » du lab comparait le PDF à lui-même : le jeu « API » était fabriqué à partir du PDF. Or la difficulté du croisement multi-canaux est précisément que le même mouvement porte **un libellé et une date différents selon le canal** — la méthode de test avait supprimé par construction la seule chose à éprouver. **Vérifier d'où vient le jeu de données avant de croire au chiffre.**

---

## CONTRAINTES — le monde est ainsi

### Enable Banking

**C1 — Trois durées à ne jamais confondre.** (1) Le jeton d'accès ASPSP est de courte durée et **rafraîchi automatiquement** — rien à gérer. (2) Le consentement est demandé dans `valid_until` du `POST /auth` et **plafonné par `maximum_consent_validity`** que rend `GET /aspsps` pour la banque visée — 180 jours pour la majorité (amendement EBA RTS 2022) ; la valeur accordée se lit dans `access.valid_until`. **Jamais une durée codée en dur.** (3) La profondeur d'historique est propre à chaque banque.

**C2 — La fenêtre de 90 jours appartient à La Banque Postale, pas à l'API** *(ex-P22)*. Mesurée trois fois le 2026-08-01, `HTTP 422 WRONG_TRANSACTIONS_PERIOD` au-delà. Revolut rend 3727 jours, Trade Republic 90. Codé en dur comme propriété de l'API, ce 90 amputerait silencieusement toute banque plus généreuse — **et l'utilisateur ne verrait aucune erreur, juste des transactions manquantes présentées comme un état complet.** Toute banque ajoutée exige de re-constater sa fenêtre.

**C3 — Quatre récupérations par jour hors présence du titulaire, et la page vide qui ment** *(ex-P33)*. Sur `429 / ASPSP_RATE_LIMIT_EXCEEDED`, la documentation est formelle : « il n'y a aucun moyen d'éviter la limite », reprise après 6 h. Et une réponse **vide avec une clé de continuation** ne signifie pas la fin — s'y arrêter tronque l'historique au milieu, sans erreur et sans message.

**C4 — La `redirect_url` du lab n'est pas enregistrée** *(ex-P18)*. Le script du lab appelle `http://localhost:3000/callback`. Les URL réellement enregistrées sont `https://localhost:3443/` (MVP), `https://localhost:3000/` et `https://gestio.software/auth/callback`. Une autre URL échoue **après** l'authentification forte, donc tard et de façon coûteuse.

**C5 — L'accès production était déjà configuré** *(ex-P2)*. Le canal temps réel avait été retiré du MVP sur une contrainte inexistante : Hermès avait cadré en supposant un bac à sable, AGY en avait fait une contrainte réglementaire, personne n'avait demandé à l'utilisateur. Garder cette entrée comme rappel : **une contrainte qui n'a pas été vérifiée auprès de l'utilisateur n'est pas une contrainte.**

### Les données bancaires

**C6 — Deux mouvements distincts de même montant le même jour existent** *(ex-P5)*. Cas réel : deux virements de 22,00 € le 17/06/2025. Une clé de déduplication naïve (date + montant + libellé) en perd un, et le solde devient faux.

**C7 — Trade Republic ne fournit ni libellé ni identifiant** *(ex-P25)*. Quatre champs seulement : `booking_date`, `credit_debit_indicator`, `status`, `transaction_amount`. Absents : `remittance_information`, `entry_reference`, `bank_transaction_code`. Conséquence directe : **l'arbitrage par Jaccard sur les mots du libellé est structurellement inapplicable** sur cette banque, et C6 y devient insoluble. Une transaction réduite à une date, un montant et un sens ne donne rien à afficher non plus.

**C11 — L'empreinte d'un mouvement diffère selon le canal, et on ne l'unifie pas** *(mesuré le 2026-08-12 ; décision de Lamoms : cas limite à documenter, pas défaut à corriger)*. Le `fingerprint` hache compte + date + libellé + montant et répond à « ai-je déjà cette ligne ? ». Comme deux mouvements réels peuvent être identiques (C6), chaque canal doit pouvoir dire « celui-ci est le deuxième » — **et les deux le disent différemment** : le chemin API met le rang **dans** le hachage (deux empreintes différentes, colonne `occurrence` à 0) ; le chemin PDF le laisse **à côté** (même empreinte, colonne à 0 puis 1). **Conséquence : le même mouvement réel, vu par l'API puis retrouvé dans un relevé, n'a pas la même empreinte.** L'empreinte ne peut donc jamais servir à dire « ces deux-là sont le même mouvement » — c'est la déduplication qui porte cette identité, par (date, montant) puis Jaccard. Unifier coûterait le recalcul des 609 lignes existantes pour aucun gain observable. **Comment on vit avec** : quand date et montant ne suffisent pas et que le libellé ne départage pas, **le système ne devine pas, il demande** — tous les candidats passent à vérifier et l'utilisateur tranche. C'est le seul endroit où l'intervention humaine est irréductible, et c'est le bon.

**C12 — Les libellés PDF et Enable Banking sont le même texte, à un débordement près** *(mesuré le 2026-08-12 : dump API réel de La Banque Postale contre le relevé de juin parsé)*. Sur les **16 mouvements appariés** par date et montant — les « 16 doublons » du 2026-08-04 — les libellés sont identiques à **13/16 après normalisation**. Les 10 différences brutes ne sont que des espaces : l'API garde le remplissage à largeur fixe de la banque, le PDF l'écrase, `normalizeTransactionLabel` les réduit. **La banque ne raconte donc pas deux histoires selon le canal** : déterminer la nature par le libellé — la seule trace qui survit dans un vieux relevé — tient d'un canal à l'autre. *Réserve* : les 3 libellés qui résistent sont tous **plus longs côté PDF**, l'API en étant le début — le parseur fait déborder le libellé sur la ligne suivante, l'un avalant `TOTAL DES OPÉRATIONS`. Corrigé dans T31. Jaccard au pire à 0,60, donc la déduplication les apparie malgré tout.

### L'exécution et l'accès

**C8 — Le mobile ne joint pas un serveur éteint** *(ex-P13, P16)*. Le MVP tourne sur le PC hôte : l'usage mobile en situation — le cas d'usage central — n'est **pas couvert** tant que le Raspberry Pi n'existe pas. C'est une limite assumée et annoncée, pas un défaut à corriger ; elle rend le mode hors connexion obligatoire, jamais sans objet.

**C9 — Un seul point critique côté PWA : la redirection d'authentification forte** *(ex-P12)*. Tout le reste — afficher, appeler l'API, choisir un fichier — est sans enjeu ou hors périmètre. C'est ce point-là, et lui seul, qu'il faut surveiller sur mobile.

**C10 — La sauvegarde vit sur le même disque que la base** *(ex-P37)*. `sqlcipher_export()` + rotation 30 jours protège de la corruption et de l'effacement, **pas du sinistre**. Or une part des données est irremplaçable : saisie manuelle et état des lieux importé au-delà de la fenêtre API. La copie sur support secondaire est prévue au PRD et n'est pas livrée. Post-MVP, assumé.

---

## ACQUIS — des faits qui servent

**A1 — Le relevé PDF de La Banque Postale contient tout le Livret A** *(ex-P32)*. Le relevé mensuel est **multi-comptes** : un bloc « Situation de vos comptes au <date> » donne le solde de tous, puis une section « Comptes d'Épargne » est un relevé complet du Livret A — IBAN, ancien solde daté, mouvements ligne à ligne, nouveau solde daté. Vérifié sur le relevé du 08/06/2026 : 34,18 au 07/05, +15,00, 49,18 au 08/06, l'arithmétique se referme. Les 12 relevés donnent 12 points de solde et 45 mouvements. **Le PDF est le seul accès au Livret A et au Livret Jeune, et il suffit** — l'inférence depuis le compte courant est inutile.

**A2 — Les virements Livret A → compte courant ont une signature de libellé** *(ex-P31)*. Une part de ces mouvements est détectable depuis le compte courant, ce qui réduit d'autant la saisie manuelle — et un mouvement non saisi rend le solde agrégé faux sans que rien ne le signale.

**A3 — Le relevé referme sa propre arithmétique, et les relevés se chaînent** *(mesuré le 2026-08-13 sur les 25 segments du corpus, par le parseur du projet)*. Sur **chaque** segment : `ouverture + Σ mouvements = clôture`, au centime. Et d'un relevé au suivant, la clôture de l'un **est** l'ouverture de l'autre : **0 bris interne, 0 bris de jonction** sur 13 relevés LBP et 11 Nickel. Les chaînes complètes : CCP 381,55 € (juin 2025) → **230,67 €** (juillet 2026) ; Livret A 0,04 € → **79,18 €** ; Nickel 0,00 € → **1,21 €** ; Trade Republic 2,61 € → **957,27 €**. **Ce que ça donne** : une vérification de parsage qui ne dépend d'aucun décompte codé en dur — un libellé qui déborde ou une ligne avalée casse l'égalité tout de suite. Et **le relevé porte sa propre ouverture**, donc valider un parsage n'exige jamais de remonter à la création du compte : c'est une objection qui tombe. Portée par le critère (4) de T43a.

**A4 — Enable Banking distingue déjà les comptes que le nom confond** *(mesuré le 2026-08-13 sur `accounts_details_raw.json`, sortie brute de `GET /accounts/{uid}/details` du 2026-08-04)*. Revolut rend **quatre comptes portant la même chaîne de nom**, et pourtant parfaitement identifiables : `cash_account_type` sépare le compte principal (**CACC**, avec IBAN) des trois pockets (**SVGS**, `iban: null`), et chaque pocket porte un UUID stable dans `account_id.other.identification`. **Ce n'est donc pas un problème d'identité, mais de nom** — d'où `display_name` (T33) et l'étape de nommage de l'onboarding (T45a). Deux confirmations au passage : **l'IBAN rendu par l'API égale celui imprimé sur le relevé**, pour le CCP comme pour Trade Republic ; et **l'API ne rend qu'un seul compte Trade Republic**, le compte espèces — le PEA et le PEA 2 n'ont d'autre porte que le relevé, comme le Livret A et le Livret Jeune.
