import os
from pathlib import Path
import platformdirs

# Racine du projet
APP_ROOT = Path(__file__).parent.parent
APP_NAME = "Gestio"

# Folder paths - Production & Cross Platform
DATA_DIR = platformdirs.user_data_dir(appname=APP_NAME, appauthor=False)

# Database
DB_PATH = os.path.join(DATA_DIR, "finances.db")

# User Desktop folders for active scanning
DESKTOP_DIR = platformdirs.user_desktop_dir()

# Scan directories (Tickets only)
TO_SCAN_DIR = os.path.join(DESKTOP_DIR, "Gestio_Tickets")
SORTED_DIR = os.path.join(DATA_DIR, "tickets_tries")

# Revenue directories
REVENUS_A_TRAITER = os.path.join(DESKTOP_DIR, "Gestio_Revenus")
REVENUS_TRAITES = os.path.join(DATA_DIR, "revenus_traites")

# Application Logs
APP_LOG_PATH = os.path.join(DATA_DIR, "gestio_app.log")

# Objectifs attachments
OBJECTIFS_DIR = os.path.join(DATA_DIR, "objectifs")

# Fichier .env utilisateur (hors dossier d'installation, accessible en écriture)
# Recherche dans : APPDATA/Gestio/.env OU projet/backend/.env
ENV_PATH = Path(DATA_DIR) / ".env"
if not ENV_PATH.exists():
    # Fallback: chercher dans le dossier du projet
    PROJECT_ENV = APP_ROOT / ".env"
    if PROJECT_ENV.exists():
        ENV_PATH = PROJECT_ENV

# Create directories
for directory in [
    DATA_DIR,
    TO_SCAN_DIR,
    SORTED_DIR,
    REVENUS_A_TRAITER,
    REVENUS_TRAITES,
    OBJECTIFS_DIR,
]:
    os.makedirs(directory, exist_ok=True)


# ─────────────────────────────────────────────────────────────────────────────
# Distribution — Fichiers nécessaires pour le package d'installation final
# Source de vérité unique : gestio.iss, build.yml et build_archive.py lisent ici.
#
# Séparation claire sur la machine de l'utilisateur :
#
#   AppData\Local\Gestio\               ← DATA_DIR  (données utilisateur)
#     ├── finances.db                   ← DB_PATH
#     ├── gestio_app.log                ← APP_LOG_PATH
#     ├── tickets_tries\                ← SORTED_DIR
#     ├── revenus_traites\              ← REVENUS_TRAITES
#     └── objectifs\                   ← OBJECTIFS_DIR
#
#   AppData\Local\Gestio\app\           ← dossier d'installation (INSTALL_FILES)
#     ├── launcher.py                   → point d'entrée
#     ├── pyproject.toml + uv.lock      → dépendances
#     ├── backend\                      → code FastAPI
#     └── frontend\out\                 → build statique Next.js
# ─────────────────────────────────────────────────────────────────────────────

# Fichiers et dossiers à INCLURE dans le package (strict minimum d'exécution)
INSTALL_FILES = [
    "launcher.py",          # Point d'entrée : démarre uvicorn + navigateur
    "pyproject.toml",       # Décrit les dépendances (lu par uv)
    "uv.lock",              # Lockfile exact pour reproductibilité
    "backend",              # Code FastAPI (api/, domains/, shared/, config/)
    "frontend/out",         # Build Next.js statique servi par FastAPI
    "distribution/favicon.ico",  # Icône de l'application
]

# Dossiers/fichiers à EXCLURE (dev, tests, CI, documentation)
INSTALL_EXCLUDES = [
    # Dépendances et caches (jamais dans l'installeur)
    ".git",
    ".venv",
    "frontend/node_modules",
    "__pycache__",
    ".pytest_cache",
    ".ruff_cache",
    "dist",
    "build",
    # Code source frontend (seul le build out/ est nécessaire)
    "frontend/src",
    "frontend/public",
    "frontend/.next",
    "frontend/package.json",
    "frontend/package-lock.json",
    "frontend/tsconfig.json",
    "frontend/next.config.mjs",
    "frontend/postcss.config.mjs",
    "frontend/eslint.config.mjs",
    # Scripts de migration/dev (one-shot, pas nécessaires en prod)
    "backend/scripts",
    # Tests (inutiles en production)
    "tests",
    "pytest.ini",
    # CI/CD et configuration git
    ".github",
    ".gitattributes",
    ".gitignore",
    # Scripts utilitaires dev
    "scripts",
    # Documentation dev
    "AGENTS.md",
    "ARCHITECTURE.md",
    # Le dossier distribution lui-même (recette, pas le résultat)
    "distribution/gestio.iss",
]
