"""
Gestio - Prepare dist/ pour Inno Setup (mode uv-native)

Copie les sources necessaires dans dist/app/ pour l'installeur.
Exclut : .venv, __pycache__, .git, tests, docs, *.pyc, .agent

Usage : uv run python scripts/prepare_dist.py
"""

import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
DIST_APP = ROOT / "dist" / "app"

# Fichiers/dossiers a copier dans dist/app/
SOURCES = [
    "main.py",
    "launcher.py",
    "pyproject.toml",
    "uv.lock",
    "config",
    "domains",
    "shared",
    "resources",
]

# Patterns a exclure lors de la copie
EXCLUDE_DIRS = {"__pycache__", ".venv", ".git", "tests", "docs", ".agent", "node_modules"}
EXCLUDE_EXTS = {".pyc", ".pyo"}


def _should_exclude(path: Path) -> bool:
    """Verifie si un fichier/dossier doit etre exclu."""
    for part in path.parts:
        if part in EXCLUDE_DIRS:
            return True
    if path.suffix in EXCLUDE_EXTS:
        return True
    return False


def _copy_filtered(src: Path, dst: Path) -> int:
    """Copie src vers dst en excluant les patterns indesirables."""
    count = 0
    if src.is_file():
        if not _should_exclude(src):
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)
            count = 1
    elif src.is_dir():
        for item in src.rglob("*"):
            if item.is_file() and not _should_exclude(item.relative_to(src)):
                rel = item.relative_to(src)
                target = dst / rel
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(item, target)
                count += 1
    return count


def main() -> None:
    # Nettoyer dist/app si existant
    if DIST_APP.exists():
        shutil.rmtree(DIST_APP)
    DIST_APP.mkdir(parents=True)

    total = 0
    for name in SOURCES:
        src = ROOT / name
        if not src.exists():
            print(f"ATTENTION : {name} introuvable, ignore", file=sys.stderr)
            continue

        dst = DIST_APP / name
        copied = _copy_filtered(src, dst)
        total += copied
        print(f"  {name}: {copied} fichier(s)")

    print(f"\nOK - {total} fichiers copies dans dist/app/")
    sys.stdout.flush()


if __name__ == "__main__":
    main()

