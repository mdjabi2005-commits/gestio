# Mise en service réelle — le protocole, et les deux parcours déjà faits

**Ce fichier est la référence unique du protocole.** Il fusionne, le 2026-08-12, le protocole à 8 étapes du 2026-08-04 et le protocole à 12 étapes de l'issue #40 — qui vivaient dans deux endroits différents et divergeaient. **Le protocole à 12 étapes ci-dessous fait foi**, et c'est celui que T37 déroule.

Ce fichier n'est pas un PRD. C'est la liste des points où l'application peut casser, dans l'ordre où on les rencontre. Chaque case cochée est un fait ; chaque case barrée devient un constat daté.

> **Règle du protocole, inchangée depuis le 2026-08-04 : on ne corrige rien en cours de route.**
> On note et on continue aussi loin que possible. Un blocage dur arrête le parcours — on le note, et c'est lui la tâche suivante. C'est cette règle qui a donné sa valeur au cycle 2.

> **Le parcours est fait à la main, par l'utilisateur.** R1 : une livraison n'est prouvée que par un usage, et un usage a un utilisateur. Aucun agent ne le remplace.

---

## Avant de commencer

- [ ] **`GESTIO_PERSONAL_NAMES` est renseignée** dans le `.env` réel. Sans elle, un virement vers soi retombe en « externe probable » au lieu de « à vérifier », et l'étape 8 ne prouve rien. *(T29/#41, clos le 2026-08-11.)*
- [ ] **Le corpus de relevés est à jour**, relevé La Banque Postale du mois compris. Le plancher de l'API avance d'un jour par jour et le PDF est la seule mémoire longue. **Au 2026-08-13** : le corpus couvre jusqu'au relevé émis le 2026-07-08 ; **celui du 2026-08-08 est disponible et manquant**, le suivant paraîtra vers le 2026-09-07, et l'échéance dure est le **2026-10-06**. Nickel est à jour au 2026-08-02.
- [ ] **Savoir où sont les fichiers.** Les relevés : `/mnt/c/Users/djabi/Documents/relevé pdf/` — accent et espace, variable `GESTIO_PDF_CORPUS`. L'oracle T27 : `/mnt/c/Users/djabi/Documents/releves-pdf/`, variable `GESTIO_T27_ORACLE_REPO`. **Deux dossiers voisins, deux rôles.**
- [ ] **Lire le décompte de skip de `npm test`, pas seulement le vert.** Tant que T31 n'a pas ajouté `--env-file=.env`, un `40 tests · 39 pass · 1 skipped` signifie que le rejeu des 606 décisions **ne s'est pas exécuté**.
- [ ] **Noter d'où l'on part** : base réelle ou copie. Les deux se défendent, mais le résultat ne se lit pas pareil. Si c'est la base réelle, relever l'empreinte de `data/gestio.db` **avant et après**.
- [ ] **Établir la liste des comptes**, et ne la reprendre d'aucun document. Elle a déjà bougé deux fois et Sumeria n'y est pas encore.

## Quel appareil fait quoi

| | Téléphone | PC (machine serveur) |
|---|---|---|
| Consulter soldes, fraîcheur, mouvements | **oui** | oui |
| Relancer la synchro d'une connexion autorisée | **oui** | oui |
| Établir une **nouvelle** connexion bancaire | **non** en MVP | **oui** |
| Importer les relevés PDF | non | **oui** |

Un échec sur les deux dernières lignes depuis le téléphone est une **limite connue** — la `redirect_url` est `https://localhost:3443/`, qui ne résout que sur la machine serveur — **pas un constat à remonter.**

---

## Le parcours — 12 étapes

### Étape 0 — Démarrer
- [ ] `npm ci`, `npm run build`, `npm start` avec le `.env` seul. Le serveur lit `.env` par `dotenv` depuis `d5c054a` : c'est précisément l'étape qui avait échoué le 2026-08-04 et elle n'a jamais été rejouée proprement.
- [ ] Noter tout ce qu'il a fallu faire **en plus** de ces trois commandes. Ce delta bloque le portage sur le Raspberry Pi.

### Étape 1 — Entrer
- [ ] Créer le mot de passe local, se déconnecter, se reconnecter.
- [ ] Un mauvais mot de passe est refusé.

