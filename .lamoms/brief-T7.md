# Brief T7 — avant PRD

Auteur : Claude (Planificateur). Date : 2026-08-03.
Étape lue : `journey.json` current=5, T7 `running`, issue #13. Handoff `hermes → codex (ready)`.
Statut de ce brief : **le passage à Codex est prématuré**. Trois blocages et cinq décisions à trancher d'abord.

---

## 1. Problème principal

P1, pour sa partie visible. Rien de ce qui a été livré en T1→T6 n'est visible : le dépôt n'a
**aucun frontend** (0 dépendance React/Vite dans `package.json`, aucun répertoire web). T7 est donc
la totalité de l'interface depuis zéro, pas un habillage.

La finalité exacte est celle formulée par Lamoms le 2026-08-01 (P29) — pas « voir son solde »,
mais **« combien je peux dépenser, et où »**. Cela hisse la répartition par compte au même rang que
l'agrégat : un total sans sa ventilation ne permet aucune décision de dépense.

## 2. Blocages (à lever avant que Codex touche le clavier)

### B1 — Le worktree issue-13 ne contient pas T4, dont T7 dépend

`.worktrees/issue-13` est sur `5c34d9b` (tip d'issue-8, 2026-08-02).
Vérifié : `git merge-base --is-ancestor 29b87ee 5c34d9b` → **NON**.

Le commit T4 (`29b87ee`) est celui qui a posé le modèle établissement→comptes, `known_since` et
`last_synced_at`. Dans ce worktree, `GET /balance` ne renvoie ni `institutions`, ni `knownSince`.
Codex coderait contre une API qui n'a pas les champs de trois de ses critères, et découvrirait le
mur à la review. C'est exactement la règle 5 ajoutée à `AGENTS.md` hier après la review ROUGE de #12.

**Action (Copilot) : rebaser `.worktrees/issue-13` sur `master` (77eddf4).**

### B2 — L'issue GitHub #13 est périmée par rapport à `.lamoms/tasks.yaml`

Codex lit l'issue, pas `tasks.yaml`. Manquent dans le corps de #13 :

| Manque | Source dans tasks.yaml |
|---|---|
| Critère **DEUX NIVEAUX** (établissement puis comptes, solde d'un établissement = somme, jamais stocké) | T7 critère 2, P28 |
| Critère **rapprochements « à départager » arbitrables par l'utilisateur** | T7 critère 5 |
| Critère **« connu depuis le JJ/MM »**, jamais « aucune transaction avant » | T7 critère 6, P35 |
| Reformulation P29 de la répartition (« la moitié de la réponse ») | T7 critère 3 |
| Dépendance **T4** — l'issue ne liste que T1 | T7 `dependances` |

**Action (Copilot) : resynchroniser le corps de #13 sur T7 de `tasks.yaml`.**

### B3 — Le critère « hors connexion » est infaisable tel qu'écrit

Le critère demande qu'hors connexion — cas explicitement nommé « lorsque le PC hôte est éteint » —
le dernier solde connu s'affiche. Or c'est **le PC hôte qui sert le frontend**. Sans cache d'app
shell, le navigateur n'obtient pas la page : l'utilisateur voit l'écran d'erreur réseau du
navigateur, jamais « solde au 30/07 à 18 h 12 ». Le critère 4 est alors invérifiable.

En face, la décision abandonnée dit « Offline PWA complexe (IndexedDB + Service Worker en stratégie
avancée) — écarté pour sa complexité », tout en précisant qu'« un mode hors connexion minimal reste
au périmètre (T7) ». Le statut de P16 va plus loin : l'atténuation de la limite assumée est
« déjà prévue par la conception ».

Ce qui a été écarté est la *stratégie avancée*, pas le principe. **Il faut trancher explicitement**
(voir D1), sinon Codex arbitrera seul entre deux textes validés qui se contredisent.

---

## 3. Effet papillon — le périmètre de T7 n'est pas que le frontend

Quatre critères de T7 exigent des routes qui **n'existent pas** dans `src/server.ts` :

1. **`GET /transactions` — absent.** L'objectif dit « et ses transactions ». Aucune route ne les lit
   (seul `POST /transactions` existe, ligne 195).
2. **Aucune route pour arbitrer un « à départager ».** La colonne `needs_review` existe
   (`schema.ts:46`), elle est écrite (`server.ts:744`), elle n'est **jamais relue ni modifiable**.
   Le critère dit « c'est lui qui tranche » : il faut au minimum un point d'entrée de résolution.
3. **Aucun signal de premier lancement.** `PUBLIC_PATHS = {"/", "/auth/setup", "/auth/login"}`
   (`server.ts:30`). Le frontend ne peut pas distinguer « jamais configuré » (→ onboarding) de
   « déconnecté » (→ login) autrement qu'en provoquant un 409 sur `POST /auth/setup`. Un
   `GET /auth/state` public rendant `{ configured: boolean }` coûte trois lignes.
4. **Aucun service de fichiers statiques.** Pas de `@fastify/static`, pas de bundler.

**Fraîcheur agrégée — règle à écrire dans le plan, pas à laisser au choix de Codex.**
`GET /balance` (server.ts:380) rend un `updatedAt` **par compte**, aucun au niveau du total. La
fraîcheur de l'agrégat est le `updatedAt` **le plus ANCIEN** de ses comptes, jamais le plus récent :
sinon un total est daté d'aujourd'hui alors qu'un compte n'a pas bougé depuis trois semaines. C'est
le mode de panne que la Core Feature ne tolère pas — un chiffre qui a l'air juste et ne l'est pas.

## 4. Décisions à prendre avant le PRD (Lamoms / Hermès — je ne les prends pas)

| # | Décision | Ma recommandation |
|---|---|---|
| **D1** | Un service worker minimal (app shell en cache-first + dernière réponse `/balance`) entre-t-il au périmètre de T7 ? | **Oui.** ~20 lignes, sans stratégie avancée. Sans lui, le critère 4 est mort et P16 n'a plus d'atténuation. |
| **D2** | Le critère impose IndexedDB pour un unique objet `{solde, date}`. `localStorage` fait la même chose en une ligne. | **Requalifier** le critère en « dernier solde connu persisté côté navigateur avec sa date ». Le mécanisme n'est pas le besoin. |
| **D3** | Où vit le frontend et qui le sert ? | `web/` + Vite → `dist/web`, servi par `@fastify/static`. Un seul processus, portable RPi sans réécriture. |
| **D4** | Les quatre manques d'API (§3) entrent-ils dans T7 ou dans une tâche backend séparée ? | **Dans T7.** Ce sont les conséquences nécessaires de ses critères, pas du hors-sujet — mais le périmètre annoncé de l'issue doit le dire. |
| **D5** | `npm test` = `node --test "src/**/*.test.ts"`. Faut-il un runner frontend ? | **Non au MVP.** Logique métier (agrégation, fraîcheur, formats) en modules TS purs testés par `node --test` ; pas de vitest/jsdom. |

## 5. Risques

- **R1 — collision T7 / T8.** T8 (issue #15, prête) réécrit `src/deduplication.ts` et la règle qui
  pose `needs_review` ; T7 affiche et arbitre ces mêmes marquages. C'est le scénario T5/T6 qui a
  produit la review ROUGE de #12. **Séquencer, ou figer d'abord le contrat de lecture de `needs_review`.**
- **R2 — RÉSOLU le 2026-08-03.** Le recul non commité (`pdfjs-dist ^6.2.108 → ^4.0.379`,
  `@types/node ^26.1.2 → ^22.20.1`) était une tentative de correction d'un problème dont la cause
  était ailleurs (voir §8). Les versions commitées ont été rétablies et validées : `typecheck` passe,
  `npm test` rend 13/13 avec `@types/node 26.1.2` et `pdfjs-dist 6.2.108`. `package.json` et
  `package-lock.json` sont revenus propres.
- **R3 — P29 reste ouvert.** Les exclusions de T7 (catégories, budgets, prévisions, simulateur) ont
  été décidées avant que Lamoms n'énonce son besoin réel. Voie (a) confirmée : on ne change rien.
  Mais T7 ne doit pas être présenté comme réglant P29.
- **R4 — périmètre de jugement.** Conformément à P16, le Verdict juge T7 sur le périmètre annoncé :
  desktop pleinement utilisable, mobile fonctionnel PC allumé, et hors connexion = dernier solde
  connu daté. Pas sur la promesse complète.

## 6. Critères de réussite du brief lui-même

Ce brief est consommé quand : B1 et B2 sont levés par Copilot, et D1 à D5 sont tranchées.
Alors seulement le PRD de T7 (étapes ordonnées, fichiers exacts, périmètre) peut être écrit sans
que Codex ait à arbitrer une contradiction à ma place.

## 8. Cause réelle de l'échec des validations (diagnostiqué le 2026-08-03)

`NODE_ENV=production` est présent dans l'environnement de session. npm en dérive `omit=dev`
(`npm config get omit` → `dev`), donc il **n'installe aucune devDependency**. Les trois manquaient,
pas seulement `@types/node` : `typescript`, `tsx` et `@types/node` étaient **tous** absents — d'où
l'échec simultané de `typecheck`, `lint`, `build` et `test`.

Ce que le diagnostic initial attribuait à tort :

| Hypothèse | Mesure |
|---|---|
| « npm ment sur l'état de node_modules » | Non. `node_modules/.package-lock.json` ne contient aucune entrée `@types` — l'inventaire de npm est exact. « up to date » est vrai *sous* `omit=dev`. |
| « comportement erratique de npm sous WSL / `/mnt/c` » | Non. `NODE_ENV=development npm install --include=dev` a extrait les 7 paquets en 6 secondes, au même emplacement. |
| « `node_modules/.package-lock.json` est une verrue » | Non, c'est le fichier d'inventaire normal de npm. |
| « il faut retirer `types: ["node"]` de tsconfig.json » | Inutile, et ç'aurait masqué la cause en dégradant le projet. |

**Correction ponctuelle (appliquée) :** `NODE_ENV=development npm install --include=dev`.
Résultat : `typecheck` passe, `npm test` rend **13/13**.

**Correction durable (à appliquer par Copilot ou Codex — hors de mon périmètre) :** un fichier
`.npmrc` à la racine du projet contenant une ligne :

```
include=dev
```

Mesuré : `include=dev` neutralise `omit` quel que soit `NODE_ENV`
(`NPM_CONFIG_INCLUDE=dev npm config get omit` → vide). `NODE_ENV=production` n'est écrit dans aucun
profil shell (`~/.bashrc`, `~/.profile`, `~/.npmrc`) : il vient du lanceur de session et reviendra à
chaque session. Sans `.npmrc`, le problème se reproduira — y compris dans chaque worktree, qui a son
propre `node_modules`.

## 7. Contradiction de contexte à signaler

Le contexte de session dit « CARNET DES PROBLÈMES DU PROJET — Aucun problème noté ».
`.lamoms/problems.json` contient **35 problèmes**, dont P29 et P35 actifs et non résolus. Le carnet
injecté n'est pas la source de vérité ; `problems.json` l'est.
