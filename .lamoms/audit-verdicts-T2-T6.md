# Audit des verdicts T2 → T6

Auteur : Claude. Date : 2026-08-03. Déclencheur : un faux VERT constaté sur T1, donc angle mort
possible sur les verdicts suivants (règle « Verdict relisible », AGENTS.md).

Méthode : la règle 6 appliquée rétroactivement. Pour chacun des 50 critères, chercher **l'observation
citable** qui le prouve. Un critère sans preuve rejouable n'est pas VERT, quel qu'ait été le verdict.

Périmètre réellement couvert, sans exagération : passe de couverture sur les 50 critères, puis
vérification approfondie des plus risqués (T3 en entier, le flux principal de T4, les critères de
T2/T5/T6 qui nomment des données réelles). Je n'ai pas rejoué les 22 critères de T4 un par un.

---

## Résultat en une ligne

**Aucun faux VERT de la gravité de T1.** Mais un motif systémique, présent dans trois tâches sur
cinq : **les critères qui nomment des données réelles de référence sont prouvés sur des données
fabriquées, ou sur une preuve qui disparaît en silence.**

---

## F1 — T6 : cinq critères sur huit reposent sur des tests qui s'ignorent eux-mêmes

`src/pdf-import.test.ts:25` — `skip: !existsSync(bpDirectory) || !existsSync(nickelDirectory)`
`src/pdf-import.test.ts:49` — `skip: !bpFiles.length`

Le corpus vit hors du dépôt (`/mnt/c/Users/djabi/Documents/relevé pdf`). Sur toute machine qui ne
l'a pas, les deux tests se désactivent et la suite **rend vert**.

Preuve, exécutée :

```
$ GESTIO_PDF_CORPUS=/nonexistent npm test
﹣ parses and balances every real La Banque Postale and Nickel statement # SKIP
﹣ imports a multi-account statement atomically and remains idempotent   # SKIP
ℹ pass 11   ℹ fail 0   ℹ skipped 2
```

