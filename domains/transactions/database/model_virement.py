"""
Modèle dédié aux virements internes (inter-comptes).
"""

from typing import Optional
from pydantic import BaseModel
from datetime import date as DateType

class Virement(BaseModel):
    """
    Modèle dédié aux virements internes (inter-comptes).
    """
    id: Optional[int] = None
    date: DateType
    description: Optional[str] = None
    amount: float
    iban_source: Optional[str] = None
    iban_destination: Optional[str] = None
    external_id_source: Optional[str] = None
    external_id_destination: Optional[str] = None
    type: Optional[str] = "Transfert"
    source: Optional[str] = "manual"

    class Config:
        json_schema_extra = {
            "example": {
                "date": "2024-02-04",
                "description": "Virement vers Livret A",
                "amount": 1000.0,
                "iban_source": "FR76...",
                "iban_destination": "FR76..."
            }
        }
