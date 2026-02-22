# 📖 Glossaire du Domaine Transactions

Ce document explique les termes techniques utilisés dans le domaine Transactions.

---

## 🏷️ Champs de Transaction

### `type`

**Type de transaction**

- `Dépense` - Argent qui sort
- `Revenu` - Argent qui rentre
- `Transfert+` - Virement entrant
- `Transfert-` - Virement sortant

### `categorie` / `sous_categorie`

**Classification hiérarchique des dépenses/revenus**

Exemples :

- `Alimentation` / `Supermarché`
- `Logement` / `Loyer`
- `Voiture` / `Essence`

> **Note** : Les clés sont en français dans le code pour simplifier la migration depuis l'ancien système.

### `montant`

**Montant en euros** - Toujours positif dans la DB. Le type (Dépense/Revenu) détermine le sens.

### `source`

**Origine de la transaction**

| Valeur            | Signification                              |
|-------------------|--------------------------------------------|
| `manual`          | Saisie manuelle                            |
| `ocr_batch`       | Ticket scanné via OCR                      |
| `pdf_import`      | Relevé PDF importé                         |
| `import_v2`       | Import CSV/Excel                           |
| `récurrente_auto` | Générée automatiquement par une récurrence |
| `récurrente`      | Profuture (prévision)                      |

### `external_id`

**Identifiant externe unique**

- **Usage principal** : Éviter les doublons lors des imports bancaires
- **Sources communes** : ID de la banque (FITID), hash du ticket OCR
- **Indexé** : `UNIQUE` en base de données

### `compte_iban`

**IBAN du compte** - Permet de suivre sur quel compte la transaction a eu lieu.

### `recurrence`

**Fréquence de répétition** (si applicable)

- `mensuelle`
- `hebdomadaire`
- `annuelle`

### `date_fin`

**Date de fin** - Pour les transactions récurrentes : quand la récurrence s'arrête.

---

## 🔄 Récurrence

### `backfill` (Rattrapage)

**Génération des transactions passées**

À chaque démarrage, le système vérifie si des occurrences ont été manquées depuis la dernière exécution et les crée avec
`source='récurrente_auto'`.

### `projection` / `echeances`

**Prévision future**

Les occurrences futures sont stockées dans la table `echeances` (pas dans `transactions`) pour permettre :

- Affichage du "reste à vivre"
- Alertes de trésorerie
- Planning des paiements à venir

### `statut` (de récurrence)

**État d'une récurrence**

- `active` - En cours
- `paused` - En pause
- `terminated` - Terminée

---

## 📎 Pièces Jointes (Attachments)

### `SORTED_DIR`

**Dossier des tickets triés**

Structure : `sorted/{Catégorie}/{Sous-catégorie}/{timestamp}_{fichier}`

### `REVENUS_TRAITES`

**Dossier des revenus importés**

Structure : `revenus/{Catégorie}/{Sous-catégorie}/{timestamp}_{fichier}`

---

## 💸 Virements

### `iban_source` / `iban_destination`

IBAN du compte émetteur / destinataire.

### `external_id_source` / `external_id_destination`

Identifiants externes des virements (ID banque).

---

## 🔧 Conventions

### Clés en français vs anglais

| Emplacement      | Langue        | Raison                          |
|------------------|---------------|---------------------------------|
| Base de données  | 🇫🇷 Français | Migration depuis ancien système |
| Modèles Pydantic | 🇫🇷 Français | Alignés sur la DB               |
| UI (Streamlit)   | 🇬🇧 Anglais  | Meilleure DX                    |
| README/Doc       | 🇫🇷 Français | Langue du projet                |

### Pattern Repository

```
Pages → Services → Repositories → SQL (SQLite)
```

- **Pages** : UI, points d'entrée
- **Services** : Logique métier, transformation
- **Repositories** : Accès données, SQL
- **Models** : Validation Pydantic

---

## 📁 Fichiers clés

| Fichier                            | Rôle                        |
|------------------------------------|-----------------------------|
| `database/model.py`                | Définition Transaction      |
| `database/repository.py`           | Accès SQL transactions      |
| `services/transaction_service.py`  | Logique métier transactions |
| `recurrence/recurrence_service.py` | Génération occurrences      |
| `services/attachment_service.py`   | Gestion fichiers            |
