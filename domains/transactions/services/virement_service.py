"""
Service Virement
Gère la logique métier des virements et l'accès filtré aux données.
"""

import logging
import pandas as pd
from typing import Optional, List
from datetime import date

from ..database.repository_virement import virement_repository
from ..database.model_virement import Virement

logger = logging.getLogger(__name__)

class VirementService:
    """
    Service pour la gestion des virements.
    Récupère les données brutes (DataFrame) du repository et applique filtres/transformations.
    """
    
    def __init__(self):
        self.repository = virement_repository

    def get_all_virements_df(self) -> pd.DataFrame:
        """Retourne tous les virements (DataFrame)."""
        return self.repository.get_all_virements()

    def get_virement_by_id(self, v_id: int) -> Optional[Virement]:
        """
        Récupère un virement spécifique par son ID.
        Note: Charge tout le DF pour filtrer. Si performance critique -> passer en SQL dédié.
        Pour un app perso, c'est acceptable et simplifie le repo.
        """
        df = self.repository.get_all_virements()
        if df.empty:
            return None
        
        row = df[df['id'] == v_id]
        if row.empty:
            return None
        
        # Mapping Dict -> Obj
        data = row.iloc[0].to_dict()
        return self._map_row_to_model(data)

    def _map_row_to_model(self, row: dict) -> Virement:
        """Helper mapping DataFrame row -> Virement Model"""
        # Pandarallel NaN handling
        row = {k: (None if pd.isna(v) else v) for k, v in row.items()}
        
        return Virement(
            id=row['id'],
            date=row['date'],
            description=row.get('description'),
            amount=float(row['amount']),
            iban_source=row.get('iban_source'),
            iban_destination=row.get('iban_destination'),
            external_id_source=row.get('external_id_source'),
            external_id_destination=row.get('external_id_destination'),
            type=row.get('type', 'Transfert'),
            source=row.get('source', 'manual')
        )

# Instance singleton
virement_service = VirementService()
