#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gestio V4 - Launcher (point d'entree)

Point d'entree minimal : resout les chemins et delegue a launcher_ui.
- launcher_core.py : logique metier (venv, sync, streamlit)
- launcher_ui.py   : fenetre Tkinter
"""

import sys
import multiprocessing
from pathlib import Path

# Ajouter le dossier launcher/ dans sys.path pour que
# launcher_core et launcher_ui soient importables sans package parent
# (necesaire pour PyInstaller onefile et execution directe)
_LAUNCHER_DIR = Path(__file__).parent
if str(_LAUNCHER_DIR) not in sys.path:
    sys.path.insert(0, str(_LAUNCHER_DIR))

from launcher_core import resolve_app_dir, resolve_uv_path  # noqa: E402
from launcher_ui import Launcher  # noqa: E402


def main() -> None:
    """Point d'entree principal."""
    if getattr(sys, 'frozen', False):
        multiprocessing.freeze_support()

    app_dir = resolve_app_dir()
    uv_path = resolve_uv_path()
    Launcher(app_dir, uv_path).run()


if __name__ == "__main__":
    main()
