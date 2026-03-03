#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gestio V4 - Launcher (uv-native)

Launcher Tkinter leger qui lance Streamlit via `uv run` dans le dossier
d'installation (%APPDATA%\\Gestio\\app).
Plus de PyInstaller — uv gere Python + dependances nativement.
"""

import datetime
import os
import socket
import subprocess
import sys
import threading
import time
import tkinter as tk
import webbrowser
from pathlib import Path
from tkinter import scrolledtext

APP_NAME = "Gestio V4"
PORT = 8501


def _resolve_app_dir() -> Path:
    """
    Resout le dossier contenant les sources de l'application.

    Deux cas :
    - Dev (script) : Dossier du launcher.py (sources locales)
    - Installe     : %APPDATA%\\Gestio\\app  (copie par Inno Setup)
    """
    if getattr(sys, 'frozen', False):
        installed = Path(sys.executable).parent / "app"
        if installed.exists():
            return installed
    return Path(__file__).parent


def _resolve_uv_path() -> str:
    """
    Trouve l'executable uv.

    1. uv.exe embarque dans %APPDATA%\\Gestio\\uv\\
    2. uv dans le PATH systeme (mode dev)
    """
    if getattr(sys, 'frozen', False):
        bundled = Path(sys.executable).parent / "uv" / "uv.exe"
        if bundled.exists():
            return str(bundled)
    return "uv"


APP_DIR: Path = _resolve_app_dir()
MAIN_APP: Path = APP_DIR / "main.py"
UV_PATH: str = _resolve_uv_path()

# Palette
C_BG, C_BG2, C_FG = "#1E1E2E", "#313244", "#CDD6F4"
C_ACCENT, C_OK, C_ERR, C_WARN = "#89B4FA", "#A6E3A1", "#F38BA8", "#FAB387"


def is_port_in_use(port: int) -> bool:
    """Verifie si un port TCP est deja utilise."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex(("127.0.0.1", port)) == 0


def find_chrome() -> str | None:
    """Cherche Chrome sur le systeme Windows."""
    for p in [r"%PROGRAMFILES%", r"%PROGRAMFILES(X86)%", r"%LOCALAPPDATA%"]:
        chrome = Path(os.path.expandvars(p)) / "Google/Chrome/Application/chrome.exe"
        if chrome.exists():
            return str(chrome)
    return None


def _build_streamlit_env() -> dict[str, str]:
    """Variables d'environnement pour Streamlit (theme + config)."""
    env = os.environ.copy()
    env.update({
        "STREAMLIT_SERVER_HEADLESS": "true",
        "STREAMLIT_SERVER_PORT": str(PORT),
        "STREAMLIT_BROWSER_GATHER_USAGE_STATS": "false",
        "STREAMLIT_GLOBAL_DEVELOPMENT_MODE": "false",
        "STREAMLIT_THEME_BASE": "dark",
        "STREAMLIT_THEME_PRIMARY_COLOR": "#10B981",
        "STREAMLIT_THEME_BACKGROUND_COLOR": "#111827",
        "STREAMLIT_THEME_SECONDARY_BACKGROUND_COLOR": "#1E293B",
        "STREAMLIT_THEME_TEXT_COLOR": "#F8FAFC",
        "STREAMLIT_THEME_FONT": "sans serif",
    })
    return env


