# 🗄️ Shared Database

Ce module gère **l'unique point d'entrée** vers le fichier SQLite.

## 🔌 Gestion de Connexion (`connection.py`)

Gérer des accès concurrents à SQLite (ex: Streamlit qui rafraîchit + un script d'import) est délicat. Ce module encapsule les bonnes pratiques.

### Configuration "Robustesse"
La fonction `get_db_connection()` applique automatiquement ces réglages critiques :

1.  **WAL Mode (`PRAGMA journal_mode = WAL`)** :
    -   Permet la lecture et l'écriture simultanées (indispensable pour les apps web).
    -   Évite les erreurs `Database is locked`.
2.  **Foreign Keys (`PRAGMA foreign_keys = ON`)** :
    -   Active l'intégrité référentielle (SQLite ne le fait pas par défaut !).
    -   Si vous supprimez une Catégorie utilisée par une Transaction, SQLite bloquera (ou propagera) selon votre schéma.
3.  **Busy Timeout (`30000ms`)** :
    -   Si la base est verrouillée, on attend 30 secondes avant de planter.

### Utilisation Type

```python
from shared.database.connection import get_db_connection

def ma_fonction():
    conn = get_db_connection()
    try:
        # Faire des choses...
        pass
    finally:
        # Toujours fermer ! (Ou utiliser un Context Manager si dispo)
        conn.close()
```
