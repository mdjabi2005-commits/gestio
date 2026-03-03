# 💰 Gestio V4

> Application de **gestion financière personnelle** — Python · Streamlit · SQLite

[![Build](https://github.com/mdjabi2005-commits/gestio/actions/workflows/build.yml/badge.svg)](https://github.com/mdjabi2005-commits/gestio/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Python 3.12+](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/)

---

## ✨ Fonctionnalités

| Module | Description |
|--------|-------------|
| 🏠 **Accueil** | Tableau de bord avec KPI, graphiques et vue calendrier |
| 📊 **Transactions** | CRUD complet, filtrage avancé, graphiques Plotly & sunburst |
| 🔄 **Récurrences** | Gestion des transactions récurrentes (loyer, abonnements…) |
| 📎 **Pièces jointes** | Associer des fichiers (tickets, factures) aux transactions |
| 🔍 **OCR** | Extraction automatique depuis tickets/PDF (RapidOCR + LLM) |
| 📥 **Import** | Import en masse depuis fichiers externes |

---

## 🏗️ Architecture

Le projet suit une architecture **Domain-Driven Design (DDD)** :

```
V1/
├── main.py                          ← Point d'entrée Streamlit
├── pyproject.toml                   ← Dépendances & config projet (uv)
│
├── launcher/                        ← Package launcher (mini-EXE Tkinter)
│   ├── launcher.py                  ← Point d'entrée principal
│   ├── launcher_core.py             ← Logique métier (venv, uv sync, chemins)
│   ├── launcher_ui.py               ← Fenêtre Tkinter
│   └── gestio-launcher.spec        ← Spec PyInstaller (mini-launcher ~5 Mo)
│
├── config/                          ← Configuration globale
│   ├── paths.py                     ← Chemins (DB, dossiers)
│   └── logging_config.py            ← Logging structuré
│
├── domains/                         ← Domaines métier (DDD)
│   ├── home/
│   │   └── pages/home.py            ← Page d'accueil / tableau de bord
│   │
│   └── transactions/
│       ├── database/                ← Modèles, repositories, schéma SQLite
│       ├── services/                ← Logique métier
│       ├── recurrence/              ← Service récurrences
│       ├── ocr/                     ← Extraction de texte (RapidOCR, PDF, LLM)
│       ├── pages/                   ← Pages Streamlit
│       └── view/                    ← Composants visuels (charts, calendrier)
│
├── shared/                          ← Utilitaires transversaux
│   ├── database/connection.py       ← Connexion SQLite centralisée
│   ├── ui/                          ← Helpers UI, styles, toasts, erreurs
│   ├── services/security.py         ← Sécurité
│   └── utils/                       ← Convertisseurs, parsers
│
├── resources/                       ← Assets statiques
│   ├── styles/                      ← CSS (gestio.css, calendar.css)
│   └── icons/                       ← Icônes app
│
├── scripts/                         ← Scripts de build
│   ├── prepare_dist.py              ← Copie les sources dans dist/app/
│   └── generate_iss.py              ← Génère le script Inno Setup
│
└── .github/
    └── workflows/
        └── build.yml                ← Build Windows + signature Azure + Release
```

---

## 🚀 Installation & Lancement

### Prérequis

- **[uv](https://docs.astral.sh/uv/)** (gestionnaire de dépendances — inclut Python)

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/mdjabi2005-commits/gestio.git
cd gestio

# Installer les dépendances
uv sync
```

### Lancement (mode développement)

```bash
# Via Streamlit directement
uv run streamlit run main.py

# Via le launcher Tkinter (ouvre Chrome en mode app)
uv run gestio
```

### Build Windows (installeur)

Le build est entièrement géré par la CI. Pour tester localement :

```bash
# 1. Copier les sources dans dist/app/
python scripts/prepare_dist.py

# 2. Compiler le mini-launcher Tkinter (~5 Mo)
pip install pyinstaller
pyinstaller launcher/gestio-launcher.spec --noconfirm

# 3. Générer le script Inno Setup
python scripts/generate_iss.py
```

> Le workflow CI/CD (`build.yml`) automatise le build + signature Azure + release GitHub sur les tags `v*.*.*`.

---

## 📦 Architecture de distribution

Depuis la **v4 (#23)**, Gestio abandonne PyInstaller pour l'application complète au profit de **uv standalone** :

```
%APPDATA%\Gestio\
├── GestioLauncher.exe   ← Mini-launcher Tkinter (~5 Mo, seul EXE compilé)
├── uv\
│   └── uv.exe           ← uv standalone (gère Python 3.12 + dépendances)
└── app\
    ├── main.py          ← Sources Python du projet
    ├── pyproject.toml
    ├── uv.lock
    └── ...
```

**Flux au premier lancement** : `uv sync` télécharge Python 3.12 + toutes les dépendances → venv créé dans `app/.venv`.  
**Lancements suivants** : venv déjà présent → démarrage rapide.

**Avantages** :
- Installeur léger (~15 Mo vs ~500 Mo)
- OCR (onnxruntime, rapidocr) installé nativement → aucun problème de DLL
- Installation sans droits admin (`%APPDATA%`)
- Pas de dépendances natives à lister manuellement dans un `.spec`

---

## 🛠️ Stack technique

| Composant | Technologie |
|-----------|-------------|
| **Langage** | Python 3.12 |
| **UI** | Streamlit |
| **Données** | SQLite + Pandas |
| **Graphiques** | Plotly, Matplotlib |
| **Validation** | Pydantic |
| **OCR** | RapidOCR, pdfminer.six, Ollama / Groq (LLM) |
| **Dépendances** | uv |
| **Build** | Mini-launcher PyInstaller + Inno Setup + uv standalone |
| **CI/CD** | GitHub Actions + Azure Code Signing |

---

## 📐 Conventions

### Commits (Conventional Commits)

```
feat: ajouter export PDF des transactions
fix: corriger le calcul des récurrences mensuelles
chore: mettre à jour les dépendances
docs: documenter le module OCR
refactor: extraire la logique de filtrage dans un service
test: ajouter tests unitaires pour transaction_service
```

### Branches

| Préfixe | Usage |
|---------|-------|
| `main` | Branche principale stable |
| `feat/` | Nouvelles fonctionnalités |
| `fix/` | Corrections de bugs |
| `chore/` | Maintenance, refactoring |

---

## 📄 Licence

[MIT](LICENSE) © 2026 DJABI

