"""
Transaction Database Package
Consolidates all database-related logic for transactions domain.
"""

from .model import Transaction
from .model_virement import Virement
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
from .repository import TransactionRepository, transaction_repository, CATÉGORIES, TYPES_TRANSACTION
from .repository_virement import VirementRepository, virement_repository
from .schema import init_transaction_table, migrate_transaction_table, create_indexes, init_virement_table

__all__ = [
    # Model
    'Transaction',
    'Virement',
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
    'VirementRepository',
    'virement_repository',
    # Schema
    'init_transaction_table',
    'init_virement_table',
    'migrate_transaction_table',
    'create_indexes',
]
