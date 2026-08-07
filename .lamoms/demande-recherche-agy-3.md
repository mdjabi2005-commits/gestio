# Demande de recherche AGY (3) — la forme du relevé Trade Republic

**Émise le** 2026-08-07 par le Planificateur, pour **T26** (problème **P55**).
**Nature** : mesure de format sur un PDF local. **Aucun appel bancaire, aucun développement.**
**Ne remplace pas** `.lamoms/demande-recherche-agy-2.md` (round 2, clos) — sujet différent.

---

## Pourquoi cette demande

T26 doit ajouter un **troisième format** à `parsePdfStatement`. Je sais pourquoi il le faut et je sais
où il s'insère. **Je ne sais pas à quoi ressemble le document**, et un parseur de PDF ne se planifie pas
sur une intuition : il se planifie sur des ancres textuelles et des positions de colonnes relevées dans
le fichier réel. Écrire les étapes de T26 sans ces mesures serait une supposition, et Codex heurterait
un mur au premier `match()`.

**Ce qui est déjà établi, et qu'il ne faut pas rechercher** :

| Fait | Source |
|---|---|
| Trade Republic est entrée en base par l'API (T13), mais sa fenêtre API est **courte** | P44, T13 fusionnée |
| Son relevé se génère **sur une période choisie** — même mécanique que La Banque Postale et Nickel, aucun recollement de périodes n'est nécessaire | vérifié par Lamoms le 2026-08-07 |
| L'unique PDF du corpus est un **échantillon de format**, pas un manque de couverture | idem |
| `parsePdfStatement` refuse tout en-tête autre que LBP et Nickel | `src/pdf-import.ts`, ancre `"Format PDF non reconnu"` |

---

## Cadre

**Lecture seule, sur un fichier local. Aucune session bancaire n'est touchée.**
Aucune contrainte de quota, aucun SCA, aucune expiration de consentement — cette demande ne
ressemble pas au round 2.

### Le fichier

```
/mnt/c/Users/djabi/Documents/relevé pdf/trade republic/Relevé de compte.pdf
```

### Contraintes dures

- ⚠️ **Le dépôt gestio est PUBLIC, et ce fichier est un relevé bancaire réel.** Il ne se copie pas
  dans le dépôt, ni entier, ni en extrait. Scripts et sorties brutes dans `.lamoms/lab/agy/`
  (gitignoré), comme au round 2.
- ⚠️ **Dans le rapport : les montants, l'IBAN, le numéro de compte et le nom du titulaire sont
  masqués.** Ce qui se cite en clair, et qui est l'objet même de la demande, c'est la **structure** :
  libellés d'en-tête, formats de date, positions de colonnes, présence ou absence d'un champ.
  En cas de doute sur une chaîne, la masquer — une ancre se décrit sans sa valeur.
- **Ne pas écrire le parseur.** C'est le travail de Codex, sur le plan que j'écrirai à la réception
  de ce rapport. AGY ne modifie aucun fichier de `src/`.
- **Un essai borné dans `.lamoms/lab/agy/` est le bienvenu** — un script qui dépile `pdfjs` et
  imprime les items est la façon la plus directe de répondre à Q1, Q4 et Q5.

### Le modèle à reproduire — ce que le parseur devra rendre

Le rapport doit permettre de remplir **cette forme**, définie dans `src/pdf-import.ts` :

```ts
type PdfStatement = {
  institution: …;          // une valeur nouvelle, à ajouter
  periodStart: string;     // ISO
  periodEnd: string;       // ISO
  accounts: [{
    key: …;                // une valeur nouvelle, à ajouter
    name: string;
    balanceDate: string;
    closingBalanceCents: number;
    openingBalanceCents?: number;   // optionnel — c'est Q5
    transactions: [{ transactionDate, label, amountCents }]
  }]
}
```

**La référence de travail est `parseNickel`** (`src/pdf-import.ts`, ancre `function parseNickel`) :
un compte, une période lue au texte, des totaux mensuels, un contrôle d'équilibre. C'est la forme
la plus proche de ce qu'on attend d'un relevé Trade Republic. Le lire avant de mesurer fait gagner
la moitié du travail.

**Le parseur travaille sur des `items` positionnés, pas sur du texte plat.** `pdfjs` rend des items
`{ text, x }` regroupés en lignes par leur `top`. `nickelTransactions` s'appuie sur des **seuils de
colonnes en dur** (`x >= 480` pour le montant, `250 ≤ x < 480` pour le libellé). C'est pourquoi Q4
demande des **positions**, pas seulement un exemple de ligne.

---

## Q1 — Le PDF a-t-il une couche texte ?

Charger le fichier avec le même `pdfjs` que le produit (`pdfjs-dist/legacy/build/pdf.mjs`) et rendre
le nombre d'items texte par page.

**Ce que j'en fais** : si la couche texte est absente ou vide, **T26 n'est pas la tâche que j'ai
prévue** — elle deviendrait un sujet d'OCR, qui est un autre projet et une autre décision de Lamoms.
Réponse binaire, mais elle décide de tout le reste.

## Q2 — Quelle chaîne identifie le document de façon sûre ?

`parsePdfStatement` reconnaît les formats par une conjonction d'en-tête : `"LA BANQUE POSTALE"` +
`"COMPTE COURANT POSTAL"`, `"NICKEL"` + `"PAIEMENTS ELECTRONIQUES"`.

Rendre **la ou les chaînes** qui jouent ce rôle pour Trade Republic, **au caractère près**, avec leur
page et leur position.

