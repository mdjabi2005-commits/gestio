# Mise en service réelle — protocole de test (2026-08-04)

Décidé par Lamoms le 2026-08-04 : **tester l'app avant de régler les problèmes un par un.**
Ce fichier n'est pas un PRD. C'est la liste des points où l'app peut casser, dans l'ordre
où on les rencontre. Chaque case cochée est un fait ; chaque case barrée devient une issue.

Règle du protocole : **on ne corrige rien en cours de route.** On note et on continue aussi
loin que possible. Un blocage dur arrête le parcours — on le note et c'est lui, l'issue suivante.

---

## Étape 0 — Démarrer (le premier mur est déjà connu)

CONSTATÉ LE 2026-08-04, avant tout lancement, en lisant le dépôt :

- `.env` contient les six clés `ENABLE_BANKING_*` mais **PAS `GESTIO_DB_KEY`**, alors que
  `src/db.ts:22-25` refuse d'ouvrir la base sans elle (« GESTIO_DB_KEY is required »).
- Le serveur **ne lit pas `.env`** : aucune dépendance dotenv, aucun `--env-file` dans
  `package.json`. `scripts/backup.sh:4-8` sourcre `.env` lui-même — le serveur, non.
  Les deux ne se chargent donc pas de la même façon.
- `.env.example` liste `GESTIO_DB_KEY` et `ENABLE_BANKING_REDIRECT_URL` — deux clés que le
  `.env` réel n'a pas.
- Aucune base n'existe (`data/gestio.db` absent) : c'est bien une première installation.

Le serveur charge lui-même `.env` avec `dotenv`. Commandes :

```bash
npm ci
npm run build          # tsc + vite build → dist/ et dist/web/
npm start              # ou npm run dev
```

Avant la mesure de qualification, remplacer dans le `.env` réel l'exemple de
`GESTIO_PERSONAL_NAMES` par les noms ou alias privés du titulaire, séparés par des virgules,
puis relancer Gestio, qui charge ce fichier avec `dotenv`. Sans cette variable, un virement
personnel sans jambe miroir redevient « externe probable » et l'oracle privé est ignoré. Ne
pas sourcer le `.env` complet pour lancer le test : il peut contenir des secrets multilignes.

- [ ] `npm test` rejoue l'oracle de qualification sans différence et sans test ignoré.

- [ ] Le serveur écoute sur https://localhost:3443/ et la page se charge (certificat auto-signé
      à accepter dans le navigateur — c'est attendu).
- [ ] Noter ici tout ce qu'il a fallu faire **en plus** de ces commandes. Ce delta est la
      première issue candidate : une app qui ne démarre pas sans savoir-faire implicite n'est
      pas installable sur le RPi.

## Étape 1 — Entrer

- [ ] Créer le mot de passe local, se déconnecter, se reconnecter.
- [ ] Une mauvaise réponse est refusée.

## Étape 2 — Les comptes sans API (le seul chemin, pas un repli)

Livret A, Livret Jeune Swing, Nickel : saisie manuelle du solde réel.

- [ ] Les trois comptes existent, rattachés au bon établissement.
- [ ] Livret A et Livret Jeune apparaissent **à côté** du CCP sous La Banque Postale, jamais
      dessous (modèle à deux niveaux, P28).
- [ ] Le solde de l'établissement La Banque Postale = somme de ses comptes, et le CCP n'est
      compté qu'une fois.

## Étape 3 — La Banque Postale par API

- [ ] Le parcours d'authentification forte va jusqu'au bout et revient sur
      https://localhost:3443/ (P18 : l'URL de redirection enregistrée, pas celle du lab).