### Étape 2 — Créer les comptes **par l'interface**
- [ ] Établissement puis comptes créés depuis l'écran, sans terminal. Le 2026-08-04, le Livret A et le Livret Jeune ont été créés par `curl`.
- [ ] Le compte accepte son **IBAN** à la saisie.

### Étape 3 — La Banque Postale par API
- [ ] Les transactions descendent, le solde s'affiche avec sa date de fraîcheur.
- [ ] Relancer : aucune ligne dupliquée.

### Étape 4 — Trade Republic par API
- [ ] Les transactions entrent en base et s'affichent.
- [ ] Le solde entre malgré son `balance_type` hors liste.
- [ ] Les transactions sans libellé sont distinguables à l'écran — Trade Republic ne fournit que quatre champs (C7).

### Étape 5 — Revolut par API
- [ ] Les comptes portent des noms **qui les distinguent**, pas celui du titulaire répété.

### Étape 6 — Plusieurs banques connectées en même temps
- [ ] Les connexions coexistent sans qu'une écrase l'autre, **et l'écran les liste** avec leur statut, leur dernière synchro et leur erreur.
- [ ] Chacune se relance séparément, **depuis le téléphone aussi**.

### Étape 7 — Les imports PDF en lot *(sur le PC)*
- [ ] **Les 25 fichiers en une seule fois** — 13 La Banque Postale, 11 Nickel, et `Relevé de compte.pdf` pour Trade Republic — avec une seule correspondance de comptes. *(Précisé le 2026-08-13.)*
  - ⚠️ **`statement.pdf` est exclu de la sélection** : il recouvre `Relevé de compte.pdf` (2025-12-01 → 2026-05-31 contre 2025-09-01 → 2026-06-13) et n'apporte aucun mouvement. **Il ne se supprime pas** — `src/pdf-import.test.ts` le lit en dur pour comparer deux relevés d'une même période.
  - ⚠️ **Les 13 relevés LBP n'ont aucune extension de fichier.** Tant que T43b n'a pas retiré le filtre `accept="application/pdf,.pdf"`, le sélecteur les masque par défaut : basculer sur « Tous les fichiers ».
  - Le 26ᵉ document du corpus est le **CSV Revolut** : il n'entre par aucune route, Revolut passe par l'API seule.