# noinspection PyTypeChecker,PyBroadException
class Launcher:
    """Fenetre Tkinter de lancement de Gestio."""

    # noinspection PyTypeChecker
    def __init__(self) -> None:
        self.process: subprocess.Popen | None = None
        self.is_running: bool = False
        self.show_logs: bool = False

        self.root = tk.Tk()
        self.root.title(f"{APP_NAME} - Launcher")
        self.root.geometry("600x450")
        self.root.configure(bg=C_BG)
        self.root.resizable(False, False)
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
        self._build_ui()
        # noinspection PyTypeChecker
        self.root.after(100, self.start_app)

    # noinspection PyTypeChecker
    def _build_ui(self) -> None:
        # Header
        hdr = tk.Frame(self.root, bg=C_BG)
        hdr.pack(fill=tk.X, padx=30, pady=(30, 20))
        tk.Label(hdr, text="Gestio", font=("Segoe UI", 32, "bold"),
                 bg=C_BG, fg=C_FG).pack()
        tk.Label(hdr, text="Gestionnaire Financier Personnel",
                 font=("Segoe UI", 11), bg=C_BG, fg=C_ACCENT).pack(pady=(5, 0))

        # Bouton principal
        self.btn_launch = tk.Button(
            self.root, text="Lancer l'Application", command=self.start_app,
            bg=C_OK, fg=C_BG, font=("Segoe UI", 16, "bold"),
            padx=40, pady=20, relief=tk.FLAT, cursor="hand2",
        )
        self.btn_launch.pack(pady=20)

        tk.Label(self.root, text="S'ouvre automatiquement en mode plein ecran",
                 font=("Segoe UI", 10), bg=C_BG, fg=C_FG).pack(pady=15)

        # Boutons secondaires
        row = tk.Frame(self.root, bg=C_BG)
        row.pack(pady=10)
        self.btn_logs = tk.Button(
            row, text="Afficher les logs", command=self.toggle_logs,
            bg=C_BG2, fg=C_FG, font=("Segoe UI", 10),
            padx=15, pady=8, relief=tk.FLAT,
        )
        self.btn_logs.pack(side=tk.LEFT, padx=5)
        self.btn_stop = tk.Button(
            row, text="Arreter", command=self.stop_app,
            bg=C_BG2, fg=C_FG, font=("Segoe UI", 10),
            padx=15, pady=8, relief=tk.FLAT, state=tk.DISABLED,
        )
        self.btn_stop.pack(side=tk.LEFT, padx=5)

        # Logs
        self.log_frame = tk.Frame(self.root, bg=C_BG)
        tk.Label(self.log_frame, text="Logs", font=("Segoe UI", 10, "bold"),
                 bg=C_BG, fg=C_ACCENT).pack(anchor="w", padx=20, pady=(10, 5))
        self.log_area = scrolledtext.ScrolledText(
            self.log_frame, height=10, bg=C_BG2, fg=C_FG,
            font=("Consolas", 9), relief=tk.FLAT, state=tk.DISABLED,
            borderwidth=0,
        )
        self.log_area.pack(fill=tk.BOTH, expand=True, padx=20, pady=(0, 10))
        self.log_area.tag_config("error", foreground=C_ERR)
        self.log_area.tag_config("warn", foreground=C_WARN)
        self.log_area.tag_config("ok", foreground=C_OK)

        # Status bar
        bar = tk.Frame(self.root, bg=C_BG2, height=35)
        bar.pack(side=tk.BOTTOM, fill=tk.X)
        self.status_label = tk.Label(
            bar, text="Pret", bg=C_BG2, fg=C_OK,
            font=("Segoe UI", 9), anchor="w",
        )
        self.status_label.pack(side=tk.LEFT, padx=15, pady=8)

    # noinspection PyTypeChecker
    def toggle_logs(self) -> None:
        self.show_logs = not self.show_logs
        if self.show_logs:
            self.log_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=(0, 10))
            self.btn_logs.config(text="Masquer les logs")
            self.root.geometry("600x650")
        else:
            self.log_frame.pack_forget()
            self.btn_logs.config(text="Afficher les logs")
            self.root.geometry("600x450")

    # noinspection PyTypeChecker
    def log(self, msg: str, tag: str = "") -> None:
        ts = datetime.datetime.now().strftime("%H:%M:%S")
        self.log_area.config(state=tk.NORMAL)
        self.log_area.insert(tk.END, f"[{ts}] {msg}\n", tag)
        self.log_area.see(tk.END)
        self.log_area.config(state=tk.DISABLED)

    def status(self, text: str, color: str = C_FG) -> None:
        self.status_label.config(text=text, fg=color)

    # noinspection PyTypeChecker
    def start_app(self) -> None:
        if self.is_running:
            return
        self.btn_launch.config(state=tk.DISABLED, text="Demarrage...")
        self.status("Demarrage...", C_WARN)
        if is_port_in_use(PORT):
            self._kill_port(PORT)
            time.sleep(1)
        threading.Thread(target=self._run, daemon=True).start()

    # noinspection PyTypeChecker
    def _run(self) -> None:
        try:
            self.root.after(0, self.log, "Lancement de Streamlit via uv...")

            env = _build_streamlit_env()
            cmd = [
                UV_PATH, "run", "streamlit", "run", str(MAIN_APP),
                "--server.port", str(PORT),
                "--server.headless", "true",
                "--browser.gatherUsageStats", "false",
            ]
            self.root.after(0, self.log, f"CMD: {' '.join(cmd)}")

            self.process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=str(APP_DIR),
                env=env,
                creationflags=subprocess.CREATE_NO_WINDOW,
            )
            threading.Thread(target=self._read_pipe, daemon=True).start()

            # Attendre que Streamlit soit pret
            for _ in range(60):
                if is_port_in_use(PORT):
                    self.is_running = True
                    self.root.after(0, self.log, "Streamlit pret !", "ok")
                    self.root.after(0, self._ui_running)
                    self.root.after(500, self._open_browser)
                    return
                if self.process.poll() is not None:
                    out, err = self.process.communicate()
                    msg = (err or out or b"").decode("utf-8", errors="replace")
                    self.root.after(
                        0, self.log,
                        f"Streamlit a plante :\n{msg}", "error",
                    )
                    self.root.after(0, self._ui_error)
                    return
                time.sleep(0.5)

            self.root.after(0, self.log, "Timeout (30s)", "error")
            self.root.after(0, self._ui_error)
        except Exception as e:
            self.root.after(0, self.log, f"Erreur : {e}", "error")
            self.root.after(0, self._ui_error)

    # noinspection PyTypeChecker
    def _read_pipe(self) -> None:
        if not self.process or not self.process.stdout:
            return
        for line in self.process.stdout:
            msg = line.decode("utf-8", errors="replace").rstrip()
            if msg:
                self.root.after(0, self.log, msg)

    def _open_browser(self) -> None:
        url = f"http://localhost:{PORT}"
        chrome = find_chrome()
        if chrome:
            subprocess.Popen([chrome, f"--app={url}", "--start-fullscreen"])
            self.log("Chrome lance en mode app", "ok")
        else:
            webbrowser.open(url)

    # noinspection PyBroadException
    @staticmethod
    def _kill_port(port: int) -> None:
        try:
            r = subprocess.run(
                ["netstat", "-ano"], capture_output=True, text=True,
            )
            for line in r.stdout.splitlines():
                if f":{port}" in line and "LISTENING" in line:
                    subprocess.run(
                        ["taskkill", "/F", "/PID", line.split()[-1]],
                        capture_output=True,
                    )
        except Exception:
            pass

    # noinspection PyTypeChecker
    def _ui_running(self) -> None:
        self.btn_launch.config(text="Lancee", bg=C_OK, state=tk.DISABLED)
        self.btn_stop.config(state=tk.NORMAL)
        self.status("En cours", C_OK)

    # noinspection PyTypeChecker
    def _ui_error(self) -> None:
        self.btn_launch.config(text="Relancer", bg=C_ERR, state=tk.NORMAL)
        self.status("Erreur", C_ERR)
        if not self.show_logs:
            self.toggle_logs()

    def stop_app(self) -> None:
        if self.process and hasattr(self.process, 'terminate'):
            self.process.terminate()
        self.root.destroy()

    def on_closing(self) -> None:
        self.stop_app()

    def run(self) -> None:
        self.root.mainloop()


def main() -> None:
    """Point d'entree principal."""
    if getattr(sys, 'frozen', False):
        import multiprocessing
        multiprocessing.freeze_support()
    Launcher().run()


if __name__ == "__main__":
    main()
