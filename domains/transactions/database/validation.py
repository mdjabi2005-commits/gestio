"""
Transaction Database Validation & Utilities
Consolidates: validation, constants, converters, formatters, normalizer
"""

import logging
import re
from datetime import datetime, date
from typing import Dict, List, Any, Optional, Type, Union

import pandas as pd
from dateutil import parser

logger = logging.getLogger(__name__)

# ==============================
# TRANSACTION SCHEMA CONSTANTS
# ==============================

TRANSACTION_TYPES = ["Dépense", "Revenu", "Transfert+", "Transfert-"]

TRANSACTION_CATEGORIES = [
    "Alimentation",
    "Voiture",
    "Logement",
    "Loisirs",
    "Santé",
    "Shopping",
    "Services",
    "Autre"
]

TRANSACTION_SOURCES = ["ocr", "csv", "pdf", "manual", "ofx", "enable_banking"]


# ==============================
# TEXT NORMALIZATION
# ==============================

def normalize_text(text: Any) -> str:
    """
    Normalize text format (Title Case, stripped).
    
    Examples:
        >>> normalize_text("  alimentation  ")
        'Alimentation'
    """
    if not text or not str(text).strip():
        return ""
    clean_text = " ".join(str(text).split())
    return clean_text.title()


# ==============================
# TYPE CONVERTERS
# ==============================

def safe_convert(
        value: Any,
        convert_type: Type = float,
        default: Union[float, int, str] = 0.0
) -> Union[float, int, str]:
    """
    Safely convert a value with automatic format detection.
    
    For float: detects European (1.234,56) vs American (1,234.56) format.
    """
    try:
        if pd.isna(value) or value is None or str(value).strip() == "":
            return default

        value_str = str(value).strip()

        if convert_type == float:
            # Clean: remove spaces, currency symbols, quotes
            value_str = value_str.replace(' ', '').replace('€', '').replace('"', '').replace("'", "")

            # Auto-detect format: last symbol (. or ,) is decimal separator
            last_comma = value_str.rfind(',')
            last_dot = value_str.rfind('.')

            if last_comma > last_dot:
                # European: 1.234,56
                value_str = value_str.replace('.', '')
                value_str = value_str.replace(',', '.')
            elif last_dot > last_comma:
                # American: 1,234.56
                value_str = value_str.replace(',', '')
            else:
                # Single symbol: assume European if comma
                if ',' in value_str:
                    value_str = value_str.replace(',', '.')

            # Clean everything except digits, dot, minus
            value_str = re.sub(r'[^\d.-]', '', value_str)
            result = float(value_str)
            return round(result, 2)

        elif convert_type == int:
            return int(float(value_str))
        elif convert_type == str:
            return value_str
        else:
            return convert_type(value)

    except (ValueError, TypeError, AttributeError) as e:
        logger.warning(f"Conversion failed for value '{value}': {e}")
        return default


def safe_date_convert(
        date_str: Any,
        default: Optional[datetime] = None
) -> datetime | date:
    """
    Safely convert date string with multiple format support.
    
    Supports: ISO (2025-01-15), European (15/01/2025), American (2025/01/15)
    """
    if default is None:
        default = datetime.now().date()

    if pd.isna(date_str) or date_str is None or str(date_str).strip() == "":
        return default

    date_str = str(date_str).strip()

    # Try common formats
    formats = [
        "%Y-%m-%d", "%d/%m/%Y", "%d/%m/%y",
        "%Y/%m/%d", "%d-%m-%Y", "%d-%m-%y",
        "%d.%m.%Y", "%d.%m.%y"
    ]

    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue

    # Fallback to fuzzy parsing
    try:
        return parser.parse(date_str, dayfirst=True, fuzzy=True).date()
    except Exception as e:
        logger.warning(f"Date conversion failed for '{date_str}': {e}, using default")
        return default


# ==============================
# VALIDATION FUNCTIONS
# ==============================

def validate_amount(amount: float) -> List[str]:
    """Validate that amount is positive."""
    if amount <= 0:
        return ["Le montant doit être supérieur à 0"]
    return []


def validate_required(value: Any, field_name: str) -> List[str]:
    """Validate that a field is not empty."""
    if not value or (isinstance(value, str) and not value.strip()):
        return [f"{field_name} est requis"]
    return []


# noinspection PyBroadException
def validate_transaction(data: Dict[str, Any]) -> tuple[bool, List[str]]:
    """
    Validate transaction data against SQLite schema.
    
    Required: type, amount, category
    Optional: date (cannot be future)
    
    Returns: (is_valid, errors)
    """
    errors = []

    # Type validation
    transaction_type = data.get('type', '')
    if transaction_type not in TRANSACTION_TYPES:
        errors.append(f"Type doit être parmi: {', '.join(TRANSACTION_TYPES)}")

    # Amount validation
    try:
        amount = float(data.get('amount', 0))
        errors.extend(validate_amount(amount))
    except (ValueError, TypeError):
        errors.append("Montant invalide")

    # Category validation
    errors.extend(validate_required(data.get('category'), "Catégorie"))

    # Date validation (optional but cannot be future)
    if data.get('date'):
        # noinspection PyBroadException
        try:
            date_val = data.get('date')
            if isinstance(date_val, str):
                date_val = datetime.fromisoformat(date_val).date()
            if date_val > datetime.now().date():
                errors.append("Date ne peut pas être dans le futur")
        except Exception:
            errors.append("Format de date invalide")

    # Source validation (optional)
    if data.get('source') and data.get('source') not in TRANSACTION_SOURCES:
        errors.append(f"Source doit être parmi: {', '.join(TRANSACTION_SOURCES)}")

    return len(errors) == 0, errors
