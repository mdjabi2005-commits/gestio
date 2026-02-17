"""
Transaction Service
Gère la logique métier et les requêtes complexes pour les transactions.
Délègue toute la persistance au Repository.
"""

import logging
import pandas as pd
from datetime import date
from typing import Optional

from ..database.repository import transaction_repository
from ..database.model import Transaction

logger = logging.getLogger(__name__)


class TransactionService:
    """
    Service couche métier pour les transactions.
    Délègue au repository, ajoute uniquement de la logique métier si nécessaire.
    """

    def __init__(self):
        self.repository = transaction_repository

    def get_transaction_by_id(self, tx_id: int) -> Optional[Transaction]:
        """
        Récupère une transaction par son ID et la convertit en modèle Pydantic.
        """
        try:
            row = self.repository.get_by_id(tx_id)

            if row:
                # Utiliser le mapping du repository
                return Transaction(**row)
            return None
        except Exception as e:
            logger.error(f"Erreur get_transaction_by_id {tx_id}: {e}")
            return None

    def get_filtered_transactions_df(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        category: Optional[str] = None
    ) -> pd.DataFrame:
        """
        Récupère les transactions filtrées sous forme de DataFrame (pour l'UI).
        Mapping FR → EN pour compatibilité UI.
        """
        try:
            df = self.repository.get_filtered(
                start_date=start_date,
                end_date=end_date,
                category=category
            )

            if df.empty:
                return df

            # Mapping colonnes DB (FR) → DataFrame (EN) pour l'UI
            df = df.rename(columns={
                'categorie': 'category',
                'sous_categorie': 'subcategory',
                'montant': 'amount',
                'date_fin': 'end_date'
            })

            return df

        except Exception as e:
            logger.error(f"Erreur get_filtered_transactions_df: {e}")
            return self.repository._get_empty_df()


# Instance singleton
transaction_service = TransactionService()
