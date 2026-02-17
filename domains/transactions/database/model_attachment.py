"""
Modèle pour les pièces jointes des transactions.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class TransactionAttachment(BaseModel):
    """
    Représente un fichier attaché à une transaction.
    """
    id: Optional[int] = None
    transaction_id: int = Field(..., description="ID de la transaction parente")
    file_path: str = Field(..., description="Chemin relatif ou absolu du fichier")
    file_name: str = Field(..., description="Nom original du fichier")
    file_type: Optional[str] = Field(None, description="Type MIME ou extension")
    upload_date: datetime = Field(default_factory=datetime.now)
    size: Optional[int] = Field(None, description="Taille en octets")

    class Config:
        json_schema_extra = {
            "example": {
                "transaction_id": 123,
                "file_path": "data/attachments/2024/02/ticket_resto.jpg",
                "file_name": "ticket_resto.jpg",
                "file_type": "image/jpeg",
                "size": 10240
            }
        }
