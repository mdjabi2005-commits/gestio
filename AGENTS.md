# Gestio

## Projet
Gestion de trésorerie personnelle : savoir exactement combien tu disposes, où, et l'impact immédiat d'une dépense ou d'un revenu récurrent.

## Problème
Pas de vue fiable sur la trésorerie disponible → décisions d'argent à l'aveugle.

## Core Feature
Affichage de la trésorerie disponible à l'instant T, agrégée et par compte.

## Fonctionnement
- **État des lieux** : import CSV/PDF de toutes les transactions depuis la création des comptes.
- **Suivi courant** : synchro via Enable Banking API (90 jours d'historique). Comptes non disponibles → import CSV/PDF mensuel ou saisie manuelle. Le **Livret A n'est pas exposé par l'API** (vérifié : la session ne renvoie que le compte courant, `CACC`/`PRIV`) — il passe par la saisie manuelle, ce n'est pas un repli mais le seul chemin.
- **Bilan mensuel** : import des transactions du mois pour chaque compte.

## Scope initial
- 1 utilisateur.
- Comptes : bancaire + Livret A (évolutif).
- Frontend partagé entre mobile et desktop, UI différente par plateforme.

## Décisions

### Données
- Pompe principale : Enable Banking API (validée en production, 43 transactions réelles lues).
- Fenêtre API : 90 jours d'historique — l'API refuse elle-même au-delà (`HTTP 422 / WRONG_TRANSACTIONS_PERIOD`). La fin du consentement se **lit** dans `access.valid_until` renvoyé par `GET /sessions/{id}` ; ce n'est pas une constante et surtout pas 180 jours.
- Fallback : CSV (BP validé), puis PDF si CSV indisponible.
- Moteur de déduplication : clé (date, centimes) + FIFO + Jaccard tokens — validé 27/27, 98.6% moyen.

### Stack technique
- **Backend** : Node.js / Fastify
- **Base de données** : SQLite via `better-sqlite3-multiple-ciphers` (SQLCipher AES-256 pour les tokens Enable Banking)
- **ORM** : Drizzle
- **Frontend** : React Vite PWA — UI différenciée mobile/desktop depuis une base de code unique
- **Langage** : TypeScript fullstack

### Infrastructure
- **Hébergement cible** : Raspberry Pi always-on (2–5 W). Phase MVP : PC hôte.
- **Accès mobile depuis l'extérieur** : Tailscale (WireGuard E2EE, 0 port ouvert, 0 €/mois).
- **redirect_url Enable Banking** : `https://localhost:3000/` (MVP) et `https://gestio.software/auth/callback` (phase RPi). Ce sont les **deux seules** URL enregistrées par l'utilisateur. ⚠️ Toute autre URL échoue **après** l'authentification forte — ne pas inventer, ne pas reprendre celle du script du lab (`http://localhost:3000/callback`). Tailscale Funnel est écarté : aucune exposition publique n'est nécessaire.
- **Le MVP tourne sur le PC hôte, pas sur le RPi** → le PC est éteint une partie du temps, donc le mode hors connexion est requis : dernier solde connu + sa date, jamais un écran d'erreur nu. Le RPi always-on lèvera cette contrainte plus tard, sans réécriture.
- **SCA Enable Banking : c'est le SERVEUR qui reçoit le retour de la banque** — le PC hôte d'abord, le RPi ensuite. Pattern Out-of-Band Auth + polling : le backend fabrique l'URL bancaire, l'utilisateur l'ouvre dans un vrai navigateur, le backend encaisse le callback et le client interroge le backend jusqu'à ce que la session soit établie. Ça évite le problème iOS Safari standalone et ça rend la migration PC → RPi transparente : le rôle ne se déplace pas, il reste au serveur.
  - **En MVP, l'authentification forte se termine sur la machine serveur**, non par choix mais parce que la `redirect_url` est `https://localhost:3000/` : `localhost` ne résout que sur cette machine. Depuis le téléphone, la banque renverrait le mobile vers lui-même.
  - **En phase RPi**, la `redirect_url` devient `https://gestio.software/auth/callback`, une URL publique : le callback atteint le serveur quel que soit l'appareil, donc l'authentification peut alors être lancée depuis le mobile. C'est l'URL qui lève la contrainte, pas le code.
- **Sauvegarde** : `sqlite3 .backup` en cron journalier, rotation 30 jours.
- **Portabilité** : migration PC → RPi sans réécriture (même stack, même fichier DB).

### Exclusions actées
- Cloudflare Tunnel : exclu (terminaison TLS côté Cloudflare = données bancaires lisibles par un tiers).

## Équipe
```
Hermès → AGY → Claude → Codex → Copilot (si nécessaire) → Hermès-juge
```