- [ ] Les transactions descendent et le solde s'affiche avec sa **date de fraîcheur**.
- [ ] Relancer la synchro : aucune ligne dupliquée (empreinte d'identité, T1/T2).

## Étape 4 — Les autres banques par API

Revolut (12 champs, 3727 j), Trade Republic (4 champs, 90 j, **aucun libellé** — P25).

- [ ] Une **deuxième** connexion bancaire coexiste avec la première sans écraser la LBP.
- [ ] Trade Republic descend malgré l'absence de libellé — c'est le cas où le rapprochement
      par Jaccard est structurellement inapplicable. Noter ce que fait l'app, sans juger.
- [ ] Les pockets Revolut apparaissent comme des comptes de l'établissement Revolut.

## Étape 5 — Les imports

- [ ] CSV Revolut (254 lignes réelles, 2025-09-01 → 2026-06-14) : importé, sans doublon avec
      ce que l'API a déjà descendu.
- [ ] CSV inconnu : refusé explicitement, pas parsé au hasard (T12).
- [ ] PDF La Banque Postale : les 12 relevés, dont le Livret A qu'ils contiennent (P32).
- [ ] PDF Nickel : les 9 relevés.
- [ ] Réimporter le même fichier deux fois ne crée rien.

## Étape 6 — Le moment de vérité

- [ ] Les **six** comptes ont un solde.
- [ ] Le total affiché = somme des six comptes réels, jamais des groupes.
- [ ] Comparer chaque solde à son relevé, un par un. Un écart = un fait à noter avec le compte,
      le montant attendu et le montant affiché. **C'est cette comparaison qui ferme P28.**

## Étape 7 — Les deux appareils

- [ ] Depuis le téléphone via Tailscale, PC allumé : même parcours, même écran.
- [ ] PC éteint (ou réseau coupé) : le dernier solde connu s'affiche **avec sa date de
      fraîcheur**, jamais un chiffre périmé présenté comme actuel (P16, T7).

## Étape 8 — La sauvegarde

- [ ] `npm run backup` produit un fichier, et ce fichier se **rouvre** avec la même clé
      (lecture réelle, pas seulement existence — T8).

---

## Journal du parcours (2026-08-04)

- **Étape 0 — ÉCHOUÉE, trois causes distinctes.** (1) `GESTIO_DB_KEY` absente du `.env`, qui
  était celui du lab AGY (six clés `ENABLE_BANKING_*`, dont trois — `SESSION_ID`, `ACCOUNT_UID`,
  `IBAN` — que le code de l'app ne lit jamais). (2) Le serveur ne charge pas `.env`, alors que
  `scripts/backup.sh:4-8` le source lui-même : deux chemins de chargement incohérents.
  (3) Deux lignes `GESTIO_DB_KEY` se sont retrouvées dans le fichier ; `. ./.env` prend la
  dernière, l'autre était morte — doublon supprimé, sauvegarde dans `.env.bak-doublon`.
- **Environnement, hors dépôt** — `node_modules` s'est vidé tout seul après une installation
  saine : 82 paquets sur 134 sans `package.json`, code disparu, `LICENSE`/`docs`/`test`
  conservés. Réinstallation → 0 cassé sur 124. Corruption ASYNCHRONE de `/mnt/c` (antivirus
  Windows ou couche 9p), pas un défaut du projet. Rejoint `chmod` inopérant sur `/mnt/c`.
  Remède si récidive : sortir le projet vers le système de fichiers natif WSL — décision de
  Lamoms, pas la mienne.
- **Étape 3 — RÉUSSIE.** La Banque Postale : 5 pages, 42 transactions, plancher 2026-05-11,
  `continuation_exhausted`. **P33 confirmé en direct** — les pages 1 à 4 sont revenues vides
  avec `continued:true` et le code ne s'y est pas arrêté.
- **Étape 4 — ÉCHOUÉE.** Trade Republic : connexion OK, synchronisation `SYNC_FAILED`.
  Voir **P38** — la chaîne de trois défauts qui rend l'échec invisible, plus l'absence de
  trace qui rend la cause innommable. C'est le blocage dur du parcours.
- **Étape 4 (Trade Republic) — CAUSE NOMMÉE LE 2026-08-04**, après un spike de lecture
  (`.lamoms/demande-recherche-agy-2.md`) et une contre-vérification sur `dist/`. Deux gardes
  maison rejettent, empilés : `enable-banking.ts:94` (`remittance_information: null`, 43/43) puis
  `enable-banking.ts:124` (montants à six décimales et signés). **Enable Banking n'a rien refusé** —
  la banque a livré 43 transactions valides et un solde. Assouplir est sans perte : zéro montant
  sur 43 porte un chiffre non nul sous le centime, et les 43 passent une fois les deux gardes
  levés. Détail complet en **P38** ; le solde `OTHR` devient **P44**, le nommage se réduit en
  **P39**, et l'incident `tasks.yaml` du run devient **P45**.
- **Étape 4 (Revolut) — RÉUSSIE, et instructive.** 4 comptes rendus (le compte et ses trois
  pockets, `accountId` 3 à 6), 8 pages, **314 transactions**, plancher **2025-03-02** — dix-sept
  mois, à comparer aux 90 jours de LBP. Le modèle à deux niveaux a accueilli les pockets sans
  rien changer, comme P28 l'avait prévu. Deux conséquences : **P38 est confirmé chiffre en
  main** (total affiché 42,16 EUR dont 0,00 EUR pour Trade Republic qui n'a jamais chargé), et
  **P39 apparaît** — les quatre comptes Revolut portent tous le même nom, celui du titulaire.

- **Étape 6 — PARTIELLEMENT RÉUSSIE, et c'est le meilleur résultat du parcours.** Lamoms a
  comparé les soldes affichés à ses applis bancaires le 2026-08-04 : **tous justes**, La Banque
  Postale (4,57 EUR) comme les quatre Revolut (1,04 / 1,00 / 2,25 / 33,30 EUR). Seul faux —
  le 0,00 EUR de Trade Republic (P38). PREUVE CROISÉE OBTENUE AU PASSAGE — sur les quatre
  comptes Revolut, le solde lu sur `GET /accounts/{uid}/balances` tombe AU CENTIME sur la somme
  des 314 transactions ingérées, deux sources indépendantes. Revolut rend donc l'historique
  complet depuis l'ouverture du compte, et l'ingestion n'a ni perdu ni dupliqué. Le contraste
  avec La Banque Postale (4,57 EUR affichés contre −537,74 EUR de somme, fenêtre de 90 jours)
  démontre en une ligne que le solde d'un compte synchronisé n'est pas la somme de ses
  transactions. NE FERME PAS P28 — le périmètre testé est de 5 comptes sur 9, l'étape 2 ayant
  été sautée faute de porte (P40).
- **Étape 2 — contournée par l'API.** Livret A (#7) et Livret Jeune Swing (#8) créés par curl,
  rattachés à La Banque Postale. Nickel a échoué, sortie non recueillie.

- **Étape 5 — RÉUSSIE pour les PDF, ÉCHOUÉE pour le CSV.** Relevé BP : `imported 1,
  duplicates 16, balancesImported 2` — la déduplication inter-canaux PDF/API reconnaît 16
  doublons sur données réelles, et les livrets se remplissent depuis le relevé (Livret A
  49,18 EUR, Livret Jeune 16,12 EUR), P32 exploitable. Relevé Nickel : `imported 2,
  balancesImported 1` (10,50 EUR). CSV Revolut : deux échecs successifs, **P41** (versé sans
  refus dans un compte La Banque Postale) puis **P42** (121 doublons non détectés, 898 EUR de
  mouvements fantômes). Les deux imports fautifs ont été supprimés après sauvegarde ; la base
  est revenue à un état prouvé sain (compte #5 : 219 tx, somme 2,25 EUR = solde API).
- **Étape 7 — 7a RÉUSSIE, 7b ÉCHOUÉE.** Depuis le téléphone via Tailscale, avec un vrai
  certificat Let's Encrypt émis par `tailscale cert`, l'écran est identique à celui du PC : la
  contrainte d'UI unique tient sur un vrai mobile. Réseau coupé, en revanche, la page ne se
  charge pas du tout — voir **P43**.
- **Étape 8 — RÉUSSIE.** `npm run backup` produit un fichier dont l'en-tête n'est pas du SQLite
  en clair et qui se relit avec la clé (609 transactions lues dans la sauvegarde). Le critère
  de T8 est tenu sur données réelles.

## Ce que ce protocole ne teste pas, et pourquoi

- **P30** (les virements internes comptés comme dépenses, 44 % des débits) — ne devient
  observable qu'à partir de l'étape 4, quand deux comptes réels ont des données. Avant, la
  détection par paire ne peut structurellement rien trouver. Et il ne fausse **pas** le solde,
  seulement la lecture des dépenses.
- **P29** (poser une référence, voir l'écart) — se rouvre une fois l'étape 6 passée, sur des
  chiffres justes.
- **P37** (sauvegarde hors machine) — hors parcours, post-MVP.
