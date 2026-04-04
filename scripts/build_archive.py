"""
Script de build de l'archive universelle Gestio (macOS / Linux).

Lit INSTALL_FILES et INSTALL_EXCLUDES depuis backend/config/paths.py
et produit Gestio-Universal.zip à la racine du projet.

Usage:
    uv run python scripts/build_archive.py [--output Gestio-Universal.zip]
"""

import argparse
import os
import shutil
import sys
import zipfile
from pathlib import Path

# Ajouter la racine du projet au path pour l'import
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from backend.config.paths import INSTALL_FILES, INSTALL_EXCLUDES  # noqa: E402


def _is_excluded(rel_path: str, excludes: list[str]) -> bool:
    """Vérifie si un chemin relatif est dans la liste d'exclusions."""
    p = Path(rel_path)
    for excl in excludes:
        excl_path = Path(excl)
        # Vérifie si le chemin commence par l'exclusion (ex: frontend/src/...)
        if p == excl_path or str(p).startswith(str(excl_path) + os.sep):
            return True
        # Vérifie les segments du chemin (ex: __pycache__ n'importe où)
        if excl_path.name in p.parts:
            return True
    return False


def build_archive(output_name: str = "Gestio-Universal.zip") -> Path:
    """Construit l'archive zip depuis les INSTALL_FILES définis dans paths.py."""
    output_path = PROJECT_ROOT / output_name
    print(f"[BUILD] Construction de l'archive : {output_path}")
    print(f"[BUILD] Racine du projet : {PROJECT_ROOT}")
    print(f"[BUILD] Fichiers inclus   : {INSTALL_FILES}")
    print(f"[BUILD] Exclusions        : {len(INSTALL_EXCLUDES)} regles\n")

    if output_path.exists():
        output_path.unlink()

    file_count = 0

    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for item in INSTALL_FILES:
            source = PROJECT_ROOT / item
            if not source.exists():
                print(f"  [ ] Introuvable (ignore) : {item}")
                continue

            if source.is_file():
                # Fichier direct (ex: launcher.py)
                rel = item
                if _is_excluded(rel, INSTALL_EXCLUDES):
                    continue
                zf.write(source, arcname=rel)
                file_count += 1
                print(f"  [+] {rel}")

            elif source.is_dir():
                # Dossier : ajouter récursivement
                for file_path in sorted(source.rglob("*")):
                    if not file_path.is_file():
                        continue
                    rel = str(file_path.relative_to(PROJECT_ROOT))
                    if _is_excluded(rel, INSTALL_EXCLUDES):
                        continue
                    zf.write(file_path, arcname=rel)
                    file_count += 1

                print(f"  [DIR] {item}/")

    size_mb = output_path.stat().st_size / (1024 * 1024)
    print(f"\n[OK] Archive creee : {output_path.name} ({size_mb:.1f} MB, {file_count} fichiers)")
    return output_path


def main():
    parser = argparse.ArgumentParser(description="Build Gestio Universal Archive")
    parser.add_argument(
        "--output",
        default="Gestio-Universal.zip",
        help="Nom du fichier zip de sortie (défaut: Gestio-Universal.zip)",
    )
    args = parser.parse_args()
    build_archive(output_name=args.output)


if __name__ == "__main__":
    main()