- [ ] Le mapping se fait **par IBAN quand il discrimine, sinon par nom imprimé** — les comptes homonymes ne sont plus indiscernables. *(Corrigé le 2026-08-13 : l'IBAN seul ne suffit pas, les trois segments Trade Republic en partagent un.)*
- [ ] **L'arithmétique se referme sur chaque segment** : `ouverture + Σ mouvements = clôture`. Plancher mesuré le 2026-08-13 : 25 segments sur 25, sans un centime d'écart.
- [ ] Le compte rendu nomme chaque fichier, ses transactions importées, ses doublons, ses soldes, ses lignes à vérifier.
- [ ] Un fichier en échec au milieu du lot ne fait pas perdre les autres, et il est nommé.
- [ ] Réimporter le même lot ne crée rien.

### Étape 8 — La qualification — l'étape neuve
- [ ] Combien de mouvements portent `virement_intercompte`, combien `virement_a_verifier`, combien `virement_externe`. **Ce chiffre n'a jamais été vu.**
- [ ] Ce que l'écran en montre, et ce qu'on peut en faire.
- [ ] Prendre trois paires au hasard et vérifier à la main que ce sont bien deux jambes du même virement.
- [ ] Chercher un faux positif : un virement vers un tiers portant un mot du nom du titulaire.
- [ ] **Pour chaque mouvement « à vérifier », noter l'information qui aurait permis de trancher** — un IBAN, un libellé récurrent, un tiers déjà rencontré, une habitude. Au bout, on n'a pas une liste de doutes : on a la liste de ce que l'application aurait dû savoir. **Ne rien construire ici — récolter.**
- [ ] Les transactions Nickel importées avant T27 : mesurer l'ampleur du rattrapage.

### Étape 9 — Le moment de vérité
- [ ] **Chaque compte déclaré** porte un solde. Aucun nombre attendu : la liste est celle de l'étape « avant de commencer ».
- [ ] Le total affiché = la somme des comptes réels, jamais des groupes.
- [ ] Comparer chaque solde à son application bancaire, un par un. Un écart = un fait noté avec le compte, le montant attendu et le montant affiché.
- [ ] Noter par quel chemin **Sumeria** entrerait : API, relevé ou saisie.

### Étape 10 — Les deux appareils
- [ ] Depuis le téléphone via Tailscale, PC allumé : consulter et relancer une synchro. Noter ce qui est utilisable et ce qui ne l'est pas.
- [ ] Réseau coupé : la coque se charge et le dernier solde connu s'affiche **avec sa date**, jamais un chiffre périmé présenté comme actuel.

### Étape 11 — La sauvegarde, jusqu'au bout
- [ ] `npm run backup` produit un fichier qui se relit.
- [ ] **Repartir de cette sauvegarde dans une base vide et retrouver l'application dans son état.** On sait relire une sauvegarde ; on n'a jamais restauré.

### Étape 12 — L'état des 18 méthodes
- [ ] Chacune des 18 routes reçoit un état : exercée et conforme, exercée et cassée, ou jamais atteignable depuis l'interface.
- [ ] Les trois qui n'ont **jamais été appelées par personne** le sont : `GET /accounts`, `POST /transactions` (saisie manuelle), `POST /transactions/resolve`.
- [ ] `POST /auth/logout` est repris : réparé, ou toujours silencieux.
- [ ] La vue de couverture ne montre aucun trou — en distinguant « pas de relevé importé » de « relevé importé, aucun mouvement », et sans réclamer un relevé à Revolut, qui n'en a pas.

---

## Journal du parcours n°1 — 2026-08-04

- **Étape 0 — ÉCHOUÉE, trois causes.** `GESTIO_DB_KEY` absente du `.env` (qui était celui du lab AGY) ; le serveur ne chargeait pas `.env` alors que `scripts/backup.sh` le sourçait ; deux lignes `GESTIO_DB_KEY` en doublon. *Depuis `d5c054a`, le serveur charge `.env` lui-même — les deux premières causes sont périmées.*
- **Environnement, hors dépôt** — `node_modules` s'est vidé seul après une installation saine. Corruption **asynchrone** de `/mnt/c` (antivirus Windows ou couche 9p), pas un défaut du projet. Rejoint le fait que `chmod` est inopérant sur `/mnt/c`.
- **Étape 3 — RÉUSSIE.** La Banque Postale : 5 pages, 42 transactions, plancher 2026-05-11. Les pages 1 à 4 sont revenues **vides avec `continued:true`** et le code ne s'y est pas arrêté — C3 confirmé en direct.
- **Étape 4 (Trade Republic) — ÉCHOUÉE, cause nommée le jour même.** Connexion OK, `SYNC_FAILED`. Deux gardes maison empilées rejetaient les 43 transactions que la banque avait livrées. **Enable Banking n'avait rien refusé.**
- **Étape 4 (Revolut) — RÉUSSIE, et instructive.** 4 comptes (le compte et ses trois pockets), 8 pages, **314 transactions**, plancher **2025-03-02** — dix-sept mois, contre 90 jours chez LBP. Le modèle à deux niveaux a accueilli les pockets sans rien changer. Les quatre comptes portaient tous le nom du titulaire.
- **Étape 5 — RÉUSSIE pour les PDF, ÉCHOUÉE pour le CSV.** Relevé BP : `imported 1, duplicates 16, balancesImported 2` — **la déduplication inter-canaux reconnaît 16 doublons sur données réelles**, et les livrets se remplissent depuis le relevé (Livret A 49,18 €, Livret Jeune 16,12 €). CSV Revolut : deux échecs successifs, versé sans refus dans un compte La Banque Postale, puis 121 doublons non détectés. Les deux imports fautifs ont été supprimés ; la base est revenue à un état prouvé sain.
- **Étape 6 — PARTIELLEMENT RÉUSSIE, et c'est le meilleur résultat du parcours.** Soldes comparés aux applis bancaires : **tous justes** — LBP 4,57 € et les quatre Revolut. Seul faux, le 0,00 € de Trade Republic. **Preuve croisée obtenue au passage** : sur les quatre comptes Revolut, le solde de `GET /balances` tombe **au centime** sur la somme des 314 transactions — deux sources indépendantes. Le contraste avec LBP (4,57 € affichés contre −537,74 € de somme, fenêtre de 90 jours) démontre en une ligne que **le solde d'un compte synchronisé n'est pas la somme de ses transactions**. Ne ferme pas P28 : 5 comptes sur 9.
- **Étape 7 — 7a RÉUSSIE, 7b ÉCHOUÉE.** Depuis le téléphone via Tailscale, avec un vrai certificat Let's Encrypt, l'écran est identique à celui du PC : **la contrainte d'UI unique tient sur un vrai mobile.** Réseau coupé, la page ne se chargeait pas du tout.
- **Étape 8 — RÉUSSIE.** `npm run backup` produit un fichier dont l'en-tête n'est pas du SQLite en clair et qui se relit avec la clé : **609 transactions lues dans la sauvegarde.**

## Journal du parcours n°2 — 2026-08-11 · verdict ROUGE

*Verdict et preuves : `.lamoms/verdict-t30.md`. Le parcours n'a jamais dépassé l'étape 2 en autonomie.*

- **Étape 0 — RÉUSSIE, delta réel.** Le worktree n'avait ni `.env` ni `data/` : il a fallu refaire le lien vers ceux du workspace. C'est le delta qui bloque le portage RPi.
- **Étape 1 — PARTIELLE.** Mauvais mot de passe : `401 invalid_credentials`, correct. Mais **`/auth/logout` est hors `PUBLIC_PATHS`** : sans session valide il répond `401`, et `logout().then(refresh)` avale l'échec sans notice. **Un logout qui échoue est silencieux.**
- **Étape 2 — PARTIELLE.** Le formulaire de compte n'envoie que `name`, `type`, `institutionId` — **aucun IBAN**, alors que `POST /accounts` l'accepte. En base, **aucun des 9 comptes ne porte d'IBAN** : la meilleure preuve d'appariement des virements est structurellement indisponible. **Noms ambigus confirmés en base** : les neuf comptes portent des variantes du nom du titulaire — trois orthographes différentes, dont une répétée à l'identique sur les quatre comptes Revolut. Aucun ne porte le nom du produit. *(Les valeurs exactes ne sont pas recopiées ici : ce dépôt est public.)*
- **Étapes 3, 4, 5 — NON EXÉCUTÉES.** Pas échouées : **jamais lancées.** `SyncButton` rend `null` sans `localStorage["gestio.authorization-id"]`. État en base : compte LBP #1, 42 transactions, solde 457 centimes, dernière synchro `2026-08-04`. Trade Republic toujours `SYNC_FAILED`.
- **Étape 6 — CONSTAT CONFIRMÉ.** Trois connexions `AUTHORIZED` en base, et **l'interface ne les lit jamais** — aucune requête vers `bank_connections`. Clé `localStorage` unique : une deuxième banque écrase la première.
- **Étape 7 — BLOCAGE DUR.** (a) Corpus LBP arrêté à `releve_CCP0984209Z024_20260708`, **pas de relevé d'août** — le prérequis n'était pas tenu. (b) Le mapping n'affiche que `account.name` : avec quatre Revolut homonymes, associer sûrement est impossible, et `each statement account must map to a different accountId` bloque. Aucun essai n'a pu écrire : le refus précède la transaction SQL.
- **Étapes 8 à 11 — NON ATTEINTES.** **La récolte de l'étape 8 n'existe donc pas** — c'est la matière première qui manque au lot C du PRD.
- **Incident de sécurité, hors code.** Un diagnostic de variables a fait apparaître des **fragments de clé PEM dans une sortie de session**. Aucun secret dans un fichier versionné (`git grep "BEGIN .*PRIVATE KEY"` : rien ; `.env` et `data/` ignorés). **Rotation de la clé Enable Banking recommandée** avant la prochaine opération bancaire.

---

## Ce que ce protocole ne teste pas, et pourquoi

- **La sauvegarde hors machine** (C10) — hors parcours, post-MVP.
- **Le mobile PC éteint** (C8) — limite assumée et annoncée du MVP, pas un défaut. Le Raspberry Pi la lèvera sans réécriture.
- ~~**La règle « 0 vs inconnu »** pour un compte sans solde déclaré (D5) — non tranchée.~~ **Tranchée le 2026-08-12 : inconnu, jamais zéro.** D5 est devenue une tâche du lot A le 2026-08-13 et se livre avant l'onboarding. Le parcours la constate au lieu de la poser.
