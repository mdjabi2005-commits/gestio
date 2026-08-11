# PRD — le lot annexe

**PRD actif de Gestio, émis le 2026-08-11 par le Planificateur.**
**Base** : la review ROUGE du 2026-08-10 sur T27 (#36), la clôture du cycle 2, et l'inventaire vérifié du 2026-08-11 (`.lamoms/inventaire-methodes.md`).
**Ne préempte pas** le PRD suivant, qui n'existera qu'après #40.

---

## 1. Pourquoi ce lot existe

Trois issues portent le label `post-prd` et **aucun milestone** : #38, #39, #40. Elles sont nées après la clôture du cycle 2 et n'appartiennent à aucun PRD. Sans document qui les tienne, « annexe » finit par vouloir dire « jamais » — et deux d'entre elles ne sont pas cosmétiques : **M3 fausse des données qui sont en base aujourd'hui**, et **F7 dégrade la qualification en production**.

Ce lot n'ajoute aucune fonctionnalité. Il ferme ce que le cycle 2 a laissé ouvert et il **remet l'application dans un état où elle peut être éprouvée pour de vrai**. C'est sa seule raison d'être.

## 2. Ce qui est acquis et ne se rouvre pas

- La qualification de T27 rejoue à l'identique sur l'oracle : 191 paires, 605 décisions.
- Le cycle 2 est clos par verdict VERT, fusion vérifiée par `git merge-base --is-ancestor issue-36 main`.
- La suite est verte : 40 tests, 39 pass, 1 skip explicite, 0 fail ; lint, typecheck, build à 0.
- Les huit soldes justes sur neuf du 2026-08-04 restent la seule mesure d'usage réel qui existe.

## 3. Objectif

**Qu'on puisse enfin éprouver l'application en situation réelle, et que ce qu'elle affiche des données existantes soit vrai.**

À la fin de ce lot :
1. La qualification n'est plus dégradée par une configuration absente.
2. Les données Nickel déjà en base sont qualifiées comme les nouvelles.
3. Un relevé Trade Republic ne peut plus faire échouer un import entier à cause d'un produit inconnu.
4. La mise en service n°2 a produit une liste de constats datés, qui devient le PRD 3.

## 4. Périmètre — les trois issues

### #40 — Mise en service n°2 *(aucune ligne de code)*

Éprouver les seize tâches livrées après le 2026-08-04, qui n'ont jamais servi. Protocole en 12 étapes, règle du 2026-08-04 reprise telle quelle : **on ne corrige rien en cours de route**. Produit une liste de constats datés — compte, chiffre attendu, chiffre affiché.

C'est **l'issue centrale du lot**. Les deux autres existent pour qu'elle soit possible, ou pour ce qu'elle révélera.

### #38 — Corrections T27 *(du code)*

| Constat | Ce qu'il casse aujourd'hui | Quand |
|---|---|---|
| **F7** — `GESTIO_PERSONAL_NAMES` vide dans `.env.example` | en production, un virement vers soi retombe en « externe probable » au lieu de « à vérifier » (P30 dégradé) ; en test, l'oracle se `skip` | **avant #40** — sans elle, l'étape 8 ne prouve rien |
| **M3** — les transactions Nickel importées avant T27 portent `qualification_label` NULL | un ancien virement Nickel dont la description ne contient pas « VIREMENT » reste compté comme une dépense. **Données actuelles, pas hypothétiques** | ampleur mesurée pendant #40, correction après |
| **M1** — un produit Trade Republic ni COMPTE COURANT ni COMPTE PEA fait échouer l'import **entier** | régression : avant T27 le produit était exclu et listé dans `excludedProducts` | avant ou pendant #40 — **peut bloquer l'étape 7** |
| **M2** — l'IBAN du PEA n'est pas lu depuis son segment | tous les comptes TR reçoivent l'IBAN du préambule ; un virement portant l'IBAN réel du PEA perd la preuve certaine | après #40 |
| **F5** — reconnaissance du nom indépendante de l'ordre | faux positifs possibles sur un libellé de tiers contenant un mot du nom | à documenter ou resserrer ; #40 étape 8 cherche un cas réel |
| **F6** — message d'erreur TR qui dit « compte courant » même pour un PEA | lisibilité | après #40 |

### #39 — Nettoyage T27 *(du code, sans effet observable)*

F1 `excludedProducts` résidu mort dans trois fichiers · F2 tolérance d'appariement à 4 jours quand le plan disait ±3 · F3 échelle de scores 120/110/100/90/80/60/50 quand le plan documentait 100/80/60 · F4 variable de boucle nommée `number`.

Aucun de ces quatre points ne change un chiffre affiché. Ils alignent le code sur ce qui a été écrit, ou l'inverse — **et l'arbitrage entre les deux appartient à Lamoms pour F2 et F3** : soit le code a raison et le plan se corrige, soit le plan avait raison et l'oracle doit être rejoué après changement.

## 5. Ordre

```
F7 (configuration, pas du code)
        ↓
      #40  ── mise en service n°2, 12 étapes ──▶ constats datés ──▶ PRD 3
        ↓
   #38 (M3, M2, M1 si non déjà fait, F5, F6)
        ↓
      #39  (à tout moment, aucune dépendance)
```

**F7 avant #40** parce que c'est un prérequis de mesure, pas une correction. **M1 avant #40 si l'étape 7 le heurte** — auquel cas le parcours s'arrête là et M1 devient la tâche suivante, conformément à la règle du protocole. Tout le reste attend les constats, parce qu'une correction écrite avant la mesure corrige une supposition.

## 6. Critères d'acceptation

Chaque critère dit aussi **ce qu'il préserve**, sans quoi une régression le satisfait.

1. **F7** — le `.env` réel porte `GESTIO_PERSONAL_NAMES` renseignée, `.env.example` explique à quoi elle sert et ce qui se dégrade sans elle. *Préserve* : la variable ne se code jamais en dur, elle reste de la configuration.
2. **M3** — après rattrapage, un virement Nickel importé avant T27 est reconnu comme les nouveaux. *Préserve* : aucune transaction supprimée, aucun `fingerprint` modifié, l'oracle rejoue à l'identique (191 paires, 605 décisions).
3. **M1** — un relevé Trade Republic portant un produit inconnu s'importe, et le produit non importé est **compté et nommé** dans le compte rendu. *Préserve* : le compte courant et les PEA entrent exactement comme aujourd'hui.
4. **M2** — l'IBAN lu pour un PEA est celui de son segment. *Préserve* : l'IBAN du compte courant ne change pas, et le pays n'est jamais codé en dur.
5. **#40** — le parcours est allé aussi loin que possible, chaque étape porte un fait ou un constat, et **aucune correction n'a été faite en cours de route**. Un parcours interrompu par un blocage dur est un succès s'il nomme le blocage.
6. **Sur tout le lot** — `npm test` reste vert avec un **décompte de tests non nul** (jamais un vert nu), lint, typecheck et build à 0.

## 7. Ce qui n'entre pas

- Toute fonctionnalité nouvelle. Les manques d'usage — écran de revue des qualifications, filtre de période, gestion des connexions, parcours de premier import — sont le **PRD 3**, et ils s'écriront à partir des constats de #40, pas avant.
- Les trois blocages d'interface mesurés le 2026-08-11 : clé `localStorage` unique, absence de champ IBAN à la saisie, absence de toute méthode HTTP pour contester une qualification. Ils sont **observés** pendant #40, pas réparés — leur réparation appartient au PRD 3.
- La règle « 0 vs inconnu » pour un compte sans solde déclaré (D5, non tranchée). #40 dira si le cas se présente réellement.

## 8. Risques

- **Le parcours #40 se bloque tôt** — c'est un résultat, pas un échec ; le blocage devient la tâche suivante. C'est exactement ce qui s'est passé le 2026-08-04 et c'est ce qui a donné sa valeur au cycle 2.
- **M3 se révèle plus large que Nickel** — le rattrapage toucherait alors d'autres sources. À mesurer avant d'écrire quoi que ce soit.
- **F2 et F3 rouvrent l'oracle** — changer la tolérance ou l'échelle de score oblige à le rejouer et à revalider les 605 décisions. C'est pourquoi ce sont des arbitrages, pas des corrections.
- **Le corpus glisse** — le plancher de l'API avance d'un jour par jour (P35). Un relevé non téléchargé pendant que le lot se déroule ouvre un trou définitif.

## 9. La quatrième annexe

Il n'y en a pas aujourd'hui, et il ne faut pas en inventer une. **Elle est réservée au premier blocage dur que #40 rencontrera** : le protocole dit qu'un blocage arrête le parcours et devient la tâche suivante. Cette tâche-là n'appartiendra pas au PRD 3 — elle appartiendra ici, parce qu'elle empêchera de finir la mesure.
