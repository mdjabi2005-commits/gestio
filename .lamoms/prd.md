# PRD — Gestio

**Cycle :** b771f89a-2283-4c62-a885-13328d4ae404
**Statut :** complet — toutes les décisions sont tranchées, architecture comprise. En attente de validation humaine du PRD et du graphe de tâches.

## 1. Problème réel

L'utilisateur n'a pas de vue fiable de sa trésorerie disponible. Il ne sait pas, à l'instant où il en a besoin, combien il a réellement — par compte et au total — ni ce qu'il lui reste après une dépense. Conséquence : décisions financières prises à l'aveugle, exactement au moment d'un imprévu.

## 2. Utilisateurs concernés

Un utilisateur unique, sur ses propres comptes. Pas de multi-utilisateur, pas d'authentification cloud. Usage mobile en situation (savoir vite, dehors) et desktop pour le travail de fond (état des lieux, vérification).

## 3. Objectif et résultats attendus

Afficher à tout moment un solde de trésorerie disponible fiable, agrégé et par compte, tenu à jour automatiquement.

Résultats attendus :
- Ouvrir l'app et connaître son solde sans aucune action préalable.
- Savoir si ce chiffre est frais, et de quand il date.
- Ne jamais avoir à recalculer ni à corriger à la main un solde faux.

## 4. Périmètre

### Inclus

- Modèle `Compte` (bancaire, Livret A, évolutif) et `Transaction` (date, montant en centimes, libellé, source, empreinte).
- **Synchro Enable Banking en production** — canal principal. Session OAuth, rafraîchissement des transactions, gestion de l'expiration du consentement.
- **Import CSV/PDF** — état des lieux au-delà de la fenêtre API, et secours si une banque n'est pas synchronisable.
- **Saisie manuelle** — pour tout compte ou mouvement qu'aucun des deux canaux ne couvre.
- **Déduplication croisée** entre les trois canaux, algorithme validé sur données réelles (§6).
- Calcul et affichage du solde disponible agrégé et par compte, recalculé à chaque ingestion.
- **Indicateur de fraîcheur** du solde (date de dernière synchro réussie), imposé par la nature du canal.
- Authentification locale par mot de passe ; secrets Enable Banking chiffrés au repos.
- Frontend unique React Vite, logique métier partagée et tenue hors du DOM. **Une seule interface, identique sur mobile et sur desktop** *(requalifié par Lamoms le 2026-08-03 — la ligne exigeait des layouts différenciés par breakpoints)*. Le besoin du MVP est de vérifier que le backend et le frontend fonctionnent ensemble, sur les deux appareils, avec le MÊME parcours ; la différenciation desktop est une amélioration ultérieure. La logique vivant hors du DOM, elle se fera sans réécriture.
- **Hors connexion : service worker, sans `manifest.json` au MVP** *(précisé le 2026-08-03)*. L'installation sur l'écran d'accueil n'est requise ni par le mode hors connexion, qui tient au service worker, ni par la vérification du parcours, qui se fait à l'URL. Le mot « PWA » employé ailleurs dans ce document désigne cette cible-là, atteinte par étapes.

### Limite explicite du MVP — à ne pas masquer

Le MVP tourne sur le PC hôte. **Quand le PC est éteint, l'application mobile n'est pas servie.** En phase 1, la promesse « savoir sa situation à tout moment » n'est donc pas tenue sur mobile hors du domicile ; elle le sera à la migration vers le Raspberry Pi, sans réécriture.

Cette limite est **assumée et arbitrée** (voir P16), pas subie : le desktop est pleinement utilisable, le mobile fonctionne à domicile, et le mode hors connexion déjà spécifié couvre le reste — le téléphone affiche le dernier solde connu avec sa date (« solde au 30/07 à 18 h 12 »), qui est un état conçu et lisible, pas une panne.

**Le Verdict devra juger le MVP sur ce périmètre annoncé**, pas sur la promesse complète.

### Hors périmètre

