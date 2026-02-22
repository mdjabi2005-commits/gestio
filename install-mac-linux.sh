#!/bin/bash
# 💰 Gestio — Installeur Mac/Linux
# Zéro prérequis : uv gère Python + toutes les dépendances via uv.lock

set -e

# ── Configuration ──────────────────────────────────────────────────────────────
GESTIO_DIR="$HOME/.gestio"
GITHUB_REPO="djabi/gestio"                    # ← À mettre à jour avec ton repo
VERSION="${1:-latest}"                         # Passer une version : ./install.sh v1.0.0
PORT=8501
# ──────────────────────────────────────────────────────────────────────────────

echo ""
echo "💰 Gestio — Installeur"
echo "──────────────────────"

# 1. Installer uv (binaire standalone, pas besoin de Python)
if ! command -v uv &> /dev/null; then
    echo "📦 Installation de uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    # Recharger le PATH
    export PATH="$HOME/.cargo/bin:$HOME/.local/bin:$PATH"
    source "$HOME/.bashrc" 2>/dev/null || source "$HOME/.zshrc" 2>/dev/null || true
fi
echo "✅ uv $(uv --version)"

# 2. Télécharger Gestio depuis GitHub Releases
if [ ! -d "$GESTIO_DIR" ]; then
    echo "📥 Téléchargement de Gestio ($VERSION)..."

    if [ "$VERSION" = "latest" ]; then
        DOWNLOAD_URL="https://github.com/${GITHUB_REPO}/archive/refs/heads/main.zip"
    else
        DOWNLOAD_URL="https://github.com/${GITHUB_REPO}/archive/refs/tags/${VERSION}.zip"
    fi

    curl -L "$DOWNLOAD_URL" -o /tmp/gestio.zip
    unzip -q /tmp/gestio.zip -d /tmp/gestio_extract
    mkdir -p "$GESTIO_DIR"
    mv /tmp/gestio_extract/$(ls /tmp/gestio_extract | head -1)/* "$GESTIO_DIR/"
    rm -rf /tmp/gestio.zip /tmp/gestio_extract
    echo "✅ Gestio installé dans $GESTIO_DIR"
else
    echo "📁 Gestio déjà installé dans $GESTIO_DIR"
    echo "   (supprimez $GESTIO_DIR pour réinstaller)"
fi

# 3. Installer Python 3.12 + toutes les dépendances via uv.lock
#    uv sync garantit un environnement reproductible identique à celui du développeur
echo "📦 Installation de l'environnement (Python 3.12 + dépendances)..."
cd "$GESTIO_DIR"
uv sync --frozen --no-dev   # --frozen = respecte uv.lock à la lettre, --no-dev = pas les outils de dev

# 4. Ouvrir le navigateur automatiquement
echo ""
echo "🚀 Lancement de Gestio sur http://localhost:$PORT"
echo "   Appuyez sur Ctrl+C pour arrêter"
echo ""

# Ouvrir le navigateur après 2s (le temps que Streamlit démarre)
(sleep 2 && (open "http://localhost:$PORT" 2>/dev/null || xdg-open "http://localhost:$PORT" 2>/dev/null)) &

# 5. Lancer l'application
uv run streamlit run main.py \
    --server.address=localhost \
    --server.port=$PORT \
    --server.headless=true \
    --browser.gatherUsageStats=false
