# Observations UX / maintenance — Gestio

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

### T25 — Observation 1
- Issue : T25 / #34
- Constat : `form.reset()` inconditionnel efface la correspondance de comptes en cas d’échec d’un fichier du lot
- Gravité : faible
- Recommandation : reset conditionnel après succès seulement, ou conserver les sélections en cas d’erreur

### T25 — Observation 2
- Issue : T25 / #34
- Constat : un fichier vide est filtré sans aucun message
- Gravité : faible
- Recommandation : afficher une erreur explicite par fichier, y compris pour les fichiers de 0 octet

### T25 — Observation 3
- Issue : T25 / #34
- Constat : le sélecteur de fichiers masque par défaut les relevés La Banque Postale sans extension
- Gravité : faible
- Recommandation : faciliter la sélection de ces fichiers, par exemple en acceptant `*/*` ou en rappelant « Tous les fichiers »

### T25 — Observation 4
- Issue : T25 / #34
- Constat : le message global d’import ne nomme pas le ou les fichiers en échec
- Gravité : faible
- Recommandation : mentionner les échecs dans la notice globale, en complément de la liste détaillée
