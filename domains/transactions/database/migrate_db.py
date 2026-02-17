import sys
import os
from pathlib import Path

# Add project root to path
current_dir = Path(__file__).resolve().parent
project_root = current_dir.parent.parent.parent.parent
sys.path.append(str(project_root))

from v4.domains.transactions.database.schema import migrate_transaction_table, init_transaction_table
import logging

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    print("Starting migration...")
    try:
        migrate_transaction_table()
        init_transaction_table() # Ensure everything is clean
        print("Migration successful.")
    except Exception as e:
        print(f"Migration failed: {e}")
