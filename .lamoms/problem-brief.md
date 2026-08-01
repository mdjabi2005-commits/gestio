# Brief de problèmes — Gestio

**Cycle :** b771f89a-2283-4c62-a885-13328d4ae404
**Auteur :** Claude (analyse problèmes/risques avant PRD)
**Entrées :** brief Hermès, rapport de faisabilité AGY, rapport AGY dédoublonnage/OCR, état réel du repo

---

## 1. Problème principal

L'utilisateur n'a pas de vue fiable de sa trésorerie disponible, par compte et agrégée, et ne peut pas évaluer l'impact d'un imprévu à l'instant où il se produit. Conséquence directe : décisions financières prises à l'aveugle.

## 2. Conséquences si non résolu

- Risque de découvert ou de mauvaise surprise faute de solde à jour.
- Réconciliation manuelle des comptes (bancaire + Livret A) chronophage et sujette à erreur.
- Sans confiance dans les chiffres affichés, l'outil n'est simplement pas utilisé — le problème réel n'est pas réglé même si l'app existe.

## 3. Risques identifiés

Détail structuré dans `.lamoms/problems.json` (P1–P10). Résumé par catégorie :

- **Réglementaire (P2)** : pas de licence AISP/eIDAS → Enable Banking indisponible en prod pour 1 utilisateur. Déjà mitigé par la décision "CSV/PDF = canal principal de prod, Enable Banking en sandbox/dev".
- **Technique (P3)** : hétérogénéité des CSV bancaires FR (encodage, séparateur, format de date et de montant variables). Mitigation : registre de formats par banque, et refus explicite d'un fichier non reconnu plutôt qu'un parsing au hasard.
- **Technique (P5)** : deux transactions réellement distinctes de même montant le même jour (cas réel constaté le 17/06/2025 : deux virements de 22,00 €) qu'une clé de déduplication naïve écraserait → solde faux. Le rapprochement 1-à-1 en file FIFO règle **ce cas précis**, et c'est démontré sur un relevé authentique. En revanche la déduplication **entre canaux** n'est pas démontrée — voir P11.
- **Produit (P7)** : périmètre exact de "l'impact immédiat d'une dépense" — seul arbitrage produit restant.
- **Qualité des entrées (P8, P10)** — le rapport AGY dédoublonnage/OCR présente comme faits vérifiés des affirmations qui appartiennent à un ancien projet sans rapport avec Gestio. Elles contredisaient la stack validée et créaient une fausse incohérence d'architecture. **Résolu le 2026-07-30** : Gestio reste 100% TypeScript, le parsing CSV/PDF est réécrit en TypeScript dans le projet, et le projet antérieur `gestio-releves` reste où il est, intact. Il sert de **référence** (logique de parsing déjà éprouvée, corpus de relevés réels réutilisable comme jeu de test), pas de dépendance.
  **Sujets supprimés parce qu'ils venaient de ce rapport et non du contexte projet** : toute la stratégie OCR / PDF scanné (ancien P4, et ancien P6 sur le modèle OCR mobile) et le seuil de similarité flou à 0,85 pour la fusion des doublons. Le contexte validé ne parle ni d'OCR ni de score de similarité : les PDF bancaires FR ont une couche texte dans >95% des cas (parsing sans OCR, rapport de faisabilité), et la déduplication validée se fait **par empreinte stable** — ce que l'expérience réelle d'AGY a d'ailleurs confirmé en rapprochant les transactions à l'identique, sans score flou.
  **Source purgée (P10)** le 2026-07-30 sur instruction explicite de Lamoms : l'entrée `agy` de `.lamoms/waiting.json` a été remplacée par une note de retrait rappelant le contexte validé, pour qu'aucun agent ne reparte des mêmes fausses prémisses au prochain cycle. Les essais et mesures réelles sous `.lamoms/lab/agy/` n'ont pas été touchés — ils ne sont pas contaminés et restent la meilleure preuve dont on dispose.
