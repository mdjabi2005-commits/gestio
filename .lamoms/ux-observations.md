# Registre UX/maintenance — constats non bloquants

Ce fichier liste les constats non bloquants rapportés par Hermès / reviewT.
Il ne contient que des points d’amélioration UX ou de maintenance du socle.
Tout point devenu bloquant doit sortir de ce registre et être traité comme problème dans `.lamoms/problems.json`.

---

### T18 — Observation 1
- Issue : T18 / #27
- Constat : erreur affichée loin du formulaire fautif
- Gravité : faible
- Recommandation : une zone d’erreur par formulaire, ou positionner le message sous le formulaire concerné

### T18 — Observation 2
- Issue : T18 / #27
- Constat : race GET/POST /institutions qui peut effacer un établissement créé
- Gravité : faible
- Recommandation : fusionner la réponse GET dans la liste existante, ou relire /institutions après le POST

### T18 — Observation 3
- Issue : T18 / #27
- Constat : duplication frontend/backend de la liste des clés de relevé
- Gravité : faible
- Recommandation : une seule source de vérité, ou documentation explicite de la duplication

### T18 — Observation 4
- Issue : T18 / #27
- Constat : refus 400 de l’import PDF non automatisés en tests
- Gravité : faible
- Recommandation : ajouter des tests app.inject pour mapping incomplet, mapping réutilisé et non-PDF

### T18 — Observation 5
- Issue : T18 / #27
- Constat : import PDF sans vérification de cohérence banque → compte
- Gravité : faible
- Recommandation : interdire le mapping d’un relevé vers un compte d’un autre établissement, comme pour le CSV

### T17 — Observation 1
- Issue : T17 / #26
- Constat : changement du chemin d'échec en deux passes ; si un /details échoue, aucun compte de la session n'est synchronisé.
- Gravité : faible
- Recommandation : known behavior à surveiller en production si les pannes /details deviennent fréquentes ; sinon, conserver le compromis structurel.

### T21 — C1
- Issue : T21 / #30
- Constat : quand `freshness` est null, le compteur de comptes sans date n'est pas affiché.
- Gravité : faible
- Recommandation : afficher « Fraîcheur inconnue · n comptes sans date » quand le compteur est non nul.

### T21 — C2
- Issue : T21 / #30
- Constat : recette sur copie de la base réelle non exécutée.
- Gravité : moyenne
- Recommandation : porter cette recette dans `.lamoms/mise-en-service.md` avant verdict de cycle.

### T21 — C3
- Issue : T21 / #30
- Constat : la reprise `FAILED` élargit légèrement la pression API de la boucle de fond.
- Gravité : faible
- Recommandation : surveiller le volume API dans les journaux à la première mise en service.

### T21 — C4
- Issue : T21 / #30
- Constat : le passage `EXPIRED` pendant la reprise n'est pas couvert par un test.
- Gravité : faible
- Recommandation : ajouter un test optionnel si le cycle veut verrouiller la sémantique terminale.