`fail 0`, sortie en succès. Critères qui perdent alors toute preuve : T6 c3 (ventilation
multi-comptes), c4 (arithmétique ancien solde + mouvements = nouveau solde), c5 (Livret A alimenté
par relevé), c6 (les 12 relevés de référence), c7 (Nickel comme second format). Restent prouvés sans
corpus : c2 (refus d'un PDF sans couche texte) et c8 par la voie CSV.

**Ce motif a déjà été jugé inacceptable par le projet** — critère de T8 : « Le binaire sqlcipher
manquant fait ÉCHOUER le test, il ne le fait pas passer en silence. Un test qui s'ignore lui-même
quand l'outil manque ne prouve rien et se contente de rassurer. » Même antipatron, autre sujet, et
il est passé VERT dans T6.

Conséquence rattachée à une contrainte validée — « backend et données sur RPi : portabilité PC→RPi
sans réécriture ». Sur le Raspberry Pi, `npm test` sera vert et ne prouvera rien de l'import PDF.

Nuance à ne pas perdre : **sur cette machine, les tests tournent réellement et les critères sont
bel et bien prouvés** (13/13, `skipped 0`). Ce n'est pas un défaut de code, c'est une preuve non
portable.

## F2 — T2 c4 : le rejeu de référence n'a aucune preuve rejouable

Le critère exige : « 27 mouvements CSV contre 27 transactions API, 27 rapprochements, 0 orphelin de
chaque côté. »

`src/deduplication.test.ts` (89 lignes) ne contient aucune occurrence de `27` et travaille sur des
jeux fabriqués de deux transactions. Le rejeu du lab est une opération manuelle, hors dépôt.

Il a probablement été fait — mais il n'est pas re-jouable depuis le dépôt, donc pas citable.

Conséquence directe et actuelle : **T8 s'appuie dessus comme filet de non-régression** — « après le
changement, le rejeu du lab rend toujours 27 rapprochements, 0 orphelin et 0 à départager dans les
DEUX ordres de canaux ». Le filet de T8 repose donc sur une mesure manuelle que personne ne peut
rejouer automatiquement.

## F3 — T5 c1 : le registre de formats est prouvé sur des CSV fabriqués

Le critère nomme les fichiers réels : « les deux CSV réels du lab servent de référence ».
`src/csv-import.test.ts` n'ouvre aucun fichier — pas d'`existsSync`, pas de chemin de corpus, les
deux formats sont écrits en ligne dans le test.

Le test prouve que le registre gère deux formats. Il ne prouve pas qu'il gère **ces** fichiers-là.
Plus faible que F1, même famille.

## F4 — Conformes mais non prouvés (risque de régression, pas défaut)

Vérifiés dans le code, corrects, sans test qui les couvre :

| Critère | Code conforme | Manque |
|---|---|---|
| T4 c22 — la synchro de fond ne porte PAS les en-têtes PSU | `server.ts:56` passe `{}` | seule la moitié « la synchro utilisateur les porte » est testée (`enable-banking.test.ts:156-157`) |
| T4 c12 — l'horizon connu n'est jamais reculé | `server.ts:775-779`, `CASE ... WHEN ? < known_since` | la valeur est vérifiée une fois (`:173`), jamais sa non-régression |
| T4 c10 — écriture page par page | transaction SQLite dans la boucle, `server.ts:721-746` | aucun test de plantage en cours de pagination |

Rien à corriger. À savoir : ces trois comportements ne sont tenus que par le code, pas par un filet.

---

## Ce que j'ai vérifié et trouvé solide

- **T3, les 6 critères.** Argon2id (`server.test.ts:43`), session expirée refusée (`:148-150`),
  déconnexion effective (`:157-160`), aucun secret en clair dans la base ni le WAL (`:137-144`), base
  chiffrée (`:146`), rien en clair dans les logs (`:161-163`). C'est la tâche la mieux prouvée du lot.
  Réserve unique : « ni dans une sauvegarde exportée » (c4) n'est pas couvert — mais T8 le traite déjà.
- **T4, flux principal.** Pattern out-of-band, épuisement de la pagination jusqu'à disparition de la
  clé (`enable-banking.test.ts:149-155`), tous les paramètres renvoyés avec la clé de continuation,
  `strategy=longest` au premier passage puis `default`, plafond `maximum_consent_validity`
  (`:135-136`), devise issue du solde (`:172`), 429 rendu comme état normal avec dernier succès
  (`:195-197`), modèle à deux niveaux (`:200-210`).
- **T2 hors c4.** Clé (date, centimes) FIFO, Jaccard en départage, cas zéro sans libellé, marquage à
  départager, idempotence — tous couverts par des tests réels.

## Constat de fond

Le projet connaît déjà ce piège : **P11** dit que le « 27/27, Jaccard 98,6 % » du rapport de
faisabilité comparait un jeu **fabriqué**, pas une lecture d'API. La même confusion entre donnée
réelle et donnée fabriquée est ressortie dans trois verdicts sur cinq.

Ce n'est donc pas un accident de relecture : c'est le point aveugle par défaut du projet, et il
mérite d'entrer dans les critères plutôt que d'être redécouvert à chaque fois.

## Proposition — T9

Ni urgent ni bloquant pour T7. À arbitrer par Lamoms, je ne l'inscris pas seul.

1. Un test qui exige des données hors dépôt **échoue** quand elles manquent, sauf variable
   d'environnement explicite du type `GESTIO_SKIP_CORPUS=1`. Le silence par défaut disparaît.
2. Le rejeu de référence de T2 (27/27/0) devient un test à part entière, lisant le lab par chemin
   absolu, et échouant s'il est absent. C'est le filet dont T8 dépend déjà.
3. Les trois comportements de F4 reçoivent un test chacun.
