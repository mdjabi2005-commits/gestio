# Tâches — PRD final « Finir Gestio »

**Source unique : `.lamoms/prd.md`** (§6 les lots, §7 l'ordre, §8 les critères du PRD entier), amendé une troisième et dernière fois le 2026-08-13 — décisions 38 à 50. **Ce fichier ne décide rien** : il met le PRD en tâches recopiables telles quelles par Copilot dans une issue.

> **Comment il s'utilise** *(méthode arrêtée par Lamoms le 2026-08-13)*
> - Le PRD donne **un milestone**, un seul, qui porte tout ce fichier.
> - **Ici vit le contrat** de chaque tâche : problème, périmètre, ne pas toucher, dépend de, critères, préserve, recette. C'est ce qui ne bouge pas, et c'est la référence si une issue dérive.
> - **Le déroulé** — les étapes `- [ ]` que Codex coche — est écrit par le Planificateur **au moment où la tâche part**, et copié dans **le corps de l'issue**. Jamais d'avance : le code d'aujourd'hui n'est pas celui que la sixième tâche trouvera. Aucun fichier du dépôt ne le porte.
> - **Chaque fin de tâche est un point d'arrêt** : verdict, fusion vérifiée, acquis consignés, dépendances recalculées depuis `origin/main`, puis le plan suivant. **Un problème découvert pendant une recette devient la tâche suivante** — il ne se répare pas dans la tâche en cours.

## La tâche principale, dont toutes les autres dépendent

> **T37 — Mise en service n°3, étapes 0 à 12.** C'est elle qui prouve la première phrase du §1, et elle ne contient aucune ligne de code. Les treize tâches du lot A sont **les portes qui l'empêchent d'aboutir** : deux parcours sont déjà morts, l'un à l'étape 7, l'autre à l'étape 2. Chaque tâche du lot A nomme l'étape du protocole qu'elle débloque, et se termine par sa recette de deux minutes (R4) qui **remonte le protocole jusqu'à cette étape**.

## Ordre

```
Lot 0   relevé LBP émis le 2026-08-08 + rotation de la clé Enable Banking   ← humain, avant le 2026-10-06
   │
Lot A   T31 ▸ T33 ▸ T43a ▸ T43b ▸ D5 ▸ T45a ▸ T45b ▸ [geste humain] ▸ T34 ▸ T44 ▸ T35 ▸ T36 ▸ T38 ▸ T42
   ↓     treize tâches EN SÉRIE — toutes touchent src/server.ts et web/src/main.jsx
Lot B   T37 — le parcours, un seul, étapes 0 à 12
   ↓
Lot C   T39 ▸ T47 ▸ T48 ▸ T46      (cadrés au PRD, PLANS NON ÉCRITS — ils attendent les constats de T37)
   ↓
Lot D   T41 (obligatoire) · T40 (seulement si T37 se bloque une troisième fois)
Lot E   T32 — à tout moment, aucune dépendance
```

**Le geste humain intercalé, une seule fois** *(décision 44)* : `npm run backup`, puis `data/gestio.db` → `data/gestio-avant-onboarding.db`, rotation de la clé, trois ré-authentifications, corpus réimporté (25 fichiers), Revolut resynchronisé. **On renomme, on ne vide pas** : `restore.sh` n'arrive qu'à T36.

## Règles qui s'appliquent à toutes les tâches

- **R1** — une livraison n'est prouvée que par un usage, jamais par un vert. Une méthode livrée sans appelant n'est pas livrée.
- **R4** — chaque tâche se termine par une **recette de deux minutes faite par Lamoms sur l'application réelle**, qui remonte le protocole jusqu'à l'étape débloquée. Une tâche sans recette n'est pas VERTE.
- **La logique va dans le fichier qui est testé** : tout ce qui n'est pas de l'affichage va dans `src/ui-logic.ts` **avec son test** ; `web/src/main.jsx` ne garde que le JSX et les appels réseau. Aucun fichier neuf, aucune dépendance neuve.
- **`src/qualification-oracle.test.ts` est INTOUCHABLE** sur tout le PRD.
- **Ligne de base mesurée le 2026-08-13** : `npm test` avec `--env-file=.env` sort **40 tests · 40 pass · 0 skip · 11,2 s**, rejeu des 606 décisions compris. Tout *Préserve* qui dit « l'oracle rejoue à l'identique » vise ce résultat.
- **Le dépôt GitHub est PUBLIC** : aucun libellé, IBAN ou nom dans une issue, un commentaire ou un commit. Ce qui remonte, c'est un décompte et une position.
- **Repères par symbole**, jamais par numéro de ligne.

---

# Lot A — les portes

## T31 — Le libellé qui déborde, et le test qui dormait *(#38 — étape 7)*

**Problème résolu** : le parseur colle à un mouvement du texte de la ligne suivante ; le libellé faux part dans la qualification. Et le rejeu des 606 décisions se saute en silence, faute que `npm test` lise `.env`.

### Périmètre
- `src/pdf-import.ts` — la borne de fenêtre dans `lbpTransactions`, et le message d'erreur Trade Republic (F6)
- `package.json` — le script `test` reçoit `--env-file=.env`

### Ne pas toucher
`src/qualification.ts`, `src/schema.ts`, `src/server.ts`, `src/db.ts`, `web/src/main.jsx`, et **aucun fichier de test**. Si une assertion existante devait changer, s'arrêter et le signaler.

### Dépend de
Aucune. **Première tâche du PRD.**

### Critères d'acceptation
- [ ] Les **24 mouvements** dont le libellé déborde sont relevés fichier par fichier, avant/après, et chacun garde **son texte propre entier** — la liste reste **locale**, seul le décompte remonte
- [ ] Le rejeu sort toujours **191 paires et 606 décisions**
- [ ] Le décompte de mouvements par document reste égal à `expected_raw_movements` sur les 26
- [ ] `npm test` → **40 pass, 0 skip** ; lint, typecheck et build à 0
- [ ] F6 : le message d'erreur Trade Republic nomme le produit réellement lu

### Préserve
Aucune transaction supprimée, aucune ligne existante réécrite en base ; Nickel et Trade Republic rendent les mêmes chiffres qu'avant ; l'oracle rejoue à l'identique.

### Recette *(Lamoms, avant le verdict)*
Importer **un** relevé du mois, puis retrouver à l'écran un mouvement corrigé et lire son libellé : il s'arrête où il doit. *(Les relevés LBP n'ont aucune extension : basculer sur « Tous les fichiers ».)*

---

## T33 — L'IBAN entre tout seul

**Problème résolu** : aucun compte ne porte d'IBAN alors que la preuve par IBAN est le deuxième meilleur score du moteur, et que l'API le donne déjà. Et quatre comptes Revolut portent la même chaîne de nom, donc rien ne les distingue à l'écran.

### Périmètre
- `src/db.ts` — colonne `display_name`, additive, posée par le `addColumn` existant
- `src/enable-banking.ts` — lire `account_id.iban`, le poser sans jamais écraser
- `src/server.ts` — `PATCH /accounts/:id` `{ name?, iban?, displayName? }`, IBAN normalisé par `normalizeIban`
- `web/src/main.jsx` — le `display_name` distingue les comptes ; **le formulaire d'ajout envoie enfin l'IBAN**
- `src/ui-logic.ts` + son test — toute décision d'affichage qui en découle

### Ne pas toucher
Le sélecteur d'import : il est réécrit une seule fois, par T43b.

### Dépend de
T31 (série). Prérequis de T43a et T43b.

### Critères d'acceptation
- [ ] Après une synchro et un ré-import, **chaque compte atteignable porte son IBAN sans qu'on ait rien tapé** ; un compte qui n'en a pas n'en invente pas
- [ ] Un IBAN **modifié** est affiché, pas appliqué ; un IBAN **partagé** ne produit **aucun** message *(trois comptes Trade Republic en partagent un, c'est mesuré et légitime)*
- [ ] Aucun index unique sur `iban`
- [ ] `npm test` → 40 pass, 0 skip

### Préserve
La synchro n'écrase pas `name` ; aucun `accountId` ne change ; l'oracle rejoue à l'identique.

### Recette
Créer un compte par l'interface **en tapant son IBAN** (étape 2), synchroniser (étapes 3 à 5), puis retrouver les quatre Revolut à l'écran et vérifier qu'on les distingue. *(Le renommage appartient à T45a.)*

---

## T43a — Le relevé rend les comptes qu'il trouve *(aucun effet visible)*

**Problème résolu** : `accountKey` saute en silence ce qu'il ne reconnaît pas, et `parseBanquePostale` **exige les trois comptes** — fermer un livret ferait échouer tous les imports.

### Périmètre
- `src/pdf-import.ts` — le relevé rend ses segments tels qu'il les a trouvés, avec leur nom imprimé et leur IBAN quand il y est ; `accountKey` devient un repli interne ; un segment non reconnu est **compté et nommé** ; **M1** (un produit Trade Republic inconnu ne fait plus échouer l'import entier) et **M2** (l'IBAN du PEA vient de son segment)
- `src/pdf-import.test.ts` — il porte aujourd'hui l'exigence des trois comptes que cette tâche supprime

### Ne pas toucher
Le contrat de `src/server.ts`, `web/src/main.jsx`, `src/qualification-oracle.test.ts`, la reconnaissance de format et la lecture de mise en page.

### Dépend de
T33 (série).

### Critères d'acceptation
- [ ] Un relevé LBP amputé d'un de ses comptes s'importe quand même
- [ ] Un segment inconnu est **nommé** au lieu d'être sauté
- [ ] Les sept chiffres de référence ne bougent pas d'une unité : **CCP 299, Livret A 45, Livret Jeune 6**, IBAN lus **12 / 11 / 2**, **Nickel 54**, et l'arithmétique Trade Republic vérifiée par `verifyTradeRepublicTotals`
- [ ] **Sur chaque segment de chaque relevé : `ouverture + Σ mouvements = clôture`** — plancher mesuré à 25 segments sur 25 ; tout écart est nommé avec son fichier et son compte

### Préserve
L'atomicité SQL et le refus sur correspondance ambiguë ne bougent pas ; l'oracle rejoue à l'identique.

### Recette
**Aucune — exception à R4 acceptée par Lamoms** : la tâche ne change rien à l'écran, sa preuve est le corpus, chiffre à chiffre.

---

## T43b — L'import se rapproche tout seul, par IBAN *(étape 7)*

**Problème résolu** : le formulaire demande sept correspondances en dur, pour tous les formats à la fois, avec des comptes homonymes. C'est le mur du 2026-08-11.

### Périmètre
- `src/server.ts` — **`POST /imports/pdf/detect`**, même charge utile, **n'écrit rien**, rend par fichier l'établissement reconnu et ses segments (nom imprimé, IBAN, compte proposé) ; `POST /imports/pdf` garde son contrat avec la correspondance confirmée ; rapprochement **par IBAN puis par nom imprimé**, borné aux comptes de l'établissement détecté ; `PdfAccountKey` sort du contrat public ; confirmer une correspondance écrit le nom imprimé dans `display_name` **s'il est vide**
- `web/src/main.jsx` — `pdfAccountKeys` disparaît ; le filtre `accept="application/pdf,.pdf"` part (il masque les 13 relevés LBP sans extension) ; le navigateur garde les fichiers entre les deux appels
- `src/ui-logic.ts` + son test — le classement et la proposition de correspondance
- `src/imports-pdf-corpus.test.ts` — **fichier neuf**

### Ne pas toucher
`src/pdf-import.ts` (T43a l'a fait) ; `src/qualification-oracle.test.ts`.

### Dépend de
T43a (vraie dépendance : le parseur doit rendre ses comptes avant que l'import sache les rapprocher).

### Critères d'acceptation
- [ ] Un import mensuel ne demande une correspondance que pour un compte **dont ni l'IBAN ni le nom imprimé ne rejoignent un compte connu de cet établissement** ; les autres se rapprochent seuls, Trade Republic compris dès le deuxième import
- [ ] Un rapprochement qui trouve **plusieurs** candidats **demande** au lieu de choisir
- [ ] `git grep` ne rend aucun nom **désignant un compte réel** dans `web/` ni dans le contrat serveur
- [ ] Le test neuf importe les 25 fichiers **par la route** et retrouve les chiffres du critère (3) de T43a

### Préserve
Les chiffres du corpus, l'atomicité SQL, le refus sur correspondance ambiguë ; réimporter le même lot ne crée rien ; l'oracle rejoue à l'identique.

### Recette
**Importer le corpus en une fois — 25 fichiers** (13 LBP + 11 Nickel + `Relevé de compte.pdf`), étape 7 dans sa vraie forme. `statement.pdf` est **exclu de la sélection** et **ne se supprime pas**.

---

## D5 — Inconnu n'est plus zéro

**Problème résolu** : `GET /balance` affiche un compte sans données à `0,00 €` dans un total crédible, et `unknownBalanceCount` ne peut jamais être non nul.

### Périmètre
- `src/server.ts` — `GET /balance` : le `, 0` du `COALESCE` disparaît ; `totalCents` et `institution.balanceCents` cessent de compter l'inconnu comme un zéro
- `web/src/main.jsx` — un solde inconnu s'affiche comme inconnu ; **chaque ligne de compte dit d'où vient son chiffre** : *reçu de la banque* · *calculé sur les mouvements connus* · *inconnu* (`external_hash` non nul distingue les deux premiers, la requête le lit déjà)
- `src/ui-logic.ts` + son test

### Ne pas toucher
Toute autre route ; aucune table, aucune colonne.

### Dépend de
Rien fonctionnellement. En série derrière T43b par contention de fichiers.

### Critères d'acceptation
- [ ] Un compte sans aucune donnée **n'affiche pas `0,00 €`** et le total agrégé ne le compte pas pour zéro
- [ ] Chaque ligne de compte porte l'origine de son solde
- [ ] `unknownBalanceCount` peut désormais être non nul, et l'est dans le cas d'essai

### Préserve
Les huit soldes justes sur neuf du 2026-08-04 ne changent pas d'un centime ; `unknownBalanceCount` reste le nom du décompte.

### Recette
Créer un compte sans rien y importer, ouvrir l'écran des soldes, lire sa ligne, vérifier que le total n'a pas bougé, et lire l'origine sur un compte synchronisé puis sur un compte alimenté par relevé.

---

## T45a — L'onboarding : déclarer et connecter *(étapes 0 à 1)*

**Problème résolu** : rien ne conduit un utilisateur de zéro à son premier solde, et quatre comptes Revolut arrivent avec le même nom.

### Périmètre
- `web/src/main.jsx` — la suite de questions : quelles banques et combien de comptes chez chacune ; test de chaque banque contre le catalogue Enable Banking ; connexion ; restitution de ce qui a été trouvé **et de ce qui manque** ; **nommage de ce que l'API ne distingue pas** (`display_name`). Le composant `Onboarding` existant est **remplacé** ; `BankConnect` est **réutilisé, pas dupliqué** — c'est lui qui porte le `defaultValue` à retirer
- `src/ui-logic.ts` + son test — déclencher l'onboarding, compter ce qui manque, classer les comptes reçus
- `src/server.ts` — seulement si le catalogue doit être exposé

### Ne pas toucher
Aucune table, aucune colonne : **la déclaration ne s'enregistre pas**. `ManualSetup` et l'ajout ordinaire restent accessibles en permanence.

### Dépend de
T33 (`display_name`), T43a/T43b (série). D5 la précède et elle la consomme.

### Critères d'acceptation
- [ ] Partir d'une **base vide**, déclarer ses banques, en connecter une, voir ses comptes apparaître **et pouvoir les distinguer** — sans terminal
- [ ] Le déclenchement est conditionné aux **tables vides** et à rien d'autre
- [ ] Aucun solde n'est saisi ; aucun nom de banque en dur ne subsiste dans `web/`
- [ ] Aucune dépendance neuve, aucune CSS neuve

### Préserve
**Aucune livraison ne réinitialise une base d'elle-même** — la mise de côté est un geste humain ; l'ajout ordinaire reste atteignable après coup.

### Recette
Sur la base réelle **mise de côté par renommage**, dans le même geste que la rotation de clé : étapes 0 à 1, **et renommer les quatre Revolut**.

---

## T45b — L'onboarding : détecter dans les relevés et récapituler *(étape 2)*

**Problème résolu** : quatre comptes n'ont **aucune autre porte** que le relevé — Livret A, Livret Jeune, PEA et PEA 2.

### Périmètre
- `web/src/main.jsx` — dépôt des relevés, détection des comptes qu'ils contiennent (noms, IBAN, soldes), récapitulatif à confirmer
- `src/server.ts` — la création des comptes détectés
- `src/ui-logic.ts` + son test

### Ne pas toucher
La détection elle-même : c'est T43a qui rend les segments.

### Dépend de
T45a, T43a.

### Critères d'acceptation
- [ ] Un compte que l'API ne donne pas entre **depuis son relevé**, avec son nom imprimé, son IBAN quand il y est, et son solde daté — **sans qu'on ait tapé un chiffre**
- [ ] Ce qui manque encore est listé **une fois**, dans la conversation, et n'est pas conservé

### Préserve
Aucun solde saisi à la main ; D5 n'est pas annulée — un compte sans donnée reste inconnu, pas zéro.

### Recette
Poursuivre T45a en déposant les relevés, confirmer le récapitulatif, retrouver tous ses comptes — étapes 0 à 2 d'un bout à l'autre. **Puis : réimporter le corpus (25 fichiers) et resynchroniser Revolut** — c'est la matière première de T44.

---

## T34 — Les banques connectées se voient, et chacune se relance *(étapes 3 à 6)*

**Problème résolu** : trois connexions `AUTHORIZED` en base que l'interface ne lit jamais ; une clé `localStorage` unique où une deuxième banque écrase la première — et sur le téléphone elle n'existe pas, donc **le mobile est en lecture seule sans que rien ne le dise**. `recordBankError` écrase toute cause en `"SYNC_FAILED"`.

### Périmètre
- `src/server.ts` — `GET /enable-banking/connections` ; `recordBankError` enregistre la cause réelle
- `web/src/main.jsx` — une ligne par connexion : statut, validité de consentement, dernière synchro, erreur, son propre bouton ; `localStorage` cesse d'être la source de vérité
- `src/ui-logic.ts` + son test — classer les connexions, formater l'échéance de consentement

### Ne pas toucher
Le callback bancaire, `status/:id` et `sync/:id` gardent leur contrat.

### Dépend de
T45b (série) et le geste humain de reconstruction.

### Critères d'acceptation
- [ ] Les connexions apparaissent sur le PC **et** sur le téléphone
- [ ] Relancer l'une n'affecte pas l'autre
- [ ] Une **échéance de consentement proche est annoncée avant d'être subie** — `consentValidUntil` est déjà rendu ; Trade Republic est plafonné à 90 jours quand la majorité est à 180
- [ ] Aucun jeton n'apparaît dans un message ni dans un journal

### Hors périmètre
Établir une connexion **depuis le téléphone** (C4).

### Recette
**Établir les deux connexions sur le PC** — Revolut et une autre — puis, **depuis le téléphone**, les voir toutes les deux et relancer chacune séparément. Revolut est nommée : sans sa synchro, le second critère de T44 n'est pas mesurable.

---

## T44 — L'oracle entre dans la base, et il grandit

**Problème résolu** : les 606 décisions validées à la main vivent dans trois fichiers JSON hors du dépôt, hors de la base chiffrée, hors de la sauvegarde. Elles doivent devenir la mémoire longue de l'application.

### Périmètre — **sept étapes, dans cet ordre**
1. `src/db.ts` — la table d'oracle, additive, chiffrée donc sauvegardée ; elle référence **la ligne de transaction**, jamais l'empreinte (C11) ; deux types de faits : *confirmé par relevé* et *nature tranchée*
2. `scripts/import-oracle.ts` — **fichier neuf**, lancé une fois : lit l'artefact et **s'arrête en nommant** toute nature inconnue (`virement_interne → virement_intercompte`, `externe_probable → virement_externe`)
3. La correspondance des comptes, **fournie en donnée d'entrée**, jamais devinée
4. L'attachement par `deduplicateTransactions` — on ne réécrit pas un second moteur
5. Les **deux compteurs imprimés** par le script
6. `src/server.ts` — `DELETE /transactions/:id` **refuse** un mouvement qui porte une vérité
7. `src/oracle-import.test.ts` — **fichier neuf**

### Ne pas toucher
`src/qualification-oracle.test.ts` — il ne change pas d'une ligne. **L'artefact d'oracle ne se réécrit pas.** Le repli de chemin WSL **reste** (`GESTIO_T27_ORACLE_REPO` n'est pas dans `.env`).

### Dépend de
T45b (base onboardée), le corpus réimporté, T34 (synchro Revolut). **Trois prérequis durs.**

### Critères d'acceptation
- [ ] Le premier état attache **380 décisions sur 380** — celles nées des relevés — et **191 paires sur 191** ; **un seul non attaché est ROUGE**
- [ ] Le **taux d'attachement des 226 décisions Revolut est mesuré et écrit** — un nombre, pas une porte
- [ ] Les quatre niveaux de `confidence` sont en base à l'identique : **336 / 46 / 127 / 97**
- [ ] Aucune nature hors `transactionNatures` n'entre en base ; le script s'arrête et nomme
- [ ] Source retirée ⇒ la suite **ne peut pas être verte** (le rejeu se saute, et un skip n'est pas VERT)
- [ ] `DELETE /transactions/:id` refuse un mouvement qui porte une vérité, **et dit pourquoi**

### Préserve
Le rejeu rend **exactement** 191 paires et 606 décisions ; aucun libellé ni IBAN ne sort de la base ; aucune transaction n'est modifiée par l'import de l'oracle.

### Recette
Lancer le script, **lire les deux compteurs qu'il imprime**, le **relancer en lecture** et retrouver les mêmes chiffres ; puis tenter de supprimer un mouvement qui porte une vérité et lire le refus.

---

## T35 — La qualification s'affiche, et elle se conteste *(étape 8)*

**Problème résolu** : aucune route ne permet de contester une des 606 décisions, et `requalifyTransactions` écraserait une correction manuelle au ré-import.

### Périmètre
- `src/server.ts` — `PATCH /transactions/:id` `{ nature }`, validée contre `transactionNatures` ; trancher **écrit une ligne dans la table d'oracle**, jamais une colonne sur `transactions`
- `src/qualification.ts` — `requalifyTransactions` consulte l'oracle et n'écrase pas ce qui y figure
- `web/src/main.jsx` — un écran de revue qui liste les `virement_a_verifier` et laisse trancher en un geste
- `src/ui-logic.ts` + son test — `transactionNatureLabel` existe déjà ; le **décompte par nature** s'y ajoute

### Ne pas toucher
La sémantique de doublon de `POST /transactions/resolve` et `DELETE /transactions/:id`.

### Dépend de
**T44** (la table doit exister avant qu'on y écrive).

### Critères d'acceptation
- [ ] Corriger une nature, réimporter le même relevé, relancer une synchro : **la correction survit**, et l'écran dit d'où vient chaque décision
- [ ] **Le décompte d'oracle augmente d'un** après une décision tranchée

### Préserve
Toute transaction non tranchée continue d'être requalifiée ; l'oracle rejoue à l'identique et **ne rétrécit jamais**.

### Recette
Contester une qualification, lire le compteur monter, la voir survivre à un ré-import — **et lire enfin le décompte des trois natures** : combien `virement_intercompte`, combien `virement_a_verifier`, combien `virement_externe`. **Ce chiffre n'a jamais été vu.**

---

## T36 — Restaurer, pas seulement sauvegarder *(étape 11)*

**Problème résolu** : on sait relire une sauvegarde ; **on n'a jamais restauré**.

### Périmètre
- `scripts/restore.sh` — symétrique de `backup.sh`, `sqlcipher_export()` en sens inverse, **jamais `.backup`**, refus d'écraser une base existante sans confirmation
- `package.json` — le script `lint` passe `bash -n` sur le nouveau script

### Ne pas toucher
`scripts/backup.sh` et la rotation à 30 jours.

### Dépend de
T35 (série). **Précède T38**, dont la preuve est une restauration.

### Critères d'acceptation
- [ ] Repartir d'une base vide, restaurer, retrouver le solde et le nombre de transactions attendus, **chiffres cités**
- [ ] **L'oracle ressort intact de la restauration** — 606 décisions, 191 paires

### Recette
C'est le critère — étape 11.

---

## T38 — La connaissance déclarée entre dans la base chiffrée

**Problème résolu** : `GESTIO_PERSONAL_NAMES` n'est ni chiffrée ni sauvegardée, et le nom des banques de l'utilisateur est en dur dans le moteur de qualification.

### Périmètre
- `src/server.ts` / `src/qualification.ts` — la connaissance déclarée vit dans `application_secrets` (**table existante**, chiffrée et sauvegardée) ; `.env` devient une **amorce**, lue une fois si la base est vide ; `INSTITUTION_ALIASES` quitte le code

### Ne pas toucher
Ne pas créer de table.

### Dépend de
T36 (l'outil de restauration, dont la preuve dépend).

### Critères d'acceptation
- [ ] Restaurer la sauvegarde dans une base vide **sur une autre machine** : les noms sont là, la qualification n'est pas dégradée
- [ ] Le **décompte de mouvements par `nature` avant et après** est cité, et il est identique

### Préserve
L'oracle rejoue à l'identique — un écart signifie qu'un alias s'est perdu ; aucun nom dans un fichier versionné ni dans un journal.

### Recette
Compter les mouvements par `nature` **avant**, restaurer sur une copie, **recompter après**, citer les deux chiffres.

---

## T42 — Les trous se voient *(étape 12)*

**Problème résolu** : rien ne dit quel mois manque pour quel compte. Le corpus s'est arrêté sans que l'application le signale.

### Périmètre
- `src/server.ts` — `GET /coverage`, **lecture seule**, dérivée de ce qui est déjà en base : par compte, premier et dernier mois portant une transaction, mois sans ligne entre les deux, `known_since`, et le décompte des mouvements **jamais confirmés par un relevé**
- `web/src/main.jsx` — un bloc par compte
- `src/ui-logic.ts` + son test

### Ne pas toucher
`GET /balance`. Aucune table, aucune colonne, **aucune écriture**.

### Dépend de
T38 (série). Dernière du lot A : la couverture n'a de sens qu'une fois comptes, IBAN et oracle en place.

### Critères d'acceptation
- [ ] Un mois manquant apparaît pour La Banque Postale tant que son relevé n'est pas importé, et **cesse** de l'être une fois importé
- [ ] La vue distingue **« pas de relevé importé »** de **« relevé importé, aucun mouvement »** — mesuré : le Livret Jeune porte zéro mouvement dans 11 relevés sur 13
- [ ] **Aucun trou n'est réclamé à Revolut**, qui n'a aucun chemin PDF

### Préserve
**D5 n'est pas annulée** : un compte sans données reste inconnu, il ne redevient pas zéro.

### Recette
Importer le lot du mois et voir la couverture se refermer.

---

# Lot B — le parcours

## T37 — Mise en service n°3, étapes 0 à 12 *(aucune ligne de code)*

**Problème résolu** : deux mises en service, aucune terminée ; on n'a jamais dépassé l'étape 2 en autonomie complète par l'interface.

### Périmètre
`.lamoms/mise-en-service.md` — le protocole à 12 étapes fait foi. **Fait à la main, par Lamoms.** Aucun agent ne le remplace.

### Dépend de
Les treize tâches du lot A.

### Critères d'acceptation
- [ ] Le parcours atteint l'étape 12, **ou nomme son blocage dur**
- [ ] Chaque étape porte un fait chiffré, et **les 18 méthodes ont un état**
- [ ] Chaque compte déclaré est comparé un par un à son application bancaire — montant attendu, montant affiché
- [ ] Le chemin d'entrée de **Sumeria** est noté : API, relevé ou saisie

### Préserve
**On ne corrige rien en cours de route** : un blocage dur arrête le parcours et devient la tâche suivante. Si le parcours part de la base réelle, l'empreinte de `data/gestio.db` est relevée avant et après.

---

# Lot C — ce que le parcours aura mesuré

**Cadrés au PRD §6, plans NON ÉCRITS.** Ils attendent la récolte de l'étape 8, qui n'existe pas encore — c'est la matière première qui leur manque. Les écrire aujourd'hui, ce serait planifier contre un terrain non mesuré.

- **T39** — le tiers reconnu une fois est reconnu toujours *(déclencheur : un IBAN inconnu apparaît dans un libellé)*
- **T47** — les dépenses réelles sur une période *(total calculé **en SQL**, jamais additionné dans le navigateur : `GET /transactions` rend 100 lignes)*
- **T48** — le compte Espèces *(un retrait n'est pas une dépense ; seule exception à « pas de saisie manuelle » ; sauve `POST /transactions`)*
- **T46** — les récurrences déclarées *(la fenêtre est **apprise**, jamais déclarée ; se désigne depuis T47)*

# Lot D — les agents Hermès spécialisés

- **T41 — le gestionnaire financier. OBLIGATOIRE** : il porte la seconde moitié du §1, qu'aucune tâche du lot A ne calcule. Le calcul du danger est **déterministe** et tourne sur le Raspberry Pi ; le modèle ne juge que le résidu. Modèle **local**, 4B quantisé. Il propose, **il n'écrit jamais**.
- **T40 — l'agent qui éprouve. CONDITIONNEL** : seulement si T37 se bloque une troisième fois. Il travaille sur une **copie** faite par `sqlcipher_export()`, et **il ne lit jamais un libellé — il compte**.

# Lot E — le nettoyage

## T32 — Nettoyage T27 *(#39 — à tout moment, aucune dépendance)*

F1 `excludedProducts` résiduel, F4 variable de boucle nommée `number`. **F2 et F3 sont tranchés : le code fait foi, le plan se corrige** — tolérance d'appariement à 4 jours, échelle de scores 120/110/100/90/80/60/50. **L'oracle n'est pas rejoué.**

### Préserve
Cette tâche ne touche que du texte. **Un diff qui contient `src/qualification.ts` est hors périmètre.**

---

## Ce qui n'est plus dans aucune tâche *(décision 50, 2026-08-13)*

- **M1** et **M2** — partis dans **T43a**, dont c'est le sujet mot pour mot.
- **M3** (rattrapage Nickel, `qualification_label` NULL) — **tombé** : il répare des lignes que la reconstruction de T45a écarte et que le ré-import réécrit.
- **F5** (reconnaissance du nom indépendante de l'ordre) — **sorti** : aucun cas réel n'a jamais été observé. Redevient un point de **récolte** de l'étape 8.
- Les **41 divergences de libellé** LBP/Nickel restantes — mesure à faire, pas travail à commander.
