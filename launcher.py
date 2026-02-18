#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Gestio V4 - Launcher"""

import tkinter as tk
from tkinter import scrolledtext
import subprocess
import sys
import threading
import webbrowser
from pathlib import Path
import datetime
import time
import socket
import os

APP_NAME = "Gestio V4"
PORT = 8501

# Gestion des chemins selon le mode (dev vs compilé)
if getattr(sys, 'frozen', False):
    # Mode compilé
    if hasattr(sys, '_MEIPASS'):
        # Mode one-file : les fichiers sont dans le dossier temporaire _MEIPASS
        BASE_DIR = Path(sys._MEIPASS)
    else:
        # Mode onedir : les fichiers sont à côté de l'executable
        BASE_DIR = Path(sys.executable).parent
else:
    # Mode développement
    BASE_DIR = Path(__file__).parent

MAIN_APP = BASE_DIR / "main.py"

# Mode Streamlit : si lancé avec --run-streamlit, démarrer Streamlit directement
if "--run-streamlit" in sys.argv:
    import importlib.metadata as _meta
    _real_version = _meta.version
    def _patched_version(pkg):
        try:
            return _real_version(pkg)
        except _meta.PackageNotFoundError:
            return "0.0.0"
    _meta.version = _patched_version

    # Forcer le mode production pour éviter le conflit de port
    os.environ["STREAMLIT_SERVER_HEADLESS"] = "true"
    os.environ["STREAMLIT_SERVER_PORT"] = str(PORT)
    os.environ["STREAMLIT_BROWSER_GATHER_USAGE_STATS"] = "false"
    os.environ["STREAMLIT_GLOBAL_DEVELOPMENT_MODE"] = "false"

    from streamlit.web import cli as stcli
    sys.argv = ["streamlit", "run", str(MAIN_APP),
                "--server.headless", "true",
                "--browser.gatherUsageStats", "false"]
    stcli.main()
    sys.exit(0)

# Palette
C_BG, C_BG2, C_FG = "#1E1E2E", "#313244", "#CDD6F4"
C_ACCENT, C_OK, C_ERR, C_WARN = "#89B4FA", "#A6E3A1", "#F38BA8", "#FAB387"


def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex(("127.0.0.1", port)) == 0


def find_chrome():
    for p in [r"%PROGRAMFILES%", r"%PROGRAMFILES(X86)%", r"%LOCALAPPDATA%"]:
        chrome = Path(os.path.expandvars(p)) / "Google/Chrome/Application/chrome.exe"
        if chrome.exists():
            return str(chrome)
    return None