**Ce que j'en fais** : c'est l'ancre de reconnaissance. Une chaîne trop générique ferait reconnaître
un relevé Trade Republic dans un document qui n'en est pas un ; trop spécifique, elle casserait à la
prochaine refonte de mise en page. **Signaler si aucune chaîne ne paraît stable** — c'est un constat
utile, pas un échec.

## Q3 — Comment la période est-elle écrite ?

Nickel écrit `Du JJ/MM/AAAA au JJ/MM/AAAA`. La Banque Postale n'écrit pas de période du tout : elle
se déduit de `Ancien solde au …` / `Nouveau solde au …`.

Rendre la forme exacte chez Trade Republic, **au caractère près**, et dire si elle est **explicite**
(une phrase de période) ou **déduite** (des dates de solde).

**Ce que j'en fais** : `periodStart` et `periodEnd`. Et si la période est explicite, elle donne aussi
le moyen de vérifier qu'un relevé régénéré couvre bien ce qu'on croit.

## Q4 — Quelle est la forme d'une ligne de mouvement ?

**La question la plus importante.** Rendre, pour **trois** lignes de mouvement représentatives
(un débit, un crédit, et un libellé qui déborde sur plusieurs lignes s'il en existe) :

- le format de la date et sa position `x` ;
- la position `x` du libellé — début et fin ;
- la position `x` du montant ;
- **débit et crédit : deux colonnes distinctes, ou une seule colonne signée ?** LBP utilise deux
  colonnes et déduit le signe de la position (`amount.x < (debit + credit) / 2`) ; Nickel utilise une
  colonne signée. C'est une bifurcation directe dans le code ;
- **un libellé peut-il occuper plusieurs lignes ?** Les deux parseurs existants ont chacun leur
  mécanique de recollement (LBP par plage verticale, Nickel par distance ≤ 15) ;
- **existe-t-il une ligne parasite** — en-tête répété, pied de page, total intermédiaire — qui
  ressemble à un mouvement et qu'il faudra exclure ?

**Ce que j'en fais** : les seuils de colonnes en dur du futur `tradeRepublicTransactions`, et la
règle d'ancrage. Sans les `x`, ces seuils seraient inventés.

## Q5 — Le relevé porte-t-il un solde d'ouverture, un solde de clôture, ou des totaux ?

Dire lesquels de ces éléments existent, avec leur libellé exact : ancien solde, nouveau solde, total
des débits, total des crédits, solde disponible à une date.

**Ce que j'en fais, et c'est structurant** : LBP et Nickel font tous deux un **contrôle
d'équilibre** — `verifyArithmetic` pour LBP, comparaison aux totaux mensuels pour Nickel. C'est ce
contrôle qui fait qu'un mouvement mal lu **lève une erreur** au lieu d'entrer silencieusement en
base. Trade Republic n'a **aucune API qui donne son solde au-delà de sa fenêtre courte** : si le
relevé ne porte aucun solde, ce format sera le **seul** des trois sans filet, et le plan de T26 devra
le dire explicitement plutôt que le laisser découvrir. **Ne pas inventer un contrôle qui n'existe
pas dans le document.**

## Q6 — Un IBAN de compte figure-t-il sur le relevé ?

Dire s'il y en a un, **où**, et sous quelle forme — Trade Republic est allemande, donc IBAN `DE` de
**22 caractères** ; préciser s'il est écrit d'un bloc ou espacé par groupes.

**Ce que j'en fais** : **T27**, pas T26. L'IBAN est le niveau de preuve le plus fort de
l'appariement des virements internes (score 100, « confiance certaine »). Si le relevé Trade Republic
ne le porte pas, l'appariement La Banque Postale ↔ Trade Republic retombera sur le niveau
« banque nommée dans le libellé » (60) et le critère 1 de T27 devra en tenir compte. **Masquer la
valeur, décrire la forme.**

## Q7 — Un relevé régénéré sur une autre période a-t-il la même structure ?

**Demande un geste de Lamoms** : produire un second relevé sur une période différente, de préférence
un mois qui contient peu de mouvements.

Comparer les deux sur les réponses Q2 à Q6 et dire ce qui **varie**.

**Ce que j'en fais** : c'est ce qui décide si T26 livre un parseur ou un parseur **plus une fixture
de non-régression**. Et c'est la seule façon de savoir si les positions de colonnes de Q4 sont
stables ou dépendantes du contenu. **Si Lamoms ne peut pas produire ce second relevé, répondre aux
six autres questions et le signaler** — je planifierai avec cette incertitude nommée plutôt que de
l'ignorer.

---

## Ce que le rapport doit contenir

- Une réponse par question, dans cet ordre, chacune **mesurée** et non déduite.
- **Les chaînes d'ancrage citées au caractère près**, accents et espaces compris — c'est ce que
  Codex recopiera dans un `match()`.
- **Les positions `x` en nombres**, pas en descriptions.
- Ce qui n'a **pas** pu être mesuré, dit comme tel. Une incertitude nommée se planifie ; une
  incertitude tue devient un mur pour Codex.
- Le chemin des scripts et des sorties brutes dans `.lamoms/lab/agy/`.
- **Aucun montant, aucun IBAN, aucun nom, aucun numéro de compte en clair.**

**À la réception, j'écris le plan de T26.** Tant qu'il n'est pas arrivé, la section T26 de
`.lamoms/tasks.md` reste marquée « plan non écrit » et **aucune issue ne s'ouvre**.
