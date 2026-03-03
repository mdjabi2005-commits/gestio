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

from .launcher_core import resolve_app_dir, resolve_uv_path
from .launcher_ui import Launcher


def main() -> None:
    """Point d'entree principal."""
    if getattr(sys, 'frozen', False):
        multiprocessing.freeze_support()

    app_dir = resolve_app_dir()
    uv_path = resolve_uv_path()
    Launcher(app_dir, uv_path).run()


if __name__ == "__main__":
    main()

