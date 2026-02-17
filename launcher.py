#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gestio V4 - Launcher
"""

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
STREAMLIT_PORT = 8501
BASE_DIR = Path(__file__).parent
MAIN_APP = BASE_DIR / "v4" / "main.py"

# Palette (Catppuccin Mocha)
C_BG = "#1E1E2E"
C_BG2 = "#313244"
C_FG = "#CDD6F4"
C_ACCENT = "#89B4FA"
C_OK = "#A6E3A1"
C_ERR = "#F38BA8"
C_WARN = "#FAB387"


def is_port_in_use(port: int) -> bool:
    """Teste si un serveur écoute sur le port (connexion TCP)."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex(("127.0.0.1", port)) == 0


def find_chrome() -> str | None:
    """Retourne le chemin de Chrome s'il existe."""
    candidates = [
        os.path.expandvars(r"%PROGRAMFILES%\Google\Chrome\Application\chrome.exe"),
        os.path.expandvars(r"%PROGRAMFILES(X86)%\Google\Chrome\Application\chrome.exe"),
        os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
    ]
    for p in candidates:
        if Path(p).exists():
            return p
    return None


class Launcher:
    def __init__(self):
        self.process: subprocess.Popen | None = None
        self.is_running = False
        self.show_logs = False

        self.root = tk.Tk()
        self.root.title(f"{APP_NAME} - Launcher")
        self.root.geometry("600x450")
        self.root.configure(bg=C_BG)
        self.root.resizable(False, False)
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
        self._build_ui()

        # Auto-start Streamlit dès que la fenêtre est affichée
        self.root.after(100, self.start_app)

    # ── UI ──────────────────────────────────────────────

    def _build_ui(self):
        # Header
        hdr = tk.Frame(self.root, bg=C_BG)
        hdr.pack(fill=tk.X, padx=30, pady=(30, 20))

        tk.Label(hdr, text="💰 Gestio", font=("Segoe UI", 32, "bold"),
                 bg=C_BG, fg=C_FG).pack()
        tk.Label(hdr, text="Gestionnaire Financier Personnel",
                 font=("Segoe UI", 11), bg=C_BG, fg=C_ACCENT).pack(pady=(5, 0))

        # Bouton principal
        btn_box = tk.Frame(self.root, bg=C_BG)
        btn_box.pack(pady=20)

        self.btn_launch = tk.Button(
            btn_box, text="🚀  Lancer l'Application",
            command=self.start_app,
            bg=C_OK, fg=C_BG,
            font=("Segoe UI", 16, "bold"),
            padx=40, pady=20, relief=tk.FLAT, cursor="hand2",
            activebackground="#94E2A5", activeforeground=C_BG,
        )
        self.btn_launch.pack()
        self.btn_launch.bind("<Enter>", lambda e: self.btn_launch.config(bg="#94E2A5"))
        self.btn_launch.bind("<Leave>", lambda e: self.btn_launch.config(
            bg=C_OK if not self.is_running else C_OK))

        # Info
        tk.Label(self.root, text="🌐 S'ouvre automatiquement en mode plein écran",
                 font=("Segoe UI", 10), bg=C_BG, fg=C_FG).pack(pady=15)

        # Boutons secondaires
        row = tk.Frame(self.root, bg=C_BG)
        row.pack(pady=10)

        self.btn_logs = self._secondary_btn(row, "📋 Afficher les logs", self.toggle_logs)
        self.btn_logs.pack(side=tk.LEFT, padx=5)

        self.btn_stop = self._secondary_btn(row, "⏹ Arrêter", self.stop_app)
        self.btn_stop.pack(side=tk.LEFT, padx=5)
        self.btn_stop.config(state=tk.DISABLED)

        # Logs (caché par défaut)
        self.log_frame = tk.Frame(self.root, bg=C_BG)

        tk.Label(self.log_frame, text="📝 Logs", font=("Segoe UI", 10, "bold"),
                 bg=C_BG, fg=C_ACCENT).pack(anchor="w", padx=20, pady=(10, 5))

        self.log_area = scrolledtext.ScrolledText(
            self.log_frame, height=10, bg=C_BG2, fg=C_FG,
            font=("Consolas", 9), relief=tk.FLAT, state=tk.DISABLED, borderwidth=0,
        )
        self.log_area.pack(fill=tk.BOTH, expand=True, padx=20, pady=(0, 10))

        # Configure couleurs des tags
        self.log_area.tag_config("error", foreground=C_ERR)
        self.log_area.tag_config("warn", foreground=C_WARN)
        self.log_area.tag_config("ok", foreground=C_OK)

        # Status bar
        bar = tk.Frame(self.root, bg=C_BG2, height=35)
        bar.pack(side=tk.BOTTOM, fill=tk.X)

        self.status_label = tk.Label(
            bar, text="● Prêt", bg=C_BG2, fg=C_OK,
            font=("Segoe UI", 9), anchor="w",
        )
        self.status_label.pack(side=tk.LEFT, padx=15, pady=8)

    def _secondary_btn(self, parent, text, cmd):
        return tk.Button(
            parent, text=text, command=cmd,
            bg=C_BG2, fg=C_FG, font=("Segoe UI", 10),
            padx=15, pady=8, relief=tk.FLAT, cursor="hand2",
        )

    # ── Logs ────────────────────────────────────────────

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

    # ── Pipe reader (lit stdout/stderr et affiche dans les logs) ──

    def _read_pipe(self, pipe, tag: str = ""):
        """Lit un pipe ligne par ligne et l'affiche dans les logs tkinter."""
        try:
            for raw_line in pipe:
                line = raw_line.decode("utf-8", errors="replace").rstrip()
                if line:
                    self.root.after(0, self.log, line, tag)
        except Exception:
            pass

    # ── App lifecycle ───────────────────────────────────

    def start_app(self):
        if self.is_running:
            self.log("Application déjà en cours.", "warn")
            return

        self.btn_launch.config(state=tk.DISABLED, text="⏳ Démarrage...")
        self.status("Démarrage de Streamlit...", C_WARN)

        # Libérer le port si occupé
        if is_port_in_use(STREAMLIT_PORT):
            self.log(f"Port {STREAMLIT_PORT} occupé, tentative de libération...", "warn")
            self._kill_port(STREAMLIT_PORT)
            time.sleep(1)

        threading.Thread(target=self._run_streamlit, daemon=True).start()

    def _run_streamlit(self):
        try:
            self.log("Lancement de Streamlit...")
            self.process = subprocess.Popen(
                [
                    sys.executable, "-m", "streamlit", "run", str(MAIN_APP),
                    "--server.port", str(STREAMLIT_PORT),
                    "--server.headless", "true",
                    "--browser.gatherUsageStats", "false",
                ],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=str(BASE_DIR),
            )

            # Lancer 2 threads de lecture des pipes
            threading.Thread(target=self._read_pipe, args=(self.process.stdout,), daemon=True).start()
            threading.Thread(target=self._read_pipe, args=(self.process.stderr, "warn"), daemon=True).start()

            # Attendre que le port soit ouvert (= Streamlit prêt)
            for _ in range(30):
                if is_port_in_use(STREAMLIT_PORT):
                    self.is_running = True
                    self.root.after(0, self.log, "✅ Streamlit prêt !", "ok")
                    self.root.after(0, self._ui_running)
                    self.root.after(500, self._open_browser)
                    return
                time.sleep(0.5)

            # Timeout
            self.root.after(0, self.log, "❌ Timeout : Streamlit n'a pas démarré.", "error")
            self.root.after(0, self._ui_error)

        except Exception as e:
            self.root.after(0, self.log, f"❌ Erreur : {e}", "error")
            self.root.after(0, self._ui_error)

    def stop_app(self):
        if self.process:
            self.log("Arrêt de l'application...")
            self.process.terminate()
            try:
                self.process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.process.kill()
            self.process = None
        self.is_running = False
        self.root.destroy()

    def _open_browser(self):
        url = f"http://localhost:{STREAMLIT_PORT}"
        self.log(f"Ouverture du navigateur : {url}")

        chrome = find_chrome()
        if chrome:
            subprocess.Popen([
                chrome,
                f"--app={url}",
                "--start-fullscreen",
                "--disable-infobars",
                "--no-first-run",
                "--no-default-browser-check",
            ])
            self.log("Chrome lancé en mode app plein écran.", "ok")
        else:
            self.log("Chrome non trouvé, ouverture du navigateur par défaut.", "warn")
            webbrowser.open(url)

    # ── Port management ─────────────────────────────────

    def _kill_port(self, port: int):
        try:
            r = subprocess.run(["netstat", "-ano"], capture_output=True, text=True)
            for line in r.stdout.splitlines():
                if f":{port}" in line and "LISTENING" in line:
                    parts = line.split()
                    pid = parts[-1]
                    subprocess.run(["taskkill", "/F", "/PID", pid],
                                   capture_output=True)
                    self.log(f"PID {pid} arrêté.", "warn")
        except Exception as e:
            self.log(f"Erreur kill port : {e}", "error")

    # ── UI state helpers ────────────────────────────────

    def _ui_running(self):
        self.btn_launch.config(text="✅ Application Lancée", bg=C_OK, state=tk.DISABLED)
        self.btn_stop.config(state=tk.NORMAL)
        self.status("Application en cours d'exécution", C_OK)

    def _ui_error(self):
        self.btn_launch.config(text="🚀  Relancer l'Application", bg=C_ERR, state=tk.NORMAL)
        self.status("Erreur — voir les logs", C_ERR)
        if not self.show_logs:
            self.toggle_logs()

    def _ui_stopped(self):
        self.btn_launch.config(text="🚀  Relancer l'Application", bg=C_OK, state=tk.NORMAL)
        self.btn_stop.config(state=tk.DISABLED)
        self.status("Prêt", C_OK)

    # ── Cleanup ─────────────────────────────────────────

    def on_closing(self):
        if self.process:
            self.process.terminate()
        self.root.destroy()

    def run(self):
        self.root.mainloop()


if __name__ == "__main__":
    Launcher().run()
