import sys
import os

# Add project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))

from domains.transactions.database.schema import init_transaction_table, init_attachments_table

def apply_schema_updates():
    print("Applying database schema updates for Transactions...")
    try:
        init_transaction_table()
        init_attachments_table()
        print("Schema updates applied successfully.")
    except Exception as e:
        print(f"Error applying schema updates: {e}")

if __name__ == "__main__":
    apply_schema_updates()
