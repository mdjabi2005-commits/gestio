"""
Home Core - Business Logic Layer

Dashboard analytics and metrics.
"""

from .analytics import (
    calculate_monthly_totals,
    calculate_kpis,
    get_recent_transactions
)

__all__ = [
    'calculate_monthly_totals',
    'calculate_kpis',
    'get_recent_transactions'
]
