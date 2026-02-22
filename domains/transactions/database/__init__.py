"""
Transaction Database Package
Consolidates all database-related logic for transactions domain.
"""

from .model import Transaction
from .repository import TransactionRepository, transaction_repository, CATÉGORIES, TYPES_TRANSACTION
from .schema import init_transaction_table, migrate_transaction_table, create_indexes, init_attachments_table
from .validation import (
    TRANSACTION_TYPES,
    TRANSACTION_CATEGORIES,
    TRANSACTION_SOURCES,
    validate_transaction,
    validate_amount,
    validate_required,
    normalize_text,
    safe_convert,
    safe_date_convert,
)

__all__ = [
    # Model
    'Transaction',
    # Constants
    'TRANSACTION_TYPES',
    'TRANSACTION_CATEGORIES',
    'TRANSACTION_SOURCES',
    # Validation
    'validate_transaction',
    'validate_amount',
    'validate_required',
    # Utilities
    'normalize_text',
    'safe_convert',
    'safe_date_convert',
    # Repository
    'TransactionRepository',
    'transaction_repository',
    # Schema
    'init_transaction_table',
    'init_attachments_table',
    'migrate_transaction_table',
    'create_indexes',
]
