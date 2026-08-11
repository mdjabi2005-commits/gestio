# DESIGN.md

## Product

Gestio est une application web de trésorerie personnelle, 1 utilisateur, auto-hébergée.
Public : usage mobile et desktop, interface en français.
Objectif principal : afficher le cash disponible à l'instant T, agrégé et par compte, sans ambiguïté.

## Stack cible

- Frontend : React + Vite PWA, sortie dans `web/`
- Styles actuels : CSS natif via `web/src/styles.css`
- Backend : Fastify
- Stockage chiffré : SQLCipher via Drizzle + `better-sqlite3-multiple-ciphers`

## Direction design

- Épurer au maximum ; pas de décoration gratuite
- Palette sobre, fiscal/neutre
- Mobile first, desktop par élargissement
- Thème sombre privilégié, reste lisible en clair via `prefers-color-scheme`
- Pas de photos, avatars, branding superflu, emojis décoratifs
- Hiérarchie par espacement, graisse typographique et contraste

## Tokens

- Fond : `Canvas`
- Texte : `CanvasText`
- Texte secondaire : `GrayText`
- Surbrillance : `Highlight` / `HighlightText`
- Bordure : `GrayText` translucide
- Arrondis : `.5rem` / `.75rem`
- Rayon principal : `.5rem`
- Rayon carte : `.75rem`

## Typographie

- Famille : `system-ui, sans-serif`
- Corps : `1rem`, `line-height: 1.5`
- Titre page : poids élevé, taille importante, limité à 1 ligne
- Solde principal : `clamp(2.25rem, 10vw, 4rem)`, poids fort
- Muted/secondaire : `GrayText`
- Labels de formulaire : petites capitales ou graisse moyenne

## Layout

- Conteneur principal : `width: min(100% - 2rem, 46rem)`, centré
- Navigation principale : grille 3 colonnes sur mobile, 3 onglets sur desktop
- Cartes : bordure, rayon, padding interne constant
- Espacement vertical par défaut : `1rem`
- Actions groupées : gap `.5rem`, wrap autorisé

## Couleurs de sens

- Neutre : `Canvas` / `CanvasText`
- Information : `Highlight` / `HighlightText`
- Avertissement : orange 20% sur fond
- Erreur : rouge 16% sur fond
- Positif : vert en light, `lightgreen` en dark
- Négatif : `firebrick` en light, `salmon` en dark
- Inconnu / incomplet : jamais afficher `0,00 €` à la place d'un solde manquant ; utiliser un libellé explicite

## Composants

### Shell
- En-tête avec marque et actions contextuelles
- Zone de statut : notice, avertissement, erreur
- Navigation principale
- Zone de contenu

### BalanceCard
- Solde total en très grand
- Mention de fraîcheur agrégée ou "Fraîcheur inconnue"
- Mention explicite si total incomplet
- Actions : synchroniser, connecter une banque

### AccountCard
- Nom de l'établissement
- Solde agrégé de l'établissement, avec mention `(incomplet)` si un sous-compte manque
- Liste des comptes avec :
  - nom
  - solde ou `Solde inconnu`
  - `Connu depuis le JJ/MM/AAAA`
  - `mis à jour le JJ/MM/AAAA HH:MM` ou `fraîcheur inconnue`

### TransactionLine
- Libellé à gauche, montant à droite
- Montant en vert si positif, rouge/salmon si négatif
- Métadonnées en petit et grisées : date · compte

### ReviewGroup
- Carte séparée
- Titre : `À départager`
- Message d'instruction
- Boutons par ligne de groupe
- Bouton d'action globale : `Ce sont des dépenses distinctes`

### Actions
- Boutons primaires pour les actions principales
- Boutons secondaires en retrait
- États : chargement, succès, erreur inline sous le composant fautif
- Focus visible obligatoire

### EmptyState
- Texte clair, sans jargon
- Deux cas possibles :
  - aucune donnée encore chargée
  - compte synchronisé mais sans solde connu : `Solde inconnu`, pas `0,00 €`

### OfflineState
- Bannière en haut : `Hors connexion`
- Date du dernier solde connu affichée
- Les transactions ne sont pas disponibles hors connexion ; le solde reste visible
- En cas d'erreur de chargement initial : message honnête, pas d'écran vide brut

### Onboarding
- Message introductif court
- Deux chemins :
  - connecter une banque
  - créer établissement / compte / importer PDF
- Chaque chemin visible immédiatement, sans terminal

## Écrans

### Combien j'ai
- Solde total en hero
- Fraîcheur agrégée
- Total incomplet si un solde est manquant
- Actions de synchronisation et connexion bancaire
- Accès aux imports et saisies via section dépliable

### Où est mon argent
- Liste des établissements en cartes
- Comptes avec statut de fraîcheur
- Incomplet explicite par compte et par établissement

### Quoi
- Groupes à départager en premier
- Puis liste plate des transactions
- Section d'ajout manuel
- Import PDF avec mapping compte par compte
- Rapport d'import par fichier

## États spécifiques

- `unknownBalanceCount > 0` : total incomplet, jamais zéro par défaut
- `missingUpdatedAtCount > 0` : au moins un compte sans date
- Compte API jamais chargé : `Solde inconnu`
- Compte manuel sans transactions : solde resté `NULL` possible, rester honnête
- Erreur de synchro : message affiché, statut de connexion remis en cause si échec total

## Accessibilité

- `lang="fr"` sur `html`
- Rôles ARIA sur zones d'erreur : `role="alert"`
- Navigation avec `aria-label`
- États courants avec `aria-current`
- Focus visible conservé
- Contraste suffisant en sombre et clair

## Interdits UI

- Afficher `0,00 €` quand le solde est inconnu
- Afficher une date `à jour` quand un compte n'a jamais été synchronisé
- Cacher le nom d'un fichier en échec dans le message global d'import
- Réinitialiser un formulaire d'import en cas d'erreur sans avertissement
- Exposer des IBAN ou coordonnées bancaires dans les libellés

## Fichiers de référence dans ce repo

- `web/src/main.jsx`
- `web/src/styles.css`
- `src/ui-logic.ts`
- `.lamoms/prd.md`
- `.lamoms/ux-observations.md`