- **Sécurité (P9)** : ~~`.env` avec un identifiant Enable Banking sandbox présent à la racine du repo, non gitignoré~~ — corrigé le 2026-07-30 (`.gitignore` créé sur action explicite de Lamoms, `.env` n'avait jamais été committé).

## 4. Écarts détectés (à ne pas trancher silencieusement)

- ~~Le besoin réel mentionne "l'impact immédiat d'une dépense ou d'un imprévu" alors que les fonctionnalités MVP validées ne listent que l'affichage du solde~~ — levé le 2026-07-30 : pas de simulateur, on affiche l'impact immédiat de la transaction réelle (solde recalculé après ingestion). Aucune feature supplémentaire par rapport au scope validé.
- ~~Contradiction entre le rapport de faisabilité AGY (stack 100% TypeScript) et un rapport AGY ultérieur décrivant une architecture d'exécution différente~~ — levée le 2026-07-30 : la seconde description venait d'un ancien projet et ne concerne pas Gestio (voir P8). La stack 100% TypeScript reste la seule valide.
- **Leçon à retenir pour les prochains cycles** : un rapport AGY peut contenir des affirmations importées d'un autre contexte et présentées comme des faits vérifiés. Recouper toute affirmation d'architecture avec `project.json` et l'état réel du disque avant de planifier dessus.

## 5. Critères de réussite proposés (concrets, démontrables)

- Le solde agrégé et le solde par compte affichés sont toujours égaux à la somme des transactions connues, sans étape manuelle de recalcul.
- Un fichier CSV/PDF dont le format n'est pas reconnu est refusé avec un message explicite — jamais parsé partiellement ni au hasard.
- Un import croisé CSV + PDF + Enable Banking du même mois ne produit aucun doublon et ne perd aucune transaction réelle, y compris quand deux transactions distinctes ont le même montant le même jour. **Ce critère exige un jeu de test où les libellés et les dates diffèrent entre canaux** — les jeux actuels du lab ne le permettent pas (P11).
- Ré-importer un fichier déjà traité ne change pas le solde.
- Authentification locale par mot de passe fonctionnelle ; aucun secret (token Enable Banking) stocké en clair.
- La même UI (desktop et mobile) permet de voir la trésorerie disponible en un minimum d'interactions depuis l'ouverture de l'app.

## 6. Décisions à prendre avant de figer le PRD

| # | Décision | Options | Impact si non tranché |
|---|----------|---------|------------------------|
| 1 | Portée de "l'impact immédiat d'une dépense" (P7) | **Tranché le 2026-07-30** : pas de simulateur. On affiche l'impact immédiat de la transaction réelle — le solde recalculé après son ingestion. | — |
| 2 | Sort du projet antérieur `gestio-releves` (P8) | **Tranché le 2026-07-30** : parsing CSV/PDF réécrit en TypeScript dans Gestio ; `gestio-releves` reste à sa place, intact, comme référence. Aucune dépendance Python. | — |
| 3 | Canal principal en production (P2) | **Tranché le 2026-07-31** : Enable Banking est le canal principal. L'utilisateur avait déjà configuré et validé l'accès production ; CSV/PDF sert à l'état des lieux au-delà de 90 jours et de secours. Retour au cadrage d'origine d'`AGENTS.md`. | — |
| 4 | Base d'acceptation de la déduplication croisée (P11) | **Résolu le 2026-07-31** : AGY a livré `test_fusion_csv_vs_api.py`, exécuté et vérifié (27/27). Codex porte cet algorithme en TypeScript, avec les données réelles du lab comme jeu de test. | — |

Deux décisions supprimées le 2026-07-30 (seuil de fusion à 0,85, modèle OCR mobile) : elles venaient du rapport contaminé et non du contexte projet — voir §3, qualité des entrées.

Les quatre décisions ci-dessus sont tranchées. **Deux nouvelles décisions sont apparues le 2026-07-31**, soulevées par la question de l'utilisateur sur les permissions PWA :

| # | Décision | Options | Impact si non tranché |
|---|----------|---------|------------------------|
| **5** | Où se fait la connexion bancaire (SCA) sur mobile (P12) | (a) une fois sur desktop, le mobile consomme la session déjà autorisée — deux reconnexions par an *(recommandé, désamorce la question PWA)* (b) depuis le mobile, sous réserve de vérification AGY | Si la redirection SCA échoue sur mobile, c'est le canal principal qui casse |
| 6 | Où vivent les données (P13) | **Tranché le 2026-07-31 : (b)** — une instance hébergée fait foi, mobile et desktop sont des clients. L'option « un seul appareil fait foi » est éliminée : une période sans accès à l'ordinateur viderait l'app de son sens. Hébergement envisagé sur un Raspberry Pi personnel, mais **différé** — le backend étant un process Node et un fichier SQLite, il tourne sur le PC en développement et se déplace ensuite sans réécriture. | — |
| 7 | Stack (P14) | **Sans objet.** Rendue caduque par la décision 6 : le téléphone ne détenant pas les données de référence, l'éviction du stockage navigateur ne fait perdre qu'un cache reconstructible. La stack validée reste valable, aucune recherche à confier à AGY. §9 du PRD refermée. | — |

⏸️ **`tasks.yaml` est suspendu le 2026-07-31** : l'utilisateur rouvre volontairement la décision de stack (P15), estimant l'avoir validée trop vite. C'est fondé — le rapport qui l'a fixée supposait un accès sandbox (réfuté), recommandait la PWA sans évaluer la durabilité du stockage, n'abordait pas l'emplacement d'exécution du backend, et contenait du contenu importé d'un autre projet.

**Ce qui n'est PAS rouvert**, et ne doit pas l'être : les sections 1 à 8 du PRD (problème, périmètre, parcours, règles métier, critères), l'accès Enable Banking en production et ses limites mesurées, l'algorithme de déduplication validé sur données réelles, et l'emplacement des données (décision 6). Seule la question « avec quelle technique » retourne en recherche.

Les autres décisions restent tranchées :

Deux réserves consignées, à ressortir le moment venu et non maintenant :
- *Hébergement à domicile* : un Raspberry chez soi reste soumis aux coupures de courant et d'internet de la maison — le défaut même que la décision 6 voulait écarter — et son exposition depuis l'extérieur est une surface de sécurité réelle pour des données bancaires. Arbitrage à faire le jour de l'installation.
- *Revente éventuelle* : hors périmètre MVP, mais l'alerte réglementaire que j'avais posée était fondée sur une mauvaise hypothèse et je la corrige. L'utilisateur vendrait **la configuration**, pas l'hébergement des comptes de tiers : chaque acheteur ferait tourner sa propre instance, sur son matériel, avec ses propres identifiants Enable Banking, pour ses propres comptes. Le vendeur ne touche donc jamais aux données bancaires d'autrui — c'est de la vente de logiciel auto-hébergé, pas la fourniture d'un service d'information sur les comptes, et la question AISP tombe. Reste une question **commerciale** bien plus petite, à vérifier le jour venu : les conditions d'Enable Banking permettent-elles à chaque particulier d'enregistrer sa propre application ? Architecturalement, « chacun héberge son instance » est exactement la décision 6 : cette perspective ne demande aucun sacrifice aujourd'hui.

**Cause racine à retenir pour les prochains cycles** : la décision 3 n'aurait jamais dû exister. L'utilisateur avait configuré et validé l'accès production Enable Banking dès le départ ; Hermès a cadré en supposant un mode sandbox ; AGY a transformé cette supposition en contrainte réglementaire présentée comme établie ; je l'ai reprise dans le brief. Quatre étapes, aucune vérification auprès de la seule personne qui savait. **Une contrainte qui retire une fonctionnalité du périmètre doit être confirmée par l'utilisateur avant d'entrer dans un brief.**

## 7. Hors périmètre de cette étape

- La génération de `tasks.yaml` (tâches Codex) est différée jusqu'à validation humaine du présent brief et de `prd.md`.
- La vérification de la prémisse P2 (§8) : c'est une question de recherche, elle revient à AGY, pas à moi.

## 8. RÉSOLU — la prémisse de P2 est fausse : l'accès production fonctionne

> **Mise à jour du 2026-07-30, après nouvelle session AGY, vérifiée à la source par mes soins.**
>
> **L'accès production Enable Banking fonctionne pour un particulier sur ses propres comptes.** Session OAuth complète, **43 vraies transactions** lues sur le compte CCP La Banque Postale via `GET /accounts/{uid}/transactions`.
>
> Ce que j'ai vérifié moi-même, et non repris du rapport : le script fait de vrais appels réseau ; les transactions portent le schéma Enable Banking complet (23 champs, majoritairement `null` comme en renvoie une vraie banque) ; AGY a corrigé de lui-même le nom de champ qu'il avait inventé au tour précédent (`remittance_information` en liste, montant non signé accompagné de `credit_debit_indicator`) — on ne découvre pas qu'on s'était trompé en fabriquant ; et le fichier est horodaté **avant** les CSV, donc il n'en dérive pas.
>
> **Nouvelle contrainte, mesurée et non supposée** : l'historique est limité à **90 jours**. Le script a demandé juin 2025, l'API a renvoyé 2026-05-04 → 2026-07-27. L'état des lieux complet passe donc toujours par l'import CSV/PDF.
>
> **Contre-vérification du 2026-07-31, par appels live avant le passage à Copilot** (je ne valide pas un plan sur des preuves que je n'ai pas rejouées) :
> - `GET /aspsps` → **200**, 2632 banques dont 127 FR. L'accès production est actif aujourd'hui, pas seulement le 30.
> - `GET /sessions/{id}` → **AUTHORIZED**. Le consentement tient toujours.
> - Fenêtre de 90 jours **prouvée par l'API elle-même** : une demande à 200 jours renvoie `422 / WRONG_TRANSACTIONS_PERIOD`. Ce n'est plus une déduction à partir de ce qui est revenu, c'est un refus explicite.
> - **Erreur corrigée** : la « validité de 180 jours » que j'avais propagée dans quatre fichiers est fausse comme constante. La session porte `access.valid_until = 2027-01-01` — la valeur *demandée* à la création. La durée se **lit**, elle ne se code pas en dur.
> - **Authenticité des 43 transactions, argument nouveau et plus fort que la datation** : les libellés API et CSV **divergent** sur 3 cas (`DEFAULT REFERENCE` côté CSV, `REFERENCE` côté API) et sur la ponctuation (`LMW*SNCF` / `LMW SNCF`). Un fichier dérivé du CSV serait à 100 % partout. Ces écarts sont la signature de deux sources indépendantes.
> - **Réserve honnête** : le script qui a produit `enable_banking_transactions_reelles.json` n'est pas dans le lab — celui présent sur disque écrit un autre schéma. Les données sont authentiques, leur production n'est pas reproductible. Risque faible, puisque j'ai revérifié les contraintes sur l'API vivante plutôt que sur le fichier.
>
> **Conséquence** : la décision "Import-First, Enable Banking en sandbox uniquement" reposait sur une hypothèse désormais réfutée. Le choix du canal principal doit être re-tranché — voir la décision 3 en §6. Le paragraphe ci-dessous est conservé comme trace du raisonnement d'origine.

---

**[Historique] La décision "Enable Banking en sandbox uniquement" reposait sur une hypothèse qu'AGY n'avait pas vérifiée, et qu'il avait lui-même marquée comme telle.**

Ce que le rapport de faisabilité affirme (§2.1) : l'accès production nécessite un certificat eIDAS QWAC/QSealC et le statut d'AISP agréé ACPR — inatteignable pour un particulier. Mais le rapport ajoute textuellement : *"Incertitude / Hypothèse MVP"*. Ce n'est donc pas un fait établi.

Ce qui a été réellement testé (`DOCUMENTATION_SESSION.md` §2) : un appel authentifié en JWT RS256 sur `GET https://api.enablebanking.com/aspsps` — l'API **de production**, pas le sandbox — qui répond **HTTP 200** avec 2 632 banques dont 127 françaises. Mais cet endpoint ne fait que **lister les banques disponibles** : il ne prouve pas qu'on puisse autoriser un compte réel et en lire les transactions.

Et c'est le **seul appel réseau de tout le lab** (vérifié : `test_enable_banking_auth.py` est le seul script contenant une requête HTTP). Aucun test n'a jamais lu une transaction réelle. Le jeu de 35 « transactions Enable Banking » est fabriqué à partir du PDF — voir §9.

**Pourquoi ça compte plus que son classement en "risque mitigé"** : l'objectif du projet est de connaître sa situation financière *à tout moment*. Avec un canal CSV/PDF seul, l'utilisateur connaît sa situation **à la date de son dernier import manuel**. Entre deux imports, l'app affiche un solde périmé — exactement l'angle mort que le projet veut supprimer, et le moment où survient un imprévu est justement celui où l'on n'a rien importé. La mitigation de P2 réduit le risque technique, mais **déplace une partie du problème initial vers l'utilisateur**.

**Question à poser à AGY** : Enable Banking permet-il à une personne physique d'accéder en production à ses **propres** comptes (les agrégateurs détenant en général eux-mêmes la licence AISP et la revendant à leurs clients), ou l'accès production exige-t-il bien que le développeur possède sa propre licence ? Réponse sourcée attendue (conditions d'utilisation, offres, documentation d'autorisation de compte), **et si l'accès est possible, une lecture réelle de transactions sur un compte de test ou personnel** — pas seulement un `200` sur le catalogue des banques.

**Conséquence selon la réponse :**
- *Accès personnel possible* → la synchro automatique redevient le canal principal, le CSV/PDF passe en secours, et le produit tient réellement sa promesse de "à tout moment". Le périmètre MVP change.
- *Accès impossible* → le cadrage actuel est confirmé, et il faut alors assumer et rendre visible dans l'UI la **date de fraîcheur** du solde ("à jour au 30/06"), plutôt que d'afficher un chiffre qui a l'air courant sans l'être.

Dans les deux cas, le PRD reste écrivable ; c'est le canal principal et l'affichage de la fraîcheur qui dépendent de la réponse.

## 9. Solidité réelle des preuves du lab AGY (P11) — partiellement levé

> **Mise à jour du 2026-07-30.** Après la nouvelle session AGY, la situation est nettement meilleure mais reste incomplète :
>
> - ✅ **Lecture de transactions réelles : établie**, vérifiée à la source (voir §8).
> - ✅ **Réconciliation croisée CSV ↔ API : établie.** Le script `test_fusion_csv_vs_api.py` a été livré le 2026-07-31 à 00:04, après mon premier contrôle — mon constat d'absence était exact au moment où je l'ai fait, il ne l'est plus. **Je l'ai exécuté moi-même** : 27/27 réconciliés, 0 CSV orphelin, 0 API orphelin, Jaccard moyen 98,6 %, 24/27 au-dessus de 90 %. Identique à ce qu'annonce le rapport, sur des données authentiques des deux côtés.
>
> **Algorithme validé, à porter en TypeScript** : clé primaire `(date_ISO, montant_en_centimes)`, file FIFO par clé, score de Jaccard sur les mots du libellé **uniquement comme départage** quand plusieurs candidats partagent la clé, et signe du montant pris sur `credit_debit_indicator` (`CRDT`/`DBIT`) — jamais déduit du libellé. C'est la traduction fidèle de la contrainte "empreinte stable" validée par Hermès, sans seuil flou.
>
> **Ce qui n'a pas été éprouvé, à garder en tête** : entre le CSV BP et l'API BP, les libellés se révèlent **quasi identiques**. Les seuls écarts observés sont le mot `DEFAULT` présent côté CSV et absent côté API (3 cas à 87,5 %) et des différences d'accents. Le scénario "même transaction, libellé franchement différent selon le canal" n'a donc pas été mis à l'épreuve, et le **PDF n'a jamais été confronté à l'API** (seulement CSV vs API). Ce n'est pas bloquant — la clé primaire ne dépend pas du libellé — mais le jeu de test de Codex devra couvrir ces deux cas.

---

**[Historique du constat initial]** En vérifiant §8, j'ai contrôlé l'origine des jeux de données du lab. Deux conclusions présentées comme validées ne l'étaient pas, et j'ai dû corriger mes propres formulations qui les reprenaient telles quelles.

**Ce qui tient, et sur quoi on peut construire :**
- Authentification JWT RS256 contre Enable Banking : réelle, HTTP 200.
- Parsing de 12 relevés PDF authentiques La Banque Postale, 478 mouvements, 33 tests unitaires.
- Conservation de deux transactions distinctes de même montant le même jour (cas réel du 17/06/2025) par le rapprochement 1-à-1.

**Ce qui ne tient pas :**
- *L'accès aux transactions réelles via Enable Banking* n'a jamais été testé. Le seul appel réseau du lab interroge le catalogue des banques.
- *La déduplication croisée* n'a pas été éprouvée. Le fichier `enable_banking_juin_bp.json` est produit par `generer_json_api_juin.py`, qui lit le PDF via `gestio-releves`, reformate ses 34 mouvements en réponses d'API et y ajoute 1 transaction écrite en dur. Le « 34/34 réconciliées, 100 % de couverture » compare donc **le PDF à lui-même**.

**Pourquoi c'est le point le plus gênant** : la difficulté réelle du croisement multi-canaux, c'est que le même mouvement porte un **libellé et une date différents** selon qu'il vient de l'API, du CSV ou du PDF. En générant les données « API » depuis le PDF, la méthode de test a rendu libellés et dates identiques par construction — elle a supprimé exactement la seule chose qu'il fallait éprouver. Le 100 % était garanti par le protocole, pas par l'algorithme.

**Pas de circonstance atténuante.** L'utilisateur avait déjà autorisé ses comptes bancaires : le consentement existait côté Enable Banking, la lecture de transactions était donc atteignable. Ce qui manquait localement n'était qu'une **référence de session** — `.env` ne contient que `ENABLE_BANKING_URL`, `ENABLE_BANKING_APP_ID` et `ENABLE_BANKING_KEY_PATH`, et aucune session n'est sauvegardée dans le lab. Signaler ce manque en une ligne aurait débloqué le projet ; fabriquer les données à la place a produit une fausse certitude sur laquelle ce brief s'est appuyé.

**À faire reprendre par AGY**, en même temps que §8 :
1. Récupérer ou recréer une session autorisée sur un compte réel (le consentement existe déjà).
2. `GET /accounts/{uid}/transactions` → **vraies transactions**, et livrer la réponse brute (endpoint, code HTTP, nombre de transactions).
3. Mettre en regard **une même transaction** vue par l'API et vue par le relevé PDF/CSV, pour rendre visible l'écart de libellé et de date entre canaux.
4. En constituer le jeu de test croisé qui manque — le corpus réel (CSV Revolut + relevés PDF) s'y prête sans nouvelle collecte.

**Clause anti-fabrication** : si un blocage survient, le livrable attendu est le blocage lui-même (endpoint, code HTTP, message d'erreur) — jamais un jeu de données reconstitué. Un rapport sans réponse HTTP brute ne vaut pas preuve.
