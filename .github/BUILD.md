# Build & Distribution - Gestio V4

## Strategie par plateforme

| Plateforme     | Pipeline                                   | Resultat final          | Prerequis utilisateur                      |
|----------------|-------------------------------------------|-------------------------|--------------------------------------------|
| **Windows**    | Mini-launcher + uv + sources -> Inno Setup | `Gestio-Setup-v4.0.exe` | **Aucun** - assistant d'installation       |
| **macOS**      | `install-mac-linux.sh` -> uv tool install  | commande `gestio`        | **Aucun** - script auto-installant         |
| **Linux**      | `install-mac-linux.sh` -> uv tool install  | commande `gestio`        | **Aucun** - script auto-installant         |

---

## Architecture Windows (uv-native)

Plus de PyInstaller pour l'application complete.
Seul le mini-launcher Tkinter est compile (~5-10 Mo).

```
%APPDATA%\Gestio\
  GestioLauncher.exe      <- Mini-launcher (Tkinter only)
  uv\uv.exe               <- uv standalone (gere Python + venv)
  app\                     <- Sources Python du projet
    main.py
    pyproject.toml
    uv.lock
    config/  domains/  shared/  resources/
```

Au premier lancement, `uv run` telecharge Python 3.12 + dependances.

---

## Prerequis de build (une seule fois)

```bash
# Installer uv
curl -LsSf https://astral.sh/uv/install.sh | sh   # Mac/Linux
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"  # Windows

# Synchroniser
uv sync --frozen
```

---

## Build manuel (Windows)

```bash
# 1. Preparer les sources dans dist/app/
uv run python scripts/prepare_dist.py

# 2. Compiler le mini-launcher Tkinter
uv run pyinstaller gestio-launcher.spec --noconfirm

# 3. Generer gestio.iss
uv run python scripts/generate_iss.py

# 4. Builder l'installeur (necessite Inno Setup installe)
iscc gestio.iss
# Resultat : dist/installer/Gestio-Setup-v4.0.exe
```

---

## Release automatique - GitHub Actions

Le workflow `.github/workflows/build.yml` :
1. Copie les sources dans `dist/app/`
2. Compile le mini-launcher via PyInstaller
3. Telecharge uv standalone dans `dist/uv/`
4. Signe le launcher et l'installeur (Azure Code Signing)
5. Package le tout avec Inno Setup
6. Cree la release GitHub (sur tags `v*.*.*`)

---

## Mac / Linux

Pas de compilation. Le script `install-mac-linux.sh` :
1. Installe uv (standalone) si absent
2. Fait `uv tool install "git+REPO" --python 3.12`
3. Expose la commande `gestio` dans le PATH
