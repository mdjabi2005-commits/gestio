"""
Domaine Transactions - Modèle

Tous les types de transactions (OCR, CSV, Manuelles)
convergent vers ce modèle unique (clés en français).
"""

from datetime import date as DateType
from typing import Optional

from pydantic import BaseModel, Field

# Constantes
TYPE_DEPENSE = "Dépense"
TYPE_REVENU = "Revenu"
TRANSACTION_TYPES = [TYPE_DEPENSE, TYPE_REVENU]

DEFAULT_TYPE = TYPE_DEPENSE
DEFAULT_SOURCE = "manual"


class Transaction(BaseModel):
    """
    Modèle unique pour toutes les transactions.
    """

    # Champs obligatoires
    type: str = Field(..., description="Type (Dépense/Revenu)")
    date: DateType = Field(..., description="Date de la transaction")

    # Champs avec valeurs par défaut (pour compatibilité OCR)
    categorie: str = Field("Non catégorisé", description="Catégorie principale")
    montant: float = Field(0.0, description="Montant en euros", ge=0)

    # Champs optionnels
    sous_categorie: Optional[str] = Field(None, description="Sous-catégorie")
    description: Optional[str] = Field(None, description="Description libre")
    source: Optional[str] = Field(DEFAULT_SOURCE, description="Source")
    recurrence: Optional[str] = Field(None, description="Fréquence récurrence")
    date_fin: Optional[DateType] = Field(None, description="Date de fin")
    compte_iban: Optional[str] = Field(None, description="IBAN du compte")
    external_id: Optional[str] = Field(None, description="ID externe")
    id: Optional[int] = Field(None, description="ID (DB)")

    @classmethod
    def normalize_type(cls, v):
        if isinstance(v, str):
            v_lower = v.lower()
            if v_lower in ('revenu', 'income'):
                return TYPE_REVENU
            if v_lower in ('dépense', 'expense', 'depense'):
                return TYPE_DEPENSE
        return v

    @classmethod
    def normalize_source(cls, v):
        if not v or str(v).strip() == "":
            return DEFAULT_SOURCE
        return v.strip().lower()

    @classmethod
    def empty_to_none(cls, v):
        if v == "" or v is None:
            return None
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "type": "Dépense",
                "categorie": "Alimentation",
                "sous_categorie": "Restaurant",
                "montant": 42.50,
                "date": "2024-02-04",
                "description": "Déjeuner chez Pizza Hut",
                "source": "manual",
                "compte_iban": "FR761234..."
            }
        }
