# AGENTS.md — Gestio V4 (Production)

> Application desktop Python + Streamlit + SQLite. Version de production stable.

---

## 🏗️ Architecture

```
V1/
├── main.py                    ← Point d'entrée Streamlit
├── pyproject.toml            ← Dépendances avec uv
│
├── launcher/                 ← Package launcher (mini-EXE Tkinter)
│   ├── launcher.py           ← Point d'entrée principal
│   ├── launcher_core.py      ← Logique métier (venv, uv sync, chemins)
│   ├── launcher_ui.py        ← Fenêtre Tkinter
│   └── gestio-launcher.spec ← Spec PyInstaller
│
├── config/                   ← Configuration globale
│   ├── paths.py             ← Chemins DB, ressources
│   └── logging_config.py    ← Logging structuré
│
├── domains/                  ← Domaines métier (DDD)
│   ├── home/                ← Page d'accueil / dashboard
│   └── transactions/
│       ├── database/        ← Modèles, repositories, schéma
│       ├── services/       ← Logique métier
│       ├── recurrence/      ← Transactions récurrentes
│       ├── ocr/            ← Extraction OCR
│       ├── pages/         ← Pages Streamlit
│       └── view/          ← Composants visuels
│
├── shared/                 ← Utilitaires transversaux
│   ├── database/          ← Connexion SQLite
│   ├── ui/               ← Helpers UI, styles
│   ├── services/         ← Sécurité
│   └── utils/            ← Convertisseurs, parsers
│
├── resources/             ← Assets (styles, icônes)
└── scripts/              ← Scripts de build
```

---

## ⚡ 1. Commandes de Build/Lint/Test

### Installation

```bash
# Installer les dépendances avec uv
uv sync

# Ajouter une dépendance
uv add <package>
```

### Lancement (Développement)

```bash
# Via Streamlit directement
uv run streamlit run main.py

# Ou via le launcher
uv run python launcher.py
```

### Tests

```bash
# Tous les tests
pytest

# Mode verbose
pytest -v

# Test spécifique
pytest tests/test_transactions/test_repository.py::test_add_transaction

# Avec coverage
pytest --cov=domains --cov=shared --cov-report=html

# Marqueurs
pytest -m unit         # Tests unitaires purs
pytest -m integration  # Tests avec DB
pytest -m ocr          # Tests OCR
```

### Build (Production)

```bash
# Installer les dépendances de build
uv sync --group build

# Générer l'exécutable Windows avec PyInstaller
uv run pyinstaller gestio.spec

# Générer le script Inno Setup
python scripts/generate_iss.py
```

---

## 📐 2. Conventions de Code

### Python

**Framework & Validation :**
- **Pydantic** — Modèles avec validation
- **Pandas** — Autorisé pour les DataFrames
- **Plotly** — Graphiques interactifs
- **RapidOCR** — OCR offline

**Conventions :**
- **Clés en FRANÇAIS** : `categorie`, `montant`, `date`, `type`
- **snake_case** pour les variables et fonctions
- **logging** : `logger = logging.getLogger(__name__)`
- **docstrings** Google style

**Imports (ordre) :**
```python
# 1. Bibliothèques standard
import logging
from datetime import date
from typing import Optional, List

# 2. Bibliothèques tierces
import pandas as pd
import streamlit as st
from pydantic import BaseModel

# 3. Imports locaux
from shared.database import get_db_connection
from domains.transactions.database.model import Transaction

# 4. Logger
logger = logging.getLogger(__name__)
```

**Gestion d'erreurs :**
```python
from shared.exceptions import DatabaseError, ValidationError

try:
    result = repository.add(data)
except ValidationError as e:
    st.error(f"Données invalides: {e}")
    logger.warning(f"Validation échouée: {e}")
except DatabaseError as e:
    st.error("Erreur base de données")
    logger.error(f"DB error: {e}", exc_info=True)
```

**Pydantic Models :**
```python
from pydantic import BaseModel, Field, validator

class Transaction(BaseModel):
    type: str = Field(..., description="Type (Dépense/Revenu)")
    categorie: str = Field("Non catégorisé")
    montant: float = Field(..., ge=0)
    date: date

    @validator("type", pre=True)
    def normalize_type(cls, v):
        if isinstance(v, str):
            return v.strip().capitalize()
        return v
```

---

### Streamlit Pages

