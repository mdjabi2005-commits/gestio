"""
Migration : table transaction_attachments
- Supprime les colonnes file_path et size
- Corrige la FK vers transactions(id)
"""

import sys
from pathlib import Path

# Ajout du chemin racine pour les imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from shared.database.connection import get_db_connection, close_connection


def migrate():
    conn = get_db_connection()
    cur = conn.cursor()

    # 1. Etat actuel
    cur.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='transaction_attachments'")
    row = cur.fetchone()
    if row:
        print("Schema actuel :")
        print(row[0])
    else:
        print("Table introuvable.")
        conn.close()
        return

    # 2. Sauvegarder les donnees existantes
    cur.execute("SELECT id, transaction_id, file_name, file_type, upload_date FROM transaction_attachments")
    existing = cur.fetchall()
    print(f"\n{len(existing)} enregistrement(s) a migrer.")

    # 3. Supprimer l'ancienne table
    cur.execute("DROP TABLE transaction_attachments")
    print("Ancienne table supprimee.")

    # 4. Recreer sans file_path/size, FK correcte
    cur.execute("""
        CREATE TABLE transaction_attachments (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            transaction_id INTEGER NOT NULL,
            file_name      TEXT NOT NULL,
            file_type      TEXT,
            upload_date    TEXT NOT NULL,
            FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
        )
    """)
    print("Nouvelle table creee.")

    # 5. Reinjecter les donnees
    if existing:
        cur.executemany(
            "INSERT INTO transaction_attachments "
            "(id, transaction_id, file_name, file_type, upload_date) "
            "VALUES (?, ?, ?, ?, ?)",
            [tuple(r) for r in existing]
        )
        print(f"{len(existing)} enregistrement(s) migre(s).")

    conn.commit()
    close_connection(conn)

    # 6. Verification finale
    conn2 = get_db_connection()
    cur2 = conn2.cursor()
    cur2.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='transaction_attachments'")
    final = cur2.fetchone()
    print("\nSchema final :")
    print(final[0])
    conn2.close()
    print("\nMigration terminee avec succes.")


if __name__ == "__main__":
    migrate()

