import toml
from pathlib import Path

config = {
    "theme": {
        "primaryColor": "#10B981",
        "backgroundColor": "#111827",
        "secondaryBackgroundColor": "#1E293B",
        "textColor": "#F8FAFC",
        "font": "sans serif",
    },
    "browser": {
        "gatherUsageStats": False,
    },
}

path = Path(__file__).parent / ".streamlit" / "config.toml"
path.parent.mkdir(exist_ok=True)

with open(path, "w", encoding="utf-8") as f:
    toml.dump(config, f)

# Vérification
with open(path, encoding="utf-8") as f:
    content = f.read()
    print(content)
    toml.loads(content)
    print("✅ config.toml valide")