**Structure d'une page :**
```python
import streamlit as st
from shared.ui import render_header, render_error

def page_transactions():
    st.set_page_config(title="Transactions", layout="wide")
    render_header("📊 Transactions")

    # État
    if "transactions" not in st.session_state:
        st.session_state.transactions = load_transactions()

    # Filtres
    col1, col2 = st.columns(2)
    with col1:
        start_date = st.date_input("Date début")
    with col2:
        end_date = st.date_input("Date fin")

    # Actions
    if st.button("Ajouter"):
        show_add_form()

    # Affichage
    render_transactions_table(st.session_state.transactions)
```

---

## 🧪 3. Tests

### Structure des tests

```
tests/
├── conftest.py              # Fixtures partagées
├── test_transactions/
│   ├── test_repository.py  # Tests CRUD
│   └── test_service.py     # Tests logique métier
├── test_ocr/
│   └── test_parser.py      # Tests OCR
└── test_shared/
    └── test_utils.py       # Tests utilitaires
```

### Exemple de test

```python
import pytest
from datetime import date

from domains.transactions.database.model import Transaction


@pytest.fixture
def transaction_sample():
    """Fixture pour une transaction de test."""
    return Transaction(
        type="Dépense",
        categorie="Alimentation",
        montant=42.50,
        date=date(2026, 1, 15),
        source="Manuel",
    )


def test_transaction_validation(transaction_sample):
    """La transaction doit être valide."""
    assert transaction_sample.montant == 42.50
    assert transaction_sample.type == "Dépense"


def test_montant_negatif_invalide():
    """Un montant négatif doit lever une erreur."""
    with pytest.raises(ValueError):
        Transaction(
            type="Dépense",
            montant=-10.0,
            date=date(2026, 1, 15),
            source="Manuel",
        )
```

---

## 🎨 4. Style Git

### Commits

```
feat: ajouter l'export CSV des transactions
fix: corriger le filtre par catégorie sur la page view
refactor: extraire la logique de parsing dans ocr_parser.py
chore: mettre à jour les dépendances (pandas, streamlit)
test: ajouter 5 tests pour le module recurrence
```

### Branches

| Préfixe | Usage |
|---------|-------|
| `main` | Production stable |
| `feat/` | Nouvelles fonctionnalités |
| `fix/` | Corrections de bugs |
| `chore/` | Maintenance, dépendances |

---

## 📁 5. Patterns Courants

### Repository Pattern

```python
# domains/transactions/database/repository.py
class TransactionRepository:
    def get_all(self) -> List[Transaction]:
        conn = get_db_connection()
        cursor = conn.execute("SELECT * FROM transactions ORDER BY date DESC")
        rows = cursor.fetchall()
        return [Transaction(**row) for row in rows]

    def add(self, transaction: Transaction) -> int:
        # Insert et retourne l'ID
        pass
```

### Service Layer

```python
# domains/transactions/services/transaction_service.py
class TransactionService:
    def __init__(self):
        self.repository = TransactionRepository()

    def get_all(self) -> List[Transaction]:
        """Point d'entrée unique pour les lectures."""
        return self.repository.get_all()

    def add(self, data: dict) -> Optional[int]:
        """Valide et ajoute une transaction."""
        try:
            transaction = Transaction.parse_obj(data)
            return self.repository.add(transaction)
        except ValidationError as e:
            logger.error(f"Validation échouée: {e}")
            return None
```

---

## ⚠️ 6. Règles Importantes

1. **Clés en français** — Pas de mapping FR↔EN dans les services
2. **Ne jamais accéder au repository depuis les pages Streamlit** — Passer par le service
3. **Valider avec Pydantic** — Toujours utiliser les modèles pour valider les entrées
4. **Logging structuré** — Utiliser `logger.info()`, `logger.error()` avec contexte
5. **Tests avant commit** — Lancer `pytest` avant de pusher
6. **Pas de secrets hardcodés** — Utiliser `os.getenv()` ou `.env`

---

## 🔄 7. Différences avec V1-feature

| Aspect | V1 (Production) | V1-feature (Dev) |
|--------|-----------------|------------------|
| Launcher | Package complet | Script simple |
| Branches | `main` stable | `feat/`, `fix/` pour dev |
| Build CI/CD | GitHub Actions automatisé | Manuel |

**Note** : Merger les features depuis `V1-feature` vers `V1` via PR après tests et review.
