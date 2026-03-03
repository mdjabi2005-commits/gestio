#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Shim de compatibilite — delegue a launcher/launcher.py."""
import sys
from pathlib import Path

# Ajouter launcher/ dans sys.path pour les imports absolus
_LAUNCHER_DIR = Path(__file__).parent / "launcher"
if str(_LAUNCHER_DIR) not in sys.path:
    sys.path.insert(0, str(_LAUNCHER_DIR))

from launcher_core import resolve_app_dir, resolve_uv_path  # noqa: E402
from launcher_ui import Launcher  # noqa: E402


def main() -> None:
    import multiprocessing
    if getattr(sys, 'frozen', False):
        multiprocessing.freeze_support()
    Launcher(resolve_app_dir(), resolve_uv_path()).run()


if __name__ == "__main__":
    main()