class Launcher:
    def __init__(self):
        self.process = None
        self.is_running = False
        self.show_logs = False

        self.root = tk.Tk()
        self.root.title(f"{APP_NAME} - Launcher")
        self.root.geometry("600x450")
        self.root.configure(bg=C_BG)
        self.root.resizable(False, False)
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
        self._build_ui()
        self.root.after(100, self.start_app)

    def _build_ui(self):
        # Header
        hdr = tk.Frame(self.root, bg=C_BG)
        hdr.pack(fill=tk.X, padx=30, pady=(30, 20))
        tk.Label(hdr, text="💰 Gestio", font=("Segoe UI", 32, "bold"), bg=C_BG, fg=C_FG).pack()
        tk.Label(hdr, text="Gestionnaire Financier Personnel", font=("Segoe UI", 11), bg=C_BG, fg=C_ACCENT).pack(pady=(5, 0))

        # Bouton principal
        self.btn_launch = tk.Button(
            self.root, text="🚀  Lancer l'Application", command=self.start_app,
            bg=C_OK, fg=C_BG, font=("Segoe UI", 16, "bold"),
            padx=40, pady=20, relief=tk.FLAT, cursor="hand2",
        )
        self.btn_launch.pack(pady=20)

        tk.Label(self.root, text="🌐 S'ouvre automatiquement en mode plein écran",
                 font=("Segoe UI", 10), bg=C_BG, fg=C_FG).pack(pady=15)

        # Boutons secondaires
        row = tk.Frame(self.root, bg=C_BG)
        row.pack(pady=10)
        self.btn_logs = tk.Button(row, text="📋 Afficher les logs", command=self.toggle_logs,
                                  bg=C_BG2, fg=C_FG, font=("Segoe UI", 10), padx=15, pady=8, relief=tk.FLAT)
        self.btn_logs.pack(side=tk.LEFT, padx=5)
        self.btn_stop = tk.Button(row, text="⏹ Arrêter", command=self.stop_app,
                                  bg=C_BG2, fg=C_FG, font=("Segoe UI", 10), padx=15, pady=8, relief=tk.FLAT, state=tk.DISABLED)
        self.btn_stop.pack(side=tk.LEFT, padx=5)

        # Logs
        self.log_frame = tk.Frame(self.root, bg=C_BG)
        tk.Label(self.log_frame, text="📝 Logs", font=("Segoe UI", 10, "bold"), bg=C_BG, fg=C_ACCENT).pack(anchor="w", padx=20, pady=(10, 5))
        self.log_area = scrolledtext.ScrolledText(self.log_frame, height=10, bg=C_BG2, fg=C_FG,
                                                   font=("Consolas", 9), relief=tk.FLAT, state=tk.DISABLED, borderwidth=0)
        self.log_area.pack(fill=tk.BOTH, expand=True, padx=20, pady=(0, 10))
        self.log_area.tag_config("error", foreground=C_ERR)
        self.log_area.tag_config("warn", foreground=C_WARN)
        self.log_area.tag_config("ok", foreground=C_OK)

        # Status bar
        bar = tk.Frame(self.root, bg=C_BG2, height=35)
        bar.pack(side=tk.BOTTOM, fill=tk.X)
        self.status_label = tk.Label(bar, text="● Prêt", bg=C_BG2, fg=C_OK, font=("Segoe UI", 9), anchor="w")
        self.status_label.pack(side=tk.LEFT, padx=15, pady=8)

    def toggle_logs(self):
        self.show_logs = not self.show_logs
        if self.show_logs:
            self.log_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=(0, 10))
            self.btn_logs.config(text="📋 Masquer les logs")
            self.root.geometry("600x650")
        else:
            self.log_frame.pack_forget()
            self.btn_logs.config(text="📋 Afficher les logs")
            self.root.geometry("600x450")

    def log(self, msg: str, tag: str = ""):
        ts = datetime.datetime.now().strftime("%H:%M:%S")
        self.log_area.config(state=tk.NORMAL)
        self.log_area.insert(tk.END, f"[{ts}] {msg}\n", tag)
        self.log_area.see(tk.END)
        self.log_area.config(state=tk.DISABLED)

    def status(self, text: str, color: str = C_FG):
        self.status_label.config(text=f"● {text}", fg=color)

    def start_app(self):
        if self.is_running:
            return
        self.btn_launch.config(state=tk.DISABLED, text="⏳ Démarrage...")
        self.status("Démarrage...", C_WARN)
        if is_port_in_use(PORT):
            self._kill_port(PORT)
            time.sleep(1)
        threading.Thread(target=self._run, daemon=True).start()

    def _run(self):
        try:
            self.log("Lancement de Streamlit...")

            # Mode dev : subprocess classique
            if not getattr(sys, 'frozen', False):
                self.process = subprocess.Popen(
                    [sys.executable, "-m", "streamlit", "run", str(MAIN_APP),
                     "--server.port", str(PORT), "--server.headless", "true"],
                    stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=str(BASE_DIR)
                )
                threading.Thread(target=self._read_pipe, daemon=True).start()
            # Mode compilé : relancer le même exe avec --run-streamlit
            else:
                self.process = subprocess.Popen(
                    [sys.executable, "--run-streamlit"],
                    stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=str(BASE_DIR)
                )
                threading.Thread(target=self._read_pipe, daemon=True).start()

            # Attendre que Streamlit soit prêt
            for _ in range(60):
                if is_port_in_use(PORT):
                    self.is_running = True
                    self.root.after(0, self.log, "✅ Streamlit prêt !", "ok")
                    self.root.after(0, self._ui_running)
                    self.root.after(500, self._open_browser)
                    return
                # Vérifier si le process est mort
                if self.process.poll() is not None:
                    out, err = self.process.communicate()
                    msg = (err or out or b"").decode("utf-8", errors="replace")
                    self.root.after(0, self.log, f"❌ Streamlit a planté :\n{msg}", "error")
                    self.root.after(0, self._ui_error)
                    return
                time.sleep(0.5)

            self.root.after(0, self.log, "❌ Timeout (30s)", "error")
            self.root.after(0, self._ui_error)
        except Exception as e:
            self.root.after(0, self.log, f"❌ {e}", "error")
            self.root.after(0, self._ui_error)

    def _read_pipe(self):
        for line in self.process.stdout:
            msg = line.decode("utf-8", errors="replace").rstrip()
            if msg:
                self.root.after(0, self.log, msg)

    def _open_browser(self):
        url = f"http://localhost:{PORT}"
        chrome = find_chrome()
        if chrome:
            subprocess.Popen([chrome, f"--app={url}", "--start-fullscreen"])
            self.log("Chrome lancé", "ok")
        else:
            webbrowser.open(url)

    def _kill_port(self, port: int):
        try:
            r = subprocess.run(["netstat", "-ano"], capture_output=True, text=True)
            for line in r.stdout.splitlines():
                if f":{port}" in line and "LISTENING" in line:
                    subprocess.run(["taskkill", "/F", "/PID", line.split()[-1]], capture_output=True)
        except:
            pass

    def _ui_running(self):
        self.btn_launch.config(text="✅ Lancée", bg=C_OK, state=tk.DISABLED)
        self.btn_stop.config(state=tk.NORMAL)
        self.status("En cours", C_OK)

    def _ui_error(self):
        self.btn_launch.config(text="🚀 Relancer", bg=C_ERR, state=tk.NORMAL)
        self.status("Erreur", C_ERR)
        if not self.show_logs:
            self.toggle_logs()

    def stop_app(self):
        if self.process and hasattr(self.process, 'terminate'):
            self.process.terminate()
        self.root.destroy()

    def on_closing(self):
        self.stop_app()

    def run(self):
        self.root.mainloop()


if __name__ == "__main__":
    if getattr(sys, 'frozen', False):
        import multiprocessing
        multiprocessing.freeze_support()
    Launcher().run()