- Simulateur « et si je dépense X ». *(écarté par l'utilisateur — l'impact immédiat, c'est le solde recalculé après ingestion de la transaction réelle)*
- Catégorisation, budgets, prévisions, graphiques. *(ne servent pas la Core Feature : savoir combien j'ai maintenant)*
- Multi-utilisateur, auth cloud, partage.
- OCR / PDF scannés. Les relevés bancaires FR ont une couche texte dans plus de 95 % des cas ; les autres sont refusés explicitement, avec bascule sur CSV ou saisie manuelle.

## 5. Parcours utilisateur (méthode Micro-UX)

**Core Feature** (fixée par Hermès, non redéfinie ici) : l'affichage de la trésorerie disponible à l'instant T, agrégée et par compte.

### 5.0 Principe directeur — l'arbre

*Posé par l'utilisateur le 2026-07-31, et il gouverne tout ce qui suivra.*

La racine, c'est la Core Feature : **savoir son solde disponible à tout moment**. Tout ce qu'on ajoute doit pousser à partir d'elle et la servir. On n'ajoute jamais pour ajouter : si un ajout n'apporte pas de valeur réelle à la racine, il n'entre pas — et ce qui manque se rajoutera quand le besoin sera démontré, jamais par anticipation.

Ce principe n'est pas une intention générale : il est **le critère d'admission** de toute évolution future. Une fonctionnalité qui ne se rattache pas à la racine doit être refusée, même si elle est courante dans les applications de finances.

### 5.1 Hiérarchie des features

Tout gravite autour de la Core Feature :
- **Synchro Enable Banking** — garde le solde juste sans effort de l'utilisateur. C'est ce qui rend le mot « à tout moment » vrai.
- **Import CSV/PDF** — étend l'historique au-delà de la fenêtre API et couvre les banques non synchronisables.
- **Saisie manuelle** — comble les trous restants.
- **Déduplication** — garantit que le chiffre affiché est juste quand plusieurs canaux décrivent le même mouvement.

Ce qui ne sert pas la Core Feature sort du périmètre prioritaire, y compris des fonctions attendues d'une app de finances (catégories, budgets, courbes). Elles ne répondent pas à « combien j'ai maintenant ».

### 5.2 User flow principal, réaliste

**« Est-ce que je peux dépenser ça ? »** — le cas d'usage dominant, souvent debout, sur mobile.

| Étape | Ce qu'il voit | Ce qu'il fait | Où ça peut bloquer |
|---|---|---|---|
| 1 | Le solde agrégé, immédiatement à l'ouverture | Rien | La session bancaire a expiré → il doit savoir que le chiffre date, pas le découvrir plus tard |
| 2 | La fraîcheur du chiffre (« à jour il y a 2 h ») | Lit | Sans cet indicateur, il ne peut pas juger s'il peut s'y fier |
| 3 | Le détail par compte | Un geste, sans navigation | Le Livret A n'est pas synchronisable → il doit comprendre pourquoi ce compte affiche autre chose |
| 4 | Les dernières transactions | Fait défiler | Un achat d'hier n'apparaît pas (délai bancaire) → il croit à un bug s'il n'est pas prévenu |

### 5.3 Navigation principale

Orientée sur la question de l'utilisateur, jamais sur l'architecture :
- **Combien j'ai** — l'écran d'accueil, le solde agrégé.
- **Où** — la répartition par compte.
- **Quoi** — les transactions.

Les actions techniques (synchroniser, importer un fichier, connecter une banque) ne sont pas des rubriques de navigation. Elles apparaissent là où l'utilisateur en a besoin : le bouton « reconnecter » sur le compte concerné, l'import à l'endroit où un trou d'historique est visible.

### 5.4 Chemins secondaires et cas limites

Chacun mène à une destination claire, jamais à une page blanche :

| Situation | Destination |
|---|---|
| Aucun compte connecté (premier lancement) | L'écran d'accueil **est** le couloir d'onboarding, pas un écran vide |
| Consentement expiré (date lue dans `access.valid_until`) | Solde affiché avec sa date + bandeau « reconnecter », en un geste |
| Banque indisponible | Dernier solde connu + sa fraîcheur, jamais un écran d'erreur nu |
| Fichier CSV au format non reconnu | Refus explicite nommant ce qui n'est pas compris + proposition de saisie manuelle |
| PDF sans couche texte | Refus explicite + proposition de passer par le CSV |
| Trou d'historique (au-delà de 90 j) | Le manque est visible et propose l'import qui le comble |

### 5.5 Actions clés et micro-victoires

| Action | Retour immédiat |
|---|---|
| Connexion d'une banque réussie | « 2 comptes connectés » et le solde s'affiche dans la foulée |
| Synchro | Le solde se met à jour, l'horodatage de fraîcheur repart à zéro |
| Import d'un fichier | « 27 transactions ajoutées, 3 doublons ignorés » — la déduplication devient visible, donc digne de confiance |
| Saisie manuelle | Le solde bouge sous ses yeux |

### 5.6 Notifications

**Aucune au MVP.** L'utilisateur ouvre l'app quand il a besoin de savoir ; le déclencheur est son besoin, pas une alerte. Une notification ne se justifierait que pour le ramener au bon moment pour la bonne raison — par exemple un consentement sur le point d'expirer, qui casserait la synchro. Ce cas ne survient qu'une fois tous les six mois : il se traite dans l'app, pas par notification.

### 5.7 Onboarding — un couloir vers la première valeur

**Première valeur concrète : voir son vrai solde agrégé, pour la première fois.**

Le couloir, et rien d'autre : mot de passe local → connexion bancaire (SCA) → **le solde s'affiche**.

Ce qui est délibérément écarté du couloir : l'import de l'historique. Puisque la synchro fournit le solde courant, l'état des lieux n'est pas nécessaire pour atteindre la première valeur. Le demander d'emblée ferait passer l'utilisateur par un import de fichiers avant de voir le moindre chiffre.

### 5.8 Découverte progressive

Une fois le premier solde affiché :
- Le trou d'historique devient visible dans la liste des transactions et propose l'import qui le comble.
- L'ajout d'un compte non synchronisable (Livret A) est suggéré au moment où l'utilisateur constate que son total ne couvre pas tout.
- La saisie manuelle se révèle quand un mouvement manque.

## 6. Exigences fonctionnelles observables

- **Solde** : le solde agrégé est égal à la somme des soldes par compte, eux-mêmes égaux à la somme de leurs transactions. Recalculé à chaque ingestion, jamais à la main.
- **Fraîcheur** : chaque solde porte la date de sa dernière synchro réussie.
- **Synchro Enable Banking — trois durées distinctes** *(précisé le 2026-08-01)* :
  - **Historique : 90 jours en arrière sur La Banque Postale**, qui refuse au-delà (`HTTP 422 / WRONG_TRANSACTIONS_PERIOD`, vérifié en direct le 2026-07-31). Ce n'est **pas** une constante Enable Banking — leur documentation indique que la plupart des ASPSP donnent au moins un an. Toute autre banque exige de re-constater sa fenêtre.
  - **Consentement** : durée demandée dans `valid_until` du `POST /auth`, **plafonnée par `maximum_consent_validity`** (en secondes) que `GET /aspsps` renvoie pour la banque — 180 jours pour la majorité des ASPSP, plafond issu de l'amendement EBA RTS de 2022. La valeur accordée se lit dans `access.valid_until` ; c'est elle qui fait foi, jamais une durée codée en dur.
  - **Jeton d'accès ASPSP** : rafraîchi **automatiquement** par Enable Banking, rien à gérer côté client.
- **Format réel de l'API** (constaté) : le libellé est dans `remittance_information`, **liste de chaînes** à joindre — pas `remittance_information_unstructured` ; le montant de `transaction_amount` est **non signé**, le sens vient de `credit_debit_indicator` (`CRDT`/`DBIT`).
- **Déduplication** — algorithme validé sur données réelles (27/27 CSV ↔ API), à porter en TypeScript :
  - clé primaire `(date_ISO, montant_en_centimes)` ;
  - **file FIFO par clé** — deux mouvements distincts de même montant le même jour restent deux mouvements ;
  - score de Jaccard sur les mots du libellé **uniquement comme départage**, quand plusieurs candidats partagent la clé ;
  - signe pris sur `credit_debit_indicator`, **jamais déduit du libellé**.
- **Traçabilité** : chaque transaction conserve ses sources (`ENABLE_BANKING`, `CSV_IMPORT`, `PDF_RELEVE`, `MANUEL`) et son identifiant externe s'il existe.
- **Échec explicite** : un fichier au format non reconnu, ou un PDF sans couche texte, est refusé avec un message clair — jamais ingéré partiellement.
- **Idempotence** : ré-importer un fichier déjà traité, ou resynchroniser, ne change pas le solde.
- **Sécurité** : mot de passe local ; secrets Enable Banking chiffrés au repos ; aucun secret en clair.

## 7. Critères d'acceptation

1. À l'ouverture, le solde agrégé s'affiche sans action de l'utilisateur, avec sa date de fraîcheur.
2. Le solde agrégé est exactement la somme des soldes par compte, eux-mêmes sommes de leurs transactions.
3. Une synchro Enable Banking rejouée deux fois de suite ne modifie pas le solde ni le nombre de transactions.
4. Un import croisé CSV + API sur la même période ne produit aucun doublon et ne perd aucune transaction — vérifiable sur les données réelles du lab (27 mouvements, 0 orphelin des deux côtés).
5. Deux transactions distinctes de même montant le même jour restent deux transactions.
6. Un fichier au format non reconnu est refusé avec un message explicite, sans ingestion partielle.
7. Consentement expiré : le solde reste affiché avec sa date, accompagné d'un chemin de reconnexion en un geste.
8. Authentification locale fonctionnelle ; aucun secret lisible en clair au repos.

## 8. Contraintes, risques et questions ouvertes

- **Contraintes mesurées** : fenêtre d'historique de 90 jours, refusée par l'API elle-même au-delà (`422 / WRONG_TRANSACTIONS_PERIOD`) ; durée du consentement variable, à lire dans `access.valid_until`. L'état des lieux complet passe donc nécessairement par l'import.
- **Le Livret A n'est pas dans le périmètre de l'API** : la session autorisée ne contient qu'un seul compte (`cash_account_type: CACC`, usage `PRIV`) — vérifié en direct le 2026-07-31. La saisie manuelle prévue en T1 n'est pas un repli, c'est le seul chemin. (P19 refermé.)
- **Hétérogénéité des CSV bancaires FR** (encodage, séparateur, formats de date et de montant) : traitée par un registre de formats par banque et un refus explicite si le format n'est pas reconnu.
- **Limite connue du jeu de test de déduplication** : entre le CSV et l'API de La Banque Postale, les libellés se révèlent quasi identiques. Le cas « même transaction, libellé franchement différent selon le canal » n'a pas été éprouvé, et le PDF n'a jamais été confronté à l'API. Non bloquant — la clé primaire ne dépend pas du libellé — mais le jeu de test devra couvrir ces deux cas.
- **Aucune question ouverte bloquante.** Les quatre décisions du brief sont tranchées.

## 9. Décisions structurantes

Reprises du rapport de faisabilité AGY via le brief Hermès, et des arbitrages de l'utilisateur — non choisies par Claude.

- **Stack** : Fullstack TypeScript — Node.js/Fastify, React Vite PWA, Drizzle ORM, SQLite. 100 % TypeScript, aucune dépendance Python.
  *Raisons* : un seul langage de bout en bout avec contrats partagés, PWA installable mobile et desktop depuis une base unique, SQLite embarqué sans infrastructure lourde.
  *Alternative écartée* : Python/FastAPI + React (duplication des types).
- **Emplacement des données : une instance hébergée fait foi**, mobile et desktop sont des clients. *(tranché le 2026-07-31)*
  *Conséquence qui referme le débat PWA* : le téléphone ne détenant pas les données de référence, l'éviction du stockage navigateur ne fait perdre qu'un cache reconstructible. La PWA reste viable.
- **Le MVP tourne sur le PC hôte — limite assumée en phase 1.** Voir §4, « Limite explicite du MVP ». Le Raspberry Pi la lèvera ensuite, sans réécriture : même code, même fichier de base, même réseau privé.
- **Accès du mobile à l'instance : Tailscale** (réseau privé chiffré, aucun port ouvert sur la box, gratuit). Cloudflare Tunnel est écarté pour des données bancaires : un tiers y termine le TLS et pourrait lire soldes, transactions et jetons.
- **Connexion bancaire (SCA) : c'est le serveur qui reçoit le retour de la banque** — le PC hôte d'abord, le Raspberry Pi ensuite. *(précisé par l'utilisateur le 2026-07-31)* Le mobile consomme une session déjà autorisée — quelques reconnexions par an, selon la date renvoyée dans `access.valid_until`.
  *Pourquoi cette formulation plutôt que « SCA depuis le desktop »* : le rôle appartient au **serveur**, pas à un type de machine. Quand le serveur deviendra le RPi — sans écran ni navigateur — rien ne se déplace, et c'est précisément ce qui rend la migration transparente.
  *Conséquence à respecter, MVP* : l'authentification forte doit se **terminer sur la machine serveur**, non par choix d'ergonomie mais parce que `https://localhost:3443/` ne résout que sur cette machine. Lancée depuis le téléphone, la banque renverrait le mobile vers lui-même.
  *Conséquence, phase RPi* : avec `https://gestio.software/auth/callback`, URL publique, le callback atteint le serveur quel que soit l'appareil — l'authentification peut alors partir du mobile. **C'est l'URL de redirection qui lève la contrainte, pas une réécriture du code.**
  Aucune exposition publique n'est nécessaire en MVP — ni Tailscale Funnel, ni nom `.ts.net`.
  **URL de redirection faisant autorité**, enregistrées par l'utilisateur chez Enable Banking — trois au 2026-08-01 :
  - `https://localhost:3443/` — **celle du MVP**. Ajoutée par l'utilisateur parce que le port 3000 est occupé en permanence sur la machine hôte par le serveur Lamoms, ce qui empêchait aussi de lancer les tests.
  - `https://localhost:3000/` — enregistrée, mais **inutilisable sur cette machine** pour la raison ci-dessus.
  - `https://gestio.software/auth/callback` — phase Raspberry Pi ou instance distante.

  ⚠️ **Ne pas reprendre la `redirect_url` du script du lab** (`http://localhost:3000/callback`) : elle n'est pas enregistrée et l'autorisation échouerait au retour de la banque, après l'authentification forte. Voir P18.
  *Contrainte d'implémentation* : `https://localhost:3443/` impose un certificat TLS local — le backend doit servir en HTTPS, sur le port 3443, dès le développement. Un certificat auto-signé suffit : la redirection est faite par le navigateur de l'utilisateur, aucune autorité de certification n'intervient.
- **Authentification forte : pattern Out-of-Band + polling.** La PWA ouvre l'URL bancaire à l'extérieur et interroge le backend jusqu'à ce que la session soit établie ; c'est le backend qui reçoit le retour de la banque. L'instance PWA n'est jamais fermée, ce qui supprime — au lieu de contourner — le problème iOS de retour dans l'application.
- **Chiffrement au repos** : base chiffrée via SQLCipher (`better-sqlite3-multiple-ciphers`), clé en variable d'environnement hors dépôt ; mot de passe utilisateur en Argon2id ; jetons Enable Banking stockés dans la base chiffrée.
- **Sauvegarde** : `sqlcipher_export()` en tâche planifiée quotidienne, rotation sur 30 jours, copie sur un support secondaire. La sauvegarde reste chiffrée et doit se rouvrir avec la même clé.
  ⚠️ **Ce n'est pas `sqlite3 .backup`**, contrairement à ce que ce PRD indiquait jusqu'au 2026-08-01. Erreur signalée par Codex, preuve à l'appui : le shell refuse la copie page à page entre bases chiffrées (`backup is not supported with encrypted databases`). Voir P20. *(exigence absente du cadrage initial, apportée par la recherche AGY — sans elle, la perte du fichier fait perdre l'intégralité des données)*
- **Canal principal : Enable Banking en production.** L'accès était configuré et validé par l'utilisateur depuis le départ ; la contrainte réglementaire qui l'avait fait écarter n'existait pas. CSV/PDF pour l'état des lieux et le secours.
- **`gestio-releves`** (projet Python antérieur) reste à sa place, intact. Il sert de référence de logique de parsing et son corpus de relevés réels sert de jeu de test. Le parsing est réécrit en TypeScript.
